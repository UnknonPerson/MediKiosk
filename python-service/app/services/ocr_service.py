"""OCR service for image text extraction."""

import logging
from typing import List, Optional

from PIL import Image

from ..core.config import settings

logger = logging.getLogger(__name__)


class OCRService:
    """Service for OCR text extraction from images."""

    def __init__(self):
        """Initialize OCR service."""
        self._configure_tesseract()

    def _configure_tesseract(self):
        """Configure Tesseract path if provided."""
        if settings.tesseract_cmd:
            import pytesseract
            pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd
            logger.info(f"Tesseract configured with custom path: {settings.tesseract_cmd}")

    def extract_text_from_image(self, image: Image.Image) -> str:
        """
        Extract text from a PIL Image using OCR.

        Args:
            image: PIL Image object

        Returns:
            Extracted text string
        """
        try:
            import pytesseract

            # Configure OCR options for better medical document handling
            custom_config = r'--oem 3 --psm 6'

            text = pytesseract.image_to_string(image, config=custom_config)
            return text.strip()

        except Exception as error:
            logger.error(f"OCR extraction failed: {error}")
            raise

    def extract_text_from_images(self, images: List[Image.Image]) -> str:
        """
        Extract text from multiple images and combine.

        Args:
            images: List of PIL Image objects

        Returns:
            Combined extracted text
        """
        text_parts = []

        for idx, image in enumerate(images):
            try:
                page_text = self.extract_text_from_image(image)
                if page_text:
                    text_parts.append(f"[Page {idx + 1}]\n{page_text}")
            except Exception as error:
                logger.warning(f"OCR failed for page {idx + 1}: {error}")
                continue

        combined_text = "\n\n".join(text_parts)
        return combined_text

    def process_image_file(self, file_path: str) -> str:
        """
        Process an image file directly.

        Args:
            file_path: Path to image file

        Returns:
            Extracted text
        """
        try:
            with Image.open(file_path) as image:
                # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
                if image.mode != "RGB":
                    image = image.convert("RGB")

                return self.extract_text_from_image(image)

        except Exception as error:
            logger.error(f"Image file processing failed: {error}")
            raise
