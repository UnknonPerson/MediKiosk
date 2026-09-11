"""PDF text extraction service."""

import logging
from typing import Optional, Tuple

import pdfplumber
from pdf2image import convert_from_path

from ..core.config import settings

logger = logging.getLogger(__name__)


class PDFService:
    """Service for PDF text extraction."""

    def __init__(self):
        """Initialize PDF service."""
        self.min_text_threshold = 50  # Minimum characters to consider text meaningful

    def extract_text(self, file_path: str) -> Tuple[Optional[str], int, str]:
        """
        Extract text from PDF file.

        Returns:
            Tuple of (extracted_text, page_count, method_used)
        """
        try:
            # First attempt: native text extraction
            text, page_count = self._extract_native_text(file_path)

            if text and len(text.strip()) >= self.min_text_threshold:
                logger.info(
                    "Native PDF text extraction succeeded",
                    extra={"char_count": len(text), "pages": page_count}
                )
                return text, page_count, "native"

            logger.info(
                "PDF has insufficient native text, needs OCR fallback",
                extra={"char_count": len(text) if text else 0}
            )
            return None, page_count, "none"

        except Exception as error:
            logger.error(f"PDF text extraction failed: {error}")
            raise

    def _extract_native_text(self, file_path: str) -> Tuple[Optional[str], int]:
        """Extract embedded text from PDF using pdfplumber."""
        text_parts = []
        page_count = 0

        try:
            with pdfplumber.open(file_path) as pdf:
                page_count = len(pdf.pages)

                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)

            full_text = "\n\n".join(text_parts) if text_parts else None
            return full_text, page_count

        except Exception as error:
            logger.error(f"Native PDF extraction error: {error}")
            return None, 0

    def convert_to_images(
        self, file_path: str, max_pages: int = 50
    ) -> list:
        """
        Convert PDF pages to images for OCR processing.

        Args:
            file_path: Path to PDF file
            max_pages: Maximum number of pages to convert

        Returns:
            List of PIL Image objects
        """
        try:
            images = convert_from_path(
                file_path,
                first_page=1,
                last_page=max_pages,
                dpi=200,  # Good balance between quality and performance
            )
            logger.info(f"Converted {len(images)} PDF pages to images")
            return images

        except Exception as error:
            logger.error(f"PDF to image conversion failed: {error}")
            raise
