import os
import asyncio
from app.core.logging import get_logger
import tempfile
import cloudinary
import cloudinary.uploader
from typing import Tuple
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from app.config import settings

logger = get_logger(__name__)

# Config
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

cloudinary.config(
    cloud_name=settings.CLOUDINARY_API_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

async def upload_image_to_cloudinary(file: UploadFile) -> Tuple[str, str]:
    # 1. Basic Validation
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS or file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. JPG, PNG, WEBP only.")

    temp_path = None
    try:
        # 2. Secure Temp File Creation
        fd, temp_path = tempfile.mkstemp(suffix=file_ext)
        
        size = 0
        with os.fdopen(fd, 'wb') as tmp:
            while chunk := await file.read(1024 * 64):
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    raise HTTPException(status_code=413, detail="File too large (Max 5MB)")
                tmp.write(chunk)

        # 3. Upload to Cloudinary
        loop = asyncio.get_running_loop()
        upload_options = {
            "folder": "wellnes/user",
            "resource_type": "image",
            "transformation": [
                {
                    "width": 500, "height": 500, 
                    "crop": "fill", "gravity": "face", 
                    "quality": "auto", "fetch_format": "auto"
                }
            ]
        }

        result = await loop.run_in_executor(
            None, lambda: cloudinary.uploader.upload(temp_path, **upload_options)
        )
        return result["secure_url"], result["public_id"]

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)