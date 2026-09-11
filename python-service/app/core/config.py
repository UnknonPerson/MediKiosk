"""Python service configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Service configuration
    app_name: str = "Vaidyam Document Processing Service"
    app_version: str = "1.0.0"
    debug: bool = False

    # Internal authentication
    internal_service_token: str = ""

    # Processing configuration
    max_file_size_bytes: int = 10 * 1024 * 1024  # 10MB default
    processing_timeout_seconds: int = 120
    document_upload_dir: str = "uploads/documents"

    # OCR configuration
    tesseract_cmd: str = ""  # Optional path to tesseract executable
    poppler_path: str = ""   # Optional path to poppler bin directory

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
