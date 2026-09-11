"""Internal processing routes."""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, status

from ..core.config import settings
from ..schemas.processing import ProcessingRequest, ProcessingResponse, ProcessingResult
from ..services.document_processor import DocumentProcessor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/internal", tags=["processing"])


def verify_internal_token(
    authorization: Optional[str] = Header(default=None, alias="Authorization")
) -> str:
    """
    Verify internal service token.

    Raises HTTPException if token is missing or invalid.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )

    token = authorization[7:]  # Remove "Bearer " prefix

    if not settings.internal_service_token:
        logger.error("Internal service token not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Service misconfiguration",
        )

    if token != settings.internal_service_token:
        logger.warning("Invalid internal service token attempt")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid service token",
        )

    return token


@router.post(
    "/process-document",
    response_model=ProcessingResponse,
    status_code=status.HTTP_200_OK,
)
async def process_document(
    request: ProcessingRequest,
    _: str = Depends(verify_internal_token),
) -> ProcessingResponse:
    """
    Process an uploaded document and extract text.

    This endpoint is only accessible to the Node.js backend
    with a valid internal service token.

    Args:
        request: Processing request with storage key and metadata

    Returns:
        Processing response with extracted text or error
    """
    # Upload directory (single source of truth from settings)
    upload_directory = settings.document_upload_dir

    # Initialize processor
    processor = DocumentProcessor(upload_directory=upload_directory)

    try:
        result = processor.process(
            storage_key=request.storage_key,
            mime_type=request.mime_type,
            original_filename=request.original_filename,
            enable_ocr_fallback=request.enable_ocr_fallback,
        )

        if result.extracted_text is None and result.processing_method == "none":
            return ProcessingResponse(
                success=False,
                error="Unable to extract text from document",
                error_code="EXTRACTION_FAILED",
            )

        return ProcessingResponse(
            success=True,
            result=result,
        )

    except Exception as error:
        logger.error(f"Document processing error: {error}")
        return ProcessingResponse(
            success=False,
            error="Document processing failed",
            error_code="PROCESSING_ERROR",
        )
