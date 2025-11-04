from fastapi import FastAPI, UploadFile, Form, HTTPException, Header
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import json
from processor import process_video
from config import API_KEY, INPUT_DIR, OUTPUT_DIR
from ffmpeg_utils import validate_audio_present
import uuid
from typing import Optional

app = FastAPI(title="VidPrompt Video Engine")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/process")
async def process(
    file: UploadFile,
    actions: str = Form(...),
    output_path: Optional[str] = Form(None),
    x_api_key: Optional[str] = Header(None)
):
    # API Key check (optional for development)
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")

    os.makedirs(INPUT_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Generate unique filename to avoid conflicts
    unique_id = str(uuid.uuid4())[:8]
    file_extension = os.path.splitext(
        file.filename)[1] if file.filename else '.mp4'

    # Save input file
    input_filename = f"input_{unique_id}_{file.filename}" if file.filename else f"input_{unique_id}{file_extension}"
    input_path = os.path.join(INPUT_DIR, input_filename)

    with open(input_path, "wb") as f:
        f.write(await file.read())

    # Parse actions JSON
    try:
        actions_data = json.loads(actions)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # Determine output path
    if output_path:
        final_output_path = output_path
    else:
        output_filename = f"edited_{unique_id}_{file.filename}" if file.filename else f"edited_{unique_id}{file_extension}"
        final_output_path = os.path.join(OUTPUT_DIR, output_filename)

    # Check input audio status
    input_has_audio = validate_audio_present(input_path)
    print(
        f"Input video '{file.filename}' audio: {'Present' if input_has_audio else 'Not present'}")

    # Process the video
    try:
        process_video(input_path, actions_data, final_output_path)

        # Verify audio preservation
        output_has_audio = validate_audio_present(final_output_path)
        audio_status = "preserved" if (
            input_has_audio and output_has_audio) else "lost" if input_has_audio else "none"

        return {
            "status": "success",
            "output": final_output_path,
            "audio_status": audio_status,
            "input_had_audio": input_has_audio,
            "output_has_audio": output_has_audio,
            "filename": os.path.basename(final_output_path)
        }

    except Exception as e:
        print(f"Video processing error: {e}")
        # Cleanup input file on error
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(
            status_code=500, detail=f"Video processing failed: {str(e)}")


@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download processed video file"""
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='video/mp4'
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Video Processing Engine"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
