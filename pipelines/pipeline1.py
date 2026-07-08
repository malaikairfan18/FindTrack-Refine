import torch
import torch.nn as nn
import torch.nn.functional as F

class DinoV2Fusion(nn.Module):
    def __init__(self, fusion_type='weighted_sum', dinov2_model_name='vit_small_patch14_dinov2.lvd142m', sam_embed_dim=256):
        """
        DINOv2 Feature Fusion module for Pipeline 1 (Parameter-free / Training-free).
        Fuses DINOv2 visual features with SAM's visual embeddings.
        
        Args:
            fusion_type (str): Ignored, kept for API compatibility.
            dinov2_model_name (str): Ignored, kept for API compatibility.
            sam_embed_dim (int): Embedding dimension of SAM (usually 256).
        """
        super(DinoV2Fusion, self).__init__()
        self.sam_embed_dim = sam_embed_dim
        
        # Load DINOv2 via torch.hub (independent of local timm version)
        print("Loading DINOv2 model via torch.hub: facebookresearch/dinov2 -> dinov2_vits14")
        self.dinov2 = torch.hub.load('facebookresearch/dinov2', 'dinov2_vits14')
        for param in self.dinov2.parameters():
            param.requires_grad = False
            
    def extract_dinov2_features(self, x):
        """
        Extracts dense visual feature maps from DINOv2.
        """
        # Normalize to standard ImageNet normalization
        mean = torch.tensor([0.485, 0.456, 0.406], device=x.device).view(1, 3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225], device=x.device).view(1, 3, 1, 1)
        dino_in = (x - mean) / std
        
        with torch.no_grad():
            features = self.dinov2.forward_features(dino_in)
            if isinstance(features, dict):
                patch_features = features["x_norm_patchtokens"]
            else:
                patch_features = features[:, 1:, :] # fallback
                
        B, N, C = patch_features.shape
        grid_size = int(N ** 0.5)
        
        # Reshape sequence of tokens to 2D spatial feature map
        patch_features = patch_features.transpose(1, 2).reshape(B, C, grid_size, grid_size)
        return patch_features
        
    def forward(self, sam_embeddings, raw_images_for_dino):
        """
        Fuses DINOv2 features with SAM embeddings in a completely training-free manner.
        """
        # 1. Extract raw DINOv2 features [B, 384, grid_size, grid_size]
        dino_feats = self.extract_dinov2_features(raw_images_for_dino)
        
        # 2. Slice channels to match SAM embedding dimension (256) - Parameter-free!
        dino_feats = dino_feats[:, :self.sam_embed_dim, :, :]
        
        # 3. Spatial interpolation to match SAM's 64x64 resolution
        dino_feats = F.interpolate(dino_feats, size=(64, 64), mode='bilinear', align_corners=False)
        
        # 4. Perform weighted addition (alpha=0.3) - Parameter-free!
        alpha = 0.3
        fused_embeddings = (1.0 - alpha) * sam_embeddings + alpha * dino_feats
        
        return fused_embeddings
