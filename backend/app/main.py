from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.endpoints import auth, users, posts, upload
from app.core.config import settings

app = FastAPI(
    title="commonminds API",
    description="API for commonminds platform",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    debug=True  # Enable debug mode to see 500 errors in response
)

# Mount static files only in local environment
if not os.getenv("VERCEL"):
    from fastapi.staticfiles import StaticFiles
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS configuration
origins = [
    "https://commonminds.vercel.app",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:8000",
]

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(posts.router, prefix=f"{settings.API_V1_STR}/posts", tags=["posts"])
app.include_router(upload.router, prefix=f"{settings.API_V1_STR}/upload", tags=["upload"])

@app.get("/")
def read_root():
    return {"message": "Welcome to commonminds API"}

# Vercel serverless handler
try:
    from mangum import Mangum
    handler = Mangum(app, lifespan="off")
except ImportError:
    # Mangum not available in local development
    pass
