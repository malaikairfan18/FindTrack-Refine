**FindTrack-R³: Enhancing Decoupled Referring Video Object Segmentation with an R³-Loop and Soft Semantic Alignment**

<img width="1536" height="1024" alt="ChatGPT Image Jun 30, 2026, 11_29_35 PM" src="https://github.com/user-attachments/assets/b63da927-bec4-48ef-a9ff-592a4d74e348" />

This is the official repository for the FindTrack-R³ framework. It extends the original decoupled RVOS pipeline by integrating an innovative **R³-Loop (Refine, Requery, Reinforce)** and **Soft Semantic Alignment (SSA)** to guarantee high-quality starting reference masks and maintain strict temporal consistency across the video.

## Demo Video

https://github.com/user-attachments/assets/8231ecef-d571-4111-98dc-4e79d81ca76b

## Abstract
Existing referring VOS methods typically fuse visual and textual features in a highly entangled manner, which leads to challenges in resolving ambiguous target identification and maintaining consistent mask propagation across frames.
To address these issues, we propose **FindTrack-R³**, an enhanced decoupled framework that explicitly separates object identification from mask propagation.
- **Refine & Requery**: We apply Entropy-based Refinement to filter uncertain boundary pixels from the initial EVF-SAM mask, extract a tight bounding box, and requery SAM to produce a perfectly sharp starting anchor.
- **Reinforce (SSA)**: During tracking (via Cutie), we extract L2-normalized frame embeddings and apply Soft Semantic Alignment (SSA) loss against a lightweight rolling FIFO queue. This prevents the tracking memory from drifting to distractors during partial or full occlusions.

## Setup
1. Download the datasets: [Ref-YouTube-VOS](https://codalab.lisn.upsaclay.fr/competitions/3282), [Ref-DAVIS17](https://www.mpi-inf.mpg.de/departments/computer-vision-and-machine-learning/research/video-segmentation/video-object-segmentation-with-language-referring-expressions), [MeViS](https://codalab.lisn.upsaclay.fr/competitions/15094).
2. Download [Alpha-CLIP](https://drive.google.com/file/d/1dG_j98hh7AFvhSADlhp9CpoNY-9rBHoc/view?usp=drive_link) weights and place it in the `weights/` directory.

## Running

### Testing
For Ref-YouTube-VOS dataset:
```bash
python run_ytvos.py
```
For MeViS dataset:
```bash
python run_mevis.py
```
For Ref-DAVIS17 dataset:
```bash
python run_davis.py
```
 <img width="1358" height="630" alt="Screenshot 2026-06-30 111637" src="https://github.com/user-attachments/assets/f137e080-6854-4743-bc74-702954d0de03" />

### Modern Web Application (FastAPI + Next.js)
This repository includes a production-ready, modern AI SaaS web application that provides a beautiful UI for segmenting objects using the FindTrack-R³ pipeline.

#### 1. Start the Backend (FastAPI)
The backend manages the Cutie and EVF-SAM models, serving the Next.js static files concurrently.
```bash
python api.py
```
This will start Uvicorn at `http://0.0.0.0:8000`.

#### 2. Start the Frontend (Next.js)
If you need to make changes to the frontend UI, navigate to the `rvos-frontend` directory and start the development server:
```bash
cd rvos-frontend
npm install
npm run dev
```

To build a static version to serve with FastAPI:
```bash
cd rvos-frontend
npm run build
```
**Table 1. Quantitative evaluation on the Ref-YouTube-VOS validation set, Ref-DAVIS17 dataset, and MeViS validation set.**

| Method | Publication | Ref-YouTube-VOS (J&F) | J | F | Ref-DAVIS17 (J&F) | J | F | MeViS (J&F) | J | F |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| ReferFormer [48] | CVPR'22 | 62.9 | 61.3 | 64.6 | 61.1 | 58.1 | 64.1 | 31.0 | 29.8 | 32.2 |
| SgMg [34] | ICCV'23 | 65.7 | 63.9 | 67.4 | 63.3 | 60.6 | 66.0 | - | - | - |
| HTML [19] | ICCV'23 | 63.4 | 61.5 | 65.2 | 62.1 | 59.2 | 65.1 | - | - | - |
| SOC [32] | NeurIPS'23 | 67.3 | 65.3 | 69.3 | 65.8 | 62.5 | 69.1 | - | - | - |
| VLT+TC [15] | TPAMI'23 | 62.7 | - | - | 60.3 | - | - | 35.5 | 33.6 | 37.3 |
| MUTR [51] | AAAI'24 | 68.4 | 66.4 | 70.4 | 68.0 | 64.8 | 71.3 | - | - | - |
| LoSh [54] | CVPR'24 | 67.2 | 65.4 | 69.0 | 64.3 | 61.8 | 66.8 | - | - | - |
| DsHmp [20] | CVPR'24 | 67.1 | 65.0 | 69.1 | 64.9 | 61.7 | 68.1 | 46.4 | 43.0 | 49.8 |
| VD-IT [58] | ECCV'24 | 66.5 | 64.4 | 68.5 | 69.4 | 66.2 | 72.6 | - | - | - |
| DMVS [18] | CVPR'25 | 64.3 | 62.4 | 66.2 | 65.2 | 62.2 | 68.2 | 48.6 | 44.2 | 52.9 |
| SSA [37] | CVPR'25 | 64.3 | 62.2 | 66.4 | 67.3 | 64.0 | 70.7 | 48.6 | 44.0 | 53.2 |
| SAMWISE [13] | CVPR'25 | 69.2 | 67.8 | 70.6 | 70.6 | 67.4 | 74.5 | 49.5 | 46.6 | 52.4 |
| FindTrack (N = 5) | ICCVW'25 | 70.3 | 68.6 | 72.0 | 74.2 | 69.9 | 78.5 | 47.0 | 44.3 | 49.7 |
| FindTrack (N = 10) | ICCVW'25 | 70.3 | 68.6 | 71.9 | 73.7 | 69.4 | 78.0 | 48.2 | 45.6 | 50.7 |
| FindTrack++ (N = 5) | ICCVW'25 | 73.1 | 71.2 | 75.0 | - | - | - | 52.1 | 49.4 | 54.9 |
| FindTrack++ (N = 10) | ICCVW'25 | 73.7 | 71.8 | 75.7 | - | - | - | 53.2 | 50.5 | 55.9 |
| **FindTrack-R³ (Ours)** | **2026** | **[78.48]** | **[76.99]** | **[79.98]** | **[75.63]** | **[71.67]** | **[79.67]** | **[48.3]** | **[45.6]** | **[51.0]** |


## Contact
Code and models are only available for non-commercial research purposes 
ijazu4412@gmail.com
