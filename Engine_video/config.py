import os
from pathlib import Path

# API Configuration
API_KEY = os.getenv("API_KEY", "your-secure-api-key-123")


BASE_DIR = Path(__file__).resolve().parent


def _resolve_dir(env_key: str, default: str) -> str:
    """Resolve directory paths to absolute locations for cross-service access."""

    configured = os.getenv(env_key)
    if configured:
        return os.path.abspath(configured)

    return str((BASE_DIR / default).resolve())


# Directory Configuration
INPUT_DIR = _resolve_dir("INPUT_DIR", "uploads")
OUTPUT_DIR = _resolve_dir("OUTPUT_DIR", "outputs")

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# FFmpeg Configuration
FFMPEG_TIMEOUT = int(os.getenv("FFMPEG_TIMEOUT", "300"))  # 5 minutes default
FFMPEG_PATH = os.getenv("FFMPEG_PATH")
