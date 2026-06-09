from evfsam.segment_anything.utils.transforms import ResizeLongestSide
from evfsam.evf_sam import EvfSamModel
import numpy as np
import torch
import torch.nn.functional as F
from torchvision import transforms
from torchvision.transforms.functional import InterpolationMode
from transformers import AutoTokenizer, BitsAndBytesConfig


def sam_preprocess(x: np.ndarray, pixel_mean=torch.Tensor([123.675, 116.28, 103.53]).view(-1, 1, 1),
                   pixel_std=torch.Tensor([58.395, 57.12, 57.375]).view(-1, 1, 1), img_size=1024):

    # Normalize colors
    x = ResizeLongestSide(img_size).apply_image(x)
    h, w = resize_shape = x.shape[:2]
    x = torch.from_numpy(x).permute(2, 0, 1).contiguous()
    x = (x - pixel_mean) / pixel_std

    # Pad
    padh = img_size - h
    padw = img_size - w
    x = F.pad(x, (0, padw, 0, padh))
    return x, [resize_shape]


def beit3_preprocess(x: np.ndarray, img_size=224) -> torch.Tensor:
    beit_preprocess = transforms.Compose([
        transforms.ToTensor(),
        transforms.Resize((img_size, img_size), interpolation=InterpolationMode.BICUBIC),
        transforms.Normalize(mean=(0.5, 0.5, 0.5), std=(0.5, 0.5, 0.5))
    ])
    return beit_preprocess(x)


def init_models():
    tokenizer = AutoTokenizer.from_pretrained('YxZhang/evf-sam-multitask', padding_side='right', use_fast=False)
    evfsam = EvfSamModel.from_pretrained('YxZhang/evf-sam-multitask', low_cpu_mem_usage=True, cache_dir='../huggingface')
    evfsam = evfsam.cuda()
    evfsam.eval()
    return tokenizer, evfsam


def compute_clip_similarity(clip, clip_preprocess, clip_preprocess_mask, image_np, mask_tensor, clip_text, mode="mask_crop"):
    """
    Computes the CLIP similarity score for a candidate mask.
    Modes:
    - 'full_frame': Alpha-CLIP on the full frame using the mask as the alpha/attention channel.
    - 'object_box_crop': Crop the bounding box of the mask, and run CLIP on the crop.
    - 'mask_crop': Crop the bounding box of the mask, set all background pixels (outside the mask) to zero, and run CLIP on the crop.
    """
    from PIL import Image

    # Reshape mask tensor if needed
    if len(mask_tensor.shape) == 2:
        mask_tensor = mask_tensor.unsqueeze(0)  # [1, H, W]
    elif len(mask_tensor.shape) == 3 and mask_tensor.shape[0] > 1:
        mask_tensor = mask_tensor.mean(dim=0, keepdim=True)  # average channels if multi-channel

    mask_np = (mask_tensor.squeeze(0) > 0.5).cpu().numpy().astype(np.uint8)
    H, W = mask_np.shape

    # 1. Full Frame mode
    if mode == "full_frame":
        pil_img = Image.fromarray(image_np)
        img_clip = clip_preprocess(pil_img).unsqueeze(0).cuda()
        alpha = clip_preprocess_mask(mask_tensor).cuda()
        
        image_features = clip.visual(img_clip, alpha.unsqueeze(0))
        text_features = clip.encode_text(clip_text)
        
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        return torch.matmul(image_features, text_features.transpose(0, 1))[0]

    # Find bounding box
    y_indices, x_indices = np.where(mask_np > 0)
    if len(y_indices) > 0:
        ymin, ymax = y_indices.min(), y_indices.max()
        xmin, xmax = x_indices.min(), x_indices.max()
        
        # Add 10% padding
        h_box, w_box = ymax - ymin, xmax - xmin
        pad_y = int(h_box * 0.1)
        pad_x = int(w_box * 0.1)
        ymin = max(0, ymin - pad_y)
        ymax = min(H - 1, ymax + pad_y)
        xmin = max(0, xmin - pad_x)
        xmax = min(W - 1, xmax + pad_x)
    else:
        # Fallback if mask is empty
        ymin, ymax, xmin, xmax = 0, H - 1, 0, W - 1

    # 2. Object Box Crop
    if mode == "object_box_crop":
        crop_np = image_np[ymin:ymax+1, xmin:xmax+1]
        pil_crop = Image.fromarray(crop_np)
        img_clip = clip_preprocess(pil_crop).unsqueeze(0).cuda()
        
        # All ones mask for crop
        ones_mask = torch.ones((1, ymax-ymin+1, xmax-xmin+1), dtype=torch.float32)
        alpha = clip_preprocess_mask(ones_mask).cuda()
        
        image_features = clip.visual(img_clip, alpha.unsqueeze(0))
        text_features = clip.encode_text(clip_text)
        
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        return torch.matmul(image_features, text_features.transpose(0, 1))[0]

    # 3. Mask Crop
    elif mode == "mask_crop":
        # Zero out pixels outside the mask
        masked_img_np = image_np * mask_np[:, :, np.newaxis]
        crop_np = masked_img_np[ymin:ymax+1, xmin:xmax+1]
        
        pil_crop = Image.fromarray(crop_np)
        img_clip = clip_preprocess(pil_crop).unsqueeze(0).cuda()
        
        # Crop the mask itself for Alpha-CLIP
        mask_crop_np = mask_np[ymin:ymax+1, xmin:xmax+1].astype(np.float32)
        mask_crop_tensor = torch.from_numpy(mask_crop_np).unsqueeze(0)
        alpha = clip_preprocess_mask(mask_crop_tensor).cuda()
        
        image_features = clip.visual(img_clip, alpha.unsqueeze(0))
        text_features = clip.encode_text(clip_text)
        
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        return torch.matmul(image_features, text_features.transpose(0, 1))[0]

    else:
        raise ValueError(f"Unknown mode: {mode}")


