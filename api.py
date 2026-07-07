from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
import sys

# Add the current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the existing ML pipeline from demo.py
try:
    from demo import segment_video
except ImportError as e:
    print(f"Warning: Could not import segment_video from demo.py. Error: {e}")
    # Dummy fallback for testing if demo.py is broken
    def segment_video(path, prompt, gpu):
        return path

app = FastAPI(title="FindTrack-R³ API")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure required directories exist
os.makedirs('temp_uploads', exist_ok=True)
os.makedirs('frontend', exist_ok=True)
os.makedirs('sample', exist_ok=True)

@app.post("/api/segment")
async def process_video(
    video: UploadFile = File(...),
    prompt: str = Form(...),
    gpu: str = Form("0")
):
    """
    Endpoint to receive video + text prompt, process it using FindTrack-R3,
    and return the segmented video.
    """
    input_path = ""
    try:
        # 1. Save uploaded video to temp directory
        temp_id = str(uuid.uuid4())
        ext = os.path.splitext(video.filename)[1]
        if not ext:
            ext = '.mp4'
        input_path = f"temp_uploads/{temp_id}_input{ext}"
        
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
            
        print(f"🎬 Received Video: {video.filename}")
        print(f"📝 Text Prompt: '{prompt}'")
        print(f"⚙️ Target GPU: {gpu}")
        print(f"⏳ Processing...")
        
        # 2. Call the ML pipeline
        # segment_video inherently saves output to 'sample/result.mp4' and returns the path
        output_path = segment_video(input_path, prompt, gpu)
        
        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="Processing failed, output not found.")
            
        print(f"✅ Processing Complete! Sending video to frontend.")
        
        # 3. Return the processed video file
        return FileResponse(
            output_path, 
            media_type="video/mp4", 
            filename=f"segmented_{video.filename}"
        )
        
    except Exception as e:
        import traceback
        print(f"❌ Error during processing:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup uploaded input file
        if os.path.exists(input_path):
            os.remove(input_path)

# Serve the static frontend files (HTML/CSS/JS)
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if not full_path or full_path == "/":
        return FileResponse("frontend/index.html")
        
    # Check if the exact file exists (e.g. css, js, images)
    file_path = os.path.join("frontend", full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
        
    # Check if a .html version exists (for Next.js routes like /dashboard -> dashboard.html)
    html_path = f"{file_path}.html"
    if os.path.exists(html_path) and os.path.isfile(html_path):
        return FileResponse(html_path)
        
    # Fallback to 404
    return FileResponse("frontend/404.html", status_code=404)

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("🚀 FindTrack-R³ Server is Running!")
    print("🌐 Open http://localhost:8000 in your browser.")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
