# Vaidyam Document Processing Service

Internal Python FastAPI service for document text extraction and OCR processing.

## Overview

This service handles document processing for the Vaidyam healthcare platform. It extracts text from uploaded medical documents (PDFs, images) using native text extraction and OCR when needed.

**This is an internal service** - it should only be accessed by the Node.js backend, never directly by frontend clients.

## Features

- PDF text extraction (native)
- OCR fallback for scanned PDFs
- Image OCR (JPEG, PNG)
- Path traversal protection
- Internal service authentication
- Health check endpoint

## Requirements

- Python 3.9+
- Tesseract OCR (for image processing)
- Poppler (for PDF to image conversion)

### Installing Tesseract

**Windows:**
```bash
# Download installer from:
# https://github.com/UB-Mannheim/tesseract/wiki
# Default install path: C:\Program Files\Tesseract-OCR\tesseract.exe
```

**macOS:**
```bash
brew install tesseract
brew install poppler
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install tesseract-ocr
sudo apt-get install poppler-utils
```

## Installation

1. Create a virtual environment:
```bash
cd python-service
python -m venv venv
```

2. Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file from example:
```bash
cp .env.example .env
```

5. Set the internal service token (must match Node backend):
```
INTERNAL_SERVICE_TOKEN=your-secure-token-here
```

## Running the Service

**Development:**
```bash
uvicorn app.main:app --reload --port 8001
```

**Production:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 4
```

## Testing

Run the test suite:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app tests/
```

## API Endpoints

### Health Check
```
GET /health
```

Returns service health status. No authentication required.

### Process Document (Internal)
```
POST /internal/process-document
Authorization: Bearer <INTERNAL_SERVICE_TOKEN>
Content-Type: application/json

{
  "storage_key": "patient-id/document-uuid.pdf",
  "mime_type": "application/pdf",
  "original_filename": "report.pdf",
  "enable_ocr_fallback": true
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "extracted_text": "Document text...",
    "character_count": 1234,
    "page_count": 5,
    "processing_method": "native"
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `INTERNAL_SERVICE_TOKEN` | Token for Node backend authentication | (required) |
| `DEBUG` | Enable debug logging | `false` |
| `MAX_FILE_SIZE_BYTES` | Maximum file size to process | `10485760` (10MB) |
| `PROCESSING_TIMEOUT_SECONDS` | Processing timeout | `120` |
| `TESSERACT_CMD` | Path to Tesseract executable | (auto-detected) |

## Security

- Only accessible via internal service token
- Path traversal protection
- File size validation
- MIME type validation
- No CORS (internal service only)

## Architecture

```
Node.js Backend
    ↓
Python Processing Service
    ↓
Document Processor
    ├─→ PDF Service (native text extraction)
    └─→ OCR Service (Tesseract)
```

## Processing Pipeline

1. Validate storage key and MIME type
2. Resolve file path safely
3. Route to appropriate processor:
   - **PDF**: Try native text extraction first, fall back to OCR if needed
   - **Images**: Use OCR directly
4. Return extracted text and metadata

## Deployment

Ensure the Python service and Node backend:
- Share the same `DOCUMENT_UPLOAD_DIR` directory (or use a shared volume)
- Use the same `INTERNAL_SERVICE_TOKEN`
- Can communicate over the network

Example Docker Compose setup available in project root.

## Troubleshooting

**Tesseract not found:**
- Set `TESSERACT_CMD` environment variable to the full path
- Verify installation: `tesseract --version`

**PDF to image conversion fails:**
- Ensure Poppler is installed
- Check `pdf2image` can find the executables

**Authentication errors:**
- Verify `INTERNAL_SERVICE_TOKEN` matches between services
- Check Authorization header format: `Bearer <token>`

## Future Enhancements

This service is designed for basic text extraction. It does NOT include:
- AI medical interpretation
- Diagnosis generation
- Treatment recommendations
- Medical summaries

These features may be added in future versions with appropriate medical review.