class RvosRefiner:
    def __init__(self, epsilon: float = 0.2, overlap_mode: str = "argmax"):
        """
        epsilon: Entropy confidence threshold (eq 8 in ReSAM paper).
        overlap_mode: 'hard_discard' (ReSAM paper eq 10) or 'argmax' (standard VOS).
        """
        self.epsilon = epsilon
        self.overlap_mode = overlap_mode

    def entropy_denoise(self, logits: torch.Tensor) -> torch.Tensor:
        """
        Cleans up a single raw logit mask using Shannon Entropy.
        Input: logits of shape [1, H, W] or [H, W]
        Output: Binary mask of shape [1, H, W] with low-confidence pixels filtered out.
        """
        # Ensure tensor is float32 on GPU and has [1, H, W] shape
        if len(logits.shape) == 2:
            logits = logits.unsqueeze(0)
            
        prob = torch.sigmoid(logits)
        
        # Clamp probability to prevent log(0) or log(1) issues
        prob_clamp = torch.clamp(prob, min=1e-6, max=1.0 - 1e-6)
        
        # Calculate normalized Shannon Entropy: H = - [p * log2(p) + (1-p) * log2(1-p)]
        entropy = - (prob_clamp * torch.log2(prob_clamp) + (1.0 - prob_clamp) * torch.log2(1.0 - prob_clamp))
        
        # Confident pixel selection: Prob * (1 - Entropy) > epsilon
        confident_mask = (prob * (1.0 - entropy) > self.epsilon).float()
        return confident_mask

    def suppress_overlaps(self, prob_list: list, confident_masks: list) -> list:
        """
        Resolves pixel conflicts when multiple referring expressions claim the same pixel.
        prob_list: List of soft probability tensors [1, H, W] (after sigmoid of logits) for each object.
        confident_masks: List of refined binary masks [1, H, W] (after entropy_denoise).
        """
        if len(confident_masks) <= 1:
            return confident_masks
            
        stacked_conf = torch.stack(confident_masks, dim=0)  # [K, 1, H, W]
        stacked_prob = torch.stack(prob_list, dim=0)        # [K, 1, H, W]
        K = len(confident_masks)
        
        # Count how many objects claim each pixel
        claim_count = stacked_conf.sum(dim=0, keepdim=True)  # [1, 1, H, W]
        overlap_mask = (claim_count > 1).float()            # [1, 1, H, W]
        
        if self.overlap_mode == "hard_discard":
            # ReSAM Paper: Discard disputed pixels entirely
            refined_masks = stacked_conf * (1.0 - overlap_mask)
            
        elif self.overlap_mode == "argmax":
            # VOS optimization: Assign disputed pixels to the object with the highest probability
            max_prob_indices = torch.argmax(stacked_prob, dim=0, keepdim=True) # [1, 1, H, W]
            
            refined_masks = []
            for k in range(K):
                # Pixel is valid if: (claimed by 1 object) OR (is overlap AND this object has max probability)
                is_max = (max_prob_indices == k).float()
                valid_pixel = (stacked_conf[k] * (1.0 - overlap_mask)) + (overlap_mask * is_max * stacked_conf[k])
                refined_masks.append(valid_pixel)
            return refined_masks
            
        else:
            raise ValueError(f"Unknown overlap mode: {self.overlap_mode}")
            
        return [refined_masks[k] for k in range(K)]

    def refine_candidates(self, raw_logits_list: list) -> list:
        """
        Performs the complete Refine loop (Denoise + Overlap Suppression) on all expressions.
        raw_logits_list: List of tensors of shape [1, H, W] from EVF-SAM for all expressions.
        """
        # 1. Compute soft probabilities
        probs = [torch.sigmoid(logits) for logits in raw_logits_list]
        
        # 2. Apply Entropy-based De-noising
        confident_masks = [self.entropy_denoise(logits) for logits in raw_logits_list]
        
        # 3. Resolve spatial overlaps between different targets
        refined_masks = self.suppress_overlaps(probs, confident_masks)
        return refined_masks
