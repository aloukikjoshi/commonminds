from fastapi import APIRouter, UploadFile, File, HTTPException
import os
from uuid import uuid4
import cloudinary
import cloudinary.uploader

router = APIRouter()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

@router.post("/image", response_model=dict)
async def upload_image(file: UploadFile = File(...)):
    try:
        # Validate file
        if file.filename is None:
            raise HTTPException(status_code=400, detail="Uploaded file must have a filename")
        
        # Check file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        # Generate a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        public_id = f"commonminds/{uuid4()}"
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            public_id=public_id,
            folder="commonminds",
            resource_type="image"
        )
        
        # Return the secure URL
        return {"url": result["secure_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")
