"""Main document processor coordinating PDF and OCR services."""

import logging
import os
from typing import Optional, Tuple

from ..core.config import settings
from ..schemas.processing import ProcessingResult
from .ocr_service import OCRService
from .pdf_service import PDFService

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Main document processing coordinator."""

    def __init__(self, upload_directory: str):
        """
        Initialize document processor.

        Args:
            upload_directory: Base directory for uploaded documents
        """
        self.upload_directory = upload_directory
        self.pdf_service = PDFService()
        self.ocr_service = OCRService()

        # Supported MIME types
        self.supported_types = {
            "application/pdf": self._process_pdf,
            "image/jpeg": self._process_image,
            "image/png": self._process_image,
        }

    def process(
        self,
        storage_key: str,
        mime_type: str,
        original_filename: str,
        enable_ocr_fallback: bool = True,
    ) -> ProcessingResult:
        """
        Process a document and extract text.

        Args:
            storage_key: Secure storage key from Node backend
            mime_type: Document MIME type
            original_filename: Original filename for logging
            enable_ocr_fallback: Whether to use OCR for PDFs without text

        Returns:
            ProcessingResult with extracted text and metadata
        """
        # Validate storage key (prevent path traversal)
        if not self._is_valid_storage_key(storage_key):
            logger.error(f"Invalid storage key rejected: {storage_key}")
            return ProcessingResult(
                extracted_text=None,
                character_count=0,
                processing_method="none",
            )

        # Resolve file path safely
        file_path = self._resolve_file_path(storage_key)
        if not file_path or not os.path.exists(file_path):
            logger.error(f"Document file not found: {storage_key}")
            return ProcessingResult(
                extracted_text=None,
                character_count=0,
                processing_method="none",
            )

        # Validate file size
        file_size = os.path.getsize(file_path)
        if file_size > settings.max_file_size_bytes:
            logger.error(
                f"File exceeds maximum size: {file_size} > {settings.max_file_size_bytes}"
            )
            return ProcessingResult(
                extracted_text=None,
                character_count=0,
                processing_method="none",
            )

        # Validate MIME type
        if mime_type not in self.supported_types:
            logger.error(f"Unsupported MIME type: {mime_type}")
            return ProcessingResult(
                extracted_text=None,
                character_count=0,
                processing_method="none",
            )

        try:
            logger.info(
                f"Processing document: {original_filename}",
                extra={
                    "mime_type": mime_type,
                    "storage_key": storage_key,
                    "file_size": file_size,
                }
            )

            # Route to appropriate processor
            processor = self.supported_types[mime_type]
            text, page_count, method = processor(
                file_path, enable_ocr_fallback=enable_ocr_fallback
            )

            character_count = len(text) if text else 0

            logger.info(
                f"Document processing complete",
                extra={
                    "method": method,
                    "characters": character_count,
                    "pages": page_count,
                }
            )

            return ProcessingResult(
                extracted_text=text,
                character_count=character_count,
                page_count=page_count,
                processing_method=method,
            )

        except Exception as error:
            logger.error(f"Document processing failed: {error}")
            return ProcessingResult(
                extracted_text=None,
                character_count=0,
                processing_method="none",
            )

    def _process_pdf(
        self, file_path: str, enable_ocr_fallback: bool = True
    ) -> Tuple[Optional[str], Optional[int], str]:
        """Process PDF document."""
        # First, try native text extraction
        text, page_count, method = self.pdf_service.extract_text(file_path)

        if text and len(text.strip()) > 0:
            return text, page_count, method

        # If no text and OCR fallback enabled, use OCR
        if enable_ocr_fallback:
            logger.info("Using OCR fallback for PDF")
            try:
                images = self.pdf_service.convert_to_images(file_path)
                if images:
                    ocr_text = self.ocr_service.extract_text_from_images(images)
                    return ocr_text, len(images), "ocr"
            except Exception as error:
                logger.error(f"OCR fallback failed: {error}")

        return None, page_count, "none"

    def _process_image(
        self, file_path: str, enable_ocr_fallback: bool = True
    ) -> Tuple[Optional[str], Optional[int], str]:
        """Process image document using OCR."""
        try:
            text = self.ocr_service.process_image_file(file_path)
            return text, None, "ocr"
        except Exception as error:
            logger.error(f"Image OCR failed: {error}")
            return None, None, "none"

    def _is_valid_storage_key(self, storage_key: str) -> bool:
        """
        Validate storage key to prevent path traversal.

        Args:
            storage_key: Storage key to validate

        Returns:
            True if valid, False otherwise
        """
        # Reject empty keys
        if not storage_key:
            return False

        # Reject absolute paths
        if os.path.isabs(storage_key):
            return False

        # Reject path traversal attempts
        if ".." in storage_key:
            return False

        # Reject paths with backslashes (Windows path traversal)
        if "\\" in storage_key:
            return False

        # Should be in format: patientId/uuid.extension
        parts = storage_key.split("/")
        if len(parts) != 2:
            return False

        return True

    def _resolve_file_path(self, storage_key: str) -> Optional[str]:
        """
        Safely resolve storage key to file path.

        Args:
            storage_key: Validated storage key

        Returns:
            Resolved file path or None if invalid
        """
        try:
            base_path = os.path.abspath(self.upload_directory)
            file_path = os.path.abspath(os.path.join(base_path, storage_key))

            # Ensure resolved path is within upload directory
            if not file_path.startswith(base_path + os.sep):
                logger.error(f"Path traversal attempt blocked: {storage_key}")
                return None

            return file_path

        except Exception as error:
            logger.error(f"Path resolution failed: {error}")
            return None
