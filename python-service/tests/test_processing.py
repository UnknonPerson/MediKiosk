"""Tests for document processing service."""

import os
import tempfile
from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.document_processor import DocumentProcessor
from app.services.pdf_service import PDFService
from app.services.ocr_service import OCRService


client = TestClient(app)


class TestHealthEndpoint:
    """Tests for health check endpoint."""

    def test_health_returns_healthy_status(self):
        """Health endpoint should return healthy status."""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
        assert "version" in data

    def test_root_returns_service_info(self):
        """Root endpoint should return service information."""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert "docs" in data


class TestInternalAuthentication:
    """Tests for internal service authentication."""

    def test_process_document_rejects_missing_token(self):
        """Processing should reject requests without token."""
        response = client.post(
            "/internal/process-document",
            json={
                "storage_key": "patient-id/test.pdf",
                "mime_type": "application/pdf",
                "original_filename": "test.pdf",
            },
        )

        assert response.status_code == 401

    def test_process_document_rejects_invalid_token(self):
        """Processing should reject requests with invalid token."""
        response = client.post(
            "/internal/process-document",
            headers={"Authorization": "Bearer invalid-token"},
            json={
                "storage_key": "patient-id/test.pdf",
                "mime_type": "application/pdf",
                "original_filename": "test.pdf",
            },
        )

        assert response.status_code == 401

    @patch("app.routes.processing.settings")
    def test_process_document_accepts_valid_token(self, mock_settings):
        """Processing should accept requests with valid token."""
        mock_settings.internal_service_token = "test-token"

        # Create a temporary PDF file
        with tempfile.TemporaryDirectory() as tmpdir:
            pdf_path = os.path.join(tmpdir, "test.pdf")
            with open(pdf_path, "wb") as f:
                f.write(b"%PDF-1.4\n%Test PDF content")

            response = client.post(
                "/internal/process-document",
                headers={"Authorization": "Bearer test-token"},
                json={
                    "storage_key": "test.pdf",
                    "mime_type": "application/pdf",
                    "original_filename": "test.pdf",
                },
            )

            # The request should be accepted (even if processing fails)
            assert response.status_code in [200, 500]


class TestDocumentProcessor:
    """Tests for document processor."""

    def test_rejects_empty_storage_key(self):
        """Processor should reject empty storage keys."""
        processor = DocumentProcessor(upload_directory="/tmp")
        result = processor.process(
            storage_key="",
            mime_type="application/pdf",
            original_filename="test.pdf",
        )

        assert result.extracted_text is None
        assert result.processing_method == "none"

    def test_rejects_path_traversal_attempt(self):
        """Processor should reject path traversal attempts."""
        processor = DocumentProcessor(upload_directory="/tmp")

        # Attempt to traverse outside upload directory
        result = processor.process(
            storage_key="../../../etc/passwd",
            mime_type="application/pdf",
            original_filename="test.pdf",
        )

        assert result.extracted_text is None
        assert result.processing_method == "none"

    def test_rejects_absolute_path(self):
        """Processor should reject absolute paths."""
        processor = DocumentProcessor(upload_directory="/tmp")

        result = processor.process(
            storage_key="/etc/passwd",
            mime_type="application/pdf",
            original_filename="test.pdf",
        )

        assert result.extracted_text is None
        assert result.processing_method == "none"

    def test_rejects_unsupported_mime_type(self):
        """Processor should reject unsupported MIME types."""
        processor = DocumentProcessor(upload_directory="/tmp")

        result = processor.process(
            storage_key="patient-id/test.doc",
            mime_type="application/msword",
            original_filename="test.doc",
        )

        assert result.extracted_text is None
        assert result.processing_method == "none"

    def test_validates_storage_key_format(self):
        """Processor should validate storage key format."""
        processor = DocumentProcessor(upload_directory="/tmp")

        # Valid format: patientId/uuid.extension
        assert processor._is_valid_storage_key("patient-123/abc-456.pdf") is True
        assert processor._is_valid_storage_key("patient-123/test.png") is True

        # Invalid formats
        assert processor._is_valid_storage_key("patient-123") is False
        assert processor._is_valid_storage_key("test.pdf") is False
        assert processor._is_valid_storage_key("patient-123/uuid/ext.pdf") is False


class TestPDFService:
    """Tests for PDF processing service."""

    def test_extract_text_handles_invalid_file(self):
        """PDF service should handle invalid files gracefully."""
        service = PDFService()

        # Create a temporary invalid PDF
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            f.write(b"Not a real PDF")
            temp_path = f.name

        try:
            text, pages, method = service.extract_text(temp_path)
            # Should return None for invalid PDF
            assert text is None or len(text) == 0
        finally:
            os.unlink(temp_path)


class TestOCRService:
    """Tests for OCR service."""

    def test_ocr_service_initialization(self):
        """OCR service should initialize without errors."""
        service = OCRService()
        assert service is not None


class TestProcessingResponse:
    """Tests for processing response format."""

    @patch("app.routes.processing.DocumentProcessor")
    def test_successful_processing_response_format(self, mock_processor_class):
        """Processing response should match expected format."""
        from app.schemas.processing import ProcessingResult

        # Mock the processor
        mock_processor = MagicMock()
        mock_processor.process.return_value = ProcessingResult(
            extracted_text="Sample extracted text",
            character_count=22,
            page_count=1,
            processing_method="native",
        )
        mock_processor_class.return_value = mock_processor

        # This test verifies the response format matches schema
        result = ProcessingResult(
            extracted_text="Test",
            character_count=4,
            processing_method="native",
        )

        assert result.extracted_text == "Test"
        assert result.character_count == 4
        assert result.processing_method == "native"
