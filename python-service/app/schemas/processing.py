"""Processing request and response schemas."""

from typing import Optional

from pydantic import BaseModel, Field


class ProcessingRequest(BaseModel):
    """Request payload for document processing."""

    # Storage reference (controlled by Node backend)
    storage_key: str = Field(..., description="Document storage key from Node backend")

    # Document metadata
    mime_type: str = Field(..., description="Document MIME type")
    original_filename: str = Field(..., description="Original filename for reference")

    # Processing options
    enable_ocr_fallback: bool = Field(
        default=True, description="Enable OCR fallback for PDFs without embedded text"
    )


class ProcessingResult(BaseModel):
    """Result of document processing."""

    extracted_text: Optional[str] = Field(
        default=None, description="Extracted text content"
    )
    character_count: int = Field(default=0, description="Number of characters extracted")
    page_count: Optional[int] = Field(
        default=None, description="Number of pages processed (PDF only)"
    )
    processing_method: str = Field(
        default="", description="Method used: 'native', 'ocr', or 'none'"
    )


class ProcessingResponse(BaseModel):
    """Response payload after processing."""

    success: bool = Field(..., description="Whether processing succeeded")
    result: Optional[ProcessingResult] = Field(
        default=None, description="Processing result on success"
    )
    error: Optional[str] = Field(
        default=None, description="Error message on failure"
    )
    error_code: Optional[str] = Field(
        default=None, description="Error code for programmatic handling"
    )
