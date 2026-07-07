import os
import json
import numpy as np
import cv2
from PIL import Image
from tqdm import tqdm

def db_eval_iou(annotation, segmentation):
    """ Compute region similarity (Jaccard index) """
    intersection = np.logical_and(annotation, segmentation).sum()
    union = np.logical_or(annotation, segmentation).sum()
    if union == 0:
        return np.nan
    return intersection / union

def get_boundary(mask, thickness):
    kernel = np.ones((thickness, thickness), np.uint8)
    eroded = cv2.erode(mask.astype(np.uint8), kernel, iterations=1)
    boundary = mask.astype(np.uint8) - eroded
    return boundary

def db_eval_boundary(annotation, segmentation, bound_th):
    """ Compute boundary similarity (F-measure) """
    seg_boundary = get_boundary(segmentation, thickness=1)
    ann_boundary = get_boundary(annotation, thickness=1)
    
    kernel = np.ones((bound_th, bound_th), np.uint8)
    seg_dilated = cv2.dilate(seg_boundary, kernel)
    ann_dilated = cv2.dilate(ann_boundary, kernel)
    
    # Precision
    match_seg = np.logical_and(seg_boundary, ann_dilated).sum()
    total_seg = seg_boundary.sum()
    P = match_seg / total_seg if total_seg > 0 else 0
    
    # Recall
    match_ann = np.logical_and(ann_boundary, seg_dilated).sum()
    total_ann = ann_boundary.sum()
    R = match_ann / total_ann if total_ann > 0 else 0
    
    if P + R == 0:
        return 0.0
    return 2 * P * R / (P + R)

def evaluate_ytvos(pred_dir, gt_dir, meta_file):
    print("Loading meta expressions...")
    with open(meta_file, 'r') as f:
        meta_data = json.load(f)['videos']
        
    j_scores = []
    f_scores = []
    
    video_list = sorted(os.listdir(pred_dir))
    for video in tqdm(video_list, desc="Evaluating Videos"):
        if video not in meta_data:
            continue
            
        video_pred_path = os.path.join(pred_dir, video)
        video_gt_path = os.path.join(gt_dir, video)
        
        if not os.path.isdir(video_pred_path):
            continue
            
        expressions = meta_data[video]['expressions']
        
        for exp_id, exp_dict in expressions.items():
            exp_pred_path = os.path.join(video_pred_path, exp_id)
            if not os.path.exists(exp_pred_path):
                continue
                
            if 'obj_id' in exp_dict:
                obj_id = int(exp_dict['obj_id'])
            else:
                obj_id = int(exp_id)
            
            for frame_file in os.listdir(exp_pred_path):
                if not frame_file.endswith('.png'):
                    continue
                    
                pred_path = os.path.join(exp_pred_path, frame_file)
                gt_path = os.path.join(video_gt_path, frame_file)
                
                if not os.path.exists(gt_path):
                    continue
                    
                # Read masks
                pred_mask = np.array(Image.open(pred_path))
                gt_mask = np.array(Image.open(gt_path))
                
                # Convert predictions to binary (assume > 0 is foreground)
                pred_binary = (pred_mask > 0).astype(np.uint8)
                
                # Extract specific object from GT (palette index == obj_id)
                gt_binary = (gt_mask == obj_id).astype(np.uint8)
                
                h, w = gt_binary.shape
                bound_th = max(round(0.008 * np.sqrt(w*w + h*h)), 1)
                
                # Calculate J and F
                j = db_eval_iou(gt_binary, pred_binary)
                if not np.isnan(j):
                    j_scores.append(j)
                    
                f = db_eval_boundary(gt_binary, pred_binary, bound_th=int(bound_th))
                f_scores.append(f)

    if len(j_scores) == 0:
        print("No valid frames evaluated. Check your paths!")
        return
        
    mean_j = np.mean(j_scores)
    mean_f = np.mean(f_scores)
    mean_jf = (mean_j + mean_f) / 2.0
    
    print("\n" + "="*40)
    print("Ref-Youtube-VOS Local Evaluation Results")
    print("="*40)
    print(f"J-Mean (Region Similarity):  {mean_j:.4f}")
    print(f"F-Mean (Boundary Score):   {mean_f:.4f}")
    print(f"J&F-Mean (Overall Score):  {mean_jf:.4f}")
    print("="*40)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description="Evaluate J&F for Ref-Youtube-VOS")
    parser.add_argument('--pred_dir', type=str, default='outputs/Ref_YTVOS_val', help='Path to predictions folder')
    parser.add_argument('--gt_dir', type=str, default='../DB/RVOS/YTVOS/valid/Annotations', help='Path to GT Annotations folder')
    parser.add_argument('--meta_file', type=str, default='../DB/RVOS/YTVOS/meta_expressions/valid/meta_expressions.json', help='Path to meta_expressions.json')
    
    args = parser.parse_args()
    evaluate_ytvos(args.pred_dir, args.gt_dir, args.meta_file)
