import torch
import torch.nn as nn
import torch.nn.functional as F
import timm

class DinoV2Fusion(nn.Module):
    def __init__(self, fusion_type='concat', dinov2_model_name='vit_small_patch14_dinov2', sam_embed_dim=256):
        """
        DINOv2 Feature Fusion module for Pipeline 1.
        Fuses DINOv2 visual features with SAM's visual embeddings.
        
        Args:
            fusion_type (str): 'concat', 'weighted_sum', or 'cross_attention'.
            dinov2_model_name (str): Timm model name for DINOv2.
            sam_embed_dim (int): Embedding dimension of SAM (usually 256).
        """
        super(DinoV2Fusion, self).__init__()
        self.fusion_type = fusion_type
        
        # 1. Initialize DINOv2 backbone
        print(f"Initializing DINOv2 backbone: {dinov2_model_name} with fusion type: {fusion_type}")
        self.dinov2 = timm.create_model(dinov2_model_name, pretrained=True)
        
        # Freeze DINOv2 weights to avoid gradient calculation/backprop overhead
        for param in self.dinov2.parameters():
            param.requires_grad = False
            
        dinov2_embed_dim = self.dinov2.embed_dim # 384 for vit_small, 768 for vit_base
        
        # 2. Projection layer to project DINOv2 features to 256 channels (sam_embed_dim)
        self.dinov2_proj = nn.Conv2d(in_channels=dinov2_embed_dim, out_channels=sam_embed_dim, kernel_size=1)
        
        # 3. Fusion components depending on fusion_type
        if fusion_type == 'concat':
            # Fuses concatenated features of shape [B, 512, 64, 64] back to [B, 256, 64, 64]
            self.fusion_layer = nn.Conv2d(in_channels=sam_embed_dim * 2, out_channels=sam_embed_dim, kernel_size=1)
        elif fusion_type == 'weighted_sum':
            # Learnable weights initialized to 0.5 each
            self.w_sam = nn.Parameter(torch.ones(1) * 0.5)
            self.w_dino = nn.Parameter(torch.ones(1) * 0.5)
        elif fusion_type == 'cross_attention':
            self.query_proj = nn.Linear(sam_embed_dim, sam_embed_dim)
            self.key_proj = nn.Linear(sam_embed_dim, sam_embed_dim)
            self.value_proj = nn.Linear(sam_embed_dim, sam_embed_dim)
            self.out_proj = nn.Linear(sam_embed_dim, sam_embed_dim)
            self.scale = 1.0 / (sam_embed_dim ** 0.5)
            
    def extract_dinov2_features(self, x):
        """
        Extracts dense visual feature maps from DINOv2.
        
        Args:
            x (torch.Tensor): Input image tensor of shape [B, 3, H, W]
        Returns:
            torch.Tensor: Feature map of shape [B, C_dino, H_patch, W_patch]
        """
        with torch.no_grad():
            # Get token embeddings from DINOv2
            features = self.dinov2.forward_features(x)
            patch_features = features[:, 1:, :] # Exclude CLS token, shape: [B, N, C_dino]
            
        B, N, C = patch_features.shape
        grid_size = int(N ** 0.5)
        
        # Reshape sequence of tokens to 2D spatial feature map
        patch_features = patch_features.transpose(1, 2).reshape(B, C, grid_size, grid_size)
        return patch_features
        
    def forward(self, sam_embeddings, raw_images_for_dino):
        """
        Fuses DINOv2 features with SAM embeddings.
        
        Args:
            sam_embeddings (torch.Tensor): Visual embeddings from SAM image encoder, shape [B, 256, 64, 64]
            raw_images_for_dino (torch.Tensor): Images resized for DINOv2, shape [B, 3, H, W]
        Returns:
            torch.Tensor: Fused visual embeddings of shape [B, 256, 64, 64]
        """
        # 1. Extract raw DINOv2 features
        dino_feats = self.extract_dinov2_features(raw_images_for_dino) # [B, dino_C, grid_size, grid_size]
        
        # 2. Project to SAM embedding dimension (256)
        dino_feats = self.dinov2_proj(dino_feats) # [B, 256, grid_size, grid_size]
        
        # 3. Bilinearly interpolate DINOv2 feature map to match SAM's 64x64 resolution
        dino_feats = F.interpolate(dino_feats, size=(64, 64), mode='bilinear', align_corners=False)
        
        # 4. Perform fusion
        if self.fusion_type == 'concat':
            concat_feats = torch.cat([sam_embeddings, dino_feats], dim=1) # [B, 512, 64, 64]
            fused_embeddings = self.fusion_layer(concat_feats) # [B, 256, 64, 64]
            
        elif self.fusion_type == 'weighted_sum':
            fused_embeddings = self.w_sam * sam_embeddings + self.w_dino * dino_feats
            
        elif self.fusion_type == 'cross_attention':
            B, C, H, W = sam_embeddings.shape
            # Flatten spatial dimensions: [B, 256, 4096] -> [B, 4096, 256]
            sam_flat = sam_embeddings.view(B, C, -1).transpose(1, 2)
            dino_flat = dino_feats.view(B, C, -1).transpose(1, 2)
            
            Q = self.query_proj(sam_flat) # [B, 4096, 256]
            K = self.key_proj(dino_flat)  # [B, 4096, 256]
            V = self.value_proj(dino_flat) # [B, 4096, 256]
            
            # Scaled Dot-Product Attention
            attn_scores = torch.matmul(Q, K.transpose(1, 2)) * self.scale # [B, 4096, 4096]
            attn_weights = F.softmax(attn_scores, dim=-1)
            
            attn_out = torch.matmul(attn_weights, V) # [B, 4096, 256]
            fused_flat = sam_flat + self.out_proj(attn_out) # Residual connection
            
            # Reshape back to 2D image layout
            fused_embeddings = fused_flat.transpose(1, 2).view(B, C, H, W)
            
        else:
            raise ValueError(f"Invalid fusion type: {self.fusion_type}")
            
        return fused_embeddings
