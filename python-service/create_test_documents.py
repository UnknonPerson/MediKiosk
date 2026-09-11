#!/usr/bin/env python3
"""Create synthetic test documents for OCR verification."""

import os
from pathlib import Path

# Base directory for uploads
UPLOADS_DIR = Path("uploads")
TEST_PATIENT_DIR = UPLOADS_DIR / "test-patient"

def create_digital_pdf():
    """Create a digital PDF with embedded text using reportlab."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas

        pdf_path = TEST_PATIENT_DIR / "digital-test.pdf"

        c = canvas.Canvas(str(pdf_path), pagesize=letter)
        c.setFont("Helvetica", 12)

        # Add synthetic medical text (safe, no real data)
        c.drawString(72, 750, "MEDICAL REPORT - SYNTHETIC TEST DOCUMENT")
        c.drawString(72, 730, "Patient: TEST-12345")
        c.drawString(72, 710, "Date: 2026-09-10")
        c.drawString(72, 690, "Physician: Dr. Test User")
        c.drawString(72, 670, "--------------------------------")

        # Medical observations
        c.drawString(72, 650, "Observations:")
        c.drawString(72, 630, "• Blood pressure: 120/80 mmHg")
        c.drawString(72, 610, "• Heart rate: 72 bpm")
        c.drawString(72, 590, "• Temperature: 98.6°F")
        c.drawString(72, 570, "• Respiratory rate: 16 breaths/min")

        # Prescription
        c.drawString(72, 530, "Prescription:")
        c.drawString(72, 510, "• Sample medication: 500mg daily")
        c.drawString(72, 490, "• Duration: 7 days")
        c.drawString(72, 470, "• Instructions: Take with food")

        # Notes
        c.drawString(72, 430, "Notes:")
        c.drawString(72, 410, "Patient reported feeling well.")
        c.drawString(72, 390, "No adverse reactions observed.")
        c.drawString(72, 370, "Follow-up scheduled in 1 month.")

        c.save()
        print(f"[OK] Created digital PDF: {pdf_path}")
        return str(pdf_path.relative_to(UPLOADS_DIR))
    except ImportError:
        print("[WARN] reportlab not installed, creating simple text file instead")
        return create_text_file()

def create_text_file():
    """Create a simple text file as fallback."""
    text_path = TEST_PATIENT_DIR / "digital-text.txt"
    text_content = """MEDICAL REPORT - SYNTHETIC TEST DOCUMENT
Patient: TEST-12345
Date: 2026-09-10
Physician: Dr. Test User
--------------------------------
Observations:
• Blood pressure: 120/80 mmHg
• Heart rate: 72 bpm
• Temperature: 98.6°F
• Respiratory rate: 16 breaths/min

Prescription:
• Sample medication: 500mg daily
• Duration: 7 days
• Instructions: Take with food

Notes:
Patient reported feeling well.
No adverse reactions observed.
Follow-up scheduled in 1 month."""

    with open(text_path, "w", encoding="utf-8") as f:
        f.write(text_content)

    print(f"[OK] Created text file: {text_path}")
    return str(text_path.relative_to(UPLOADS_DIR))

def create_test_document_index():
    """Create an index file with test document metadata."""
    index_path = UPLOADS_DIR / "test_documents.md"

    index_content = """# Test Documents for OCR Verification

This directory contains synthetic test documents for verifying the OCR pipeline.

## Document Structure

All documents are stored under:
```
uploads/test-patient/[document-uuid].pdf
```

## Synthetic Documents Created

### Digital PDF (Embedded Text)
- **File**: `test-patient/digital-test.pdf`
- **Content**: Synthetic medical report with embedded selectable text
- **Expected extraction method**: Native PDF extraction
- **Expected text**: Contains test medical observations and prescriptions

### Text File (Fallback)
- **File**: `test-patient/digital-text.txt` (if PDF creation fails)
- **Content**: Same content as PDF but in plain text format
- **Purpose**: Fallback for testing when PDF libraries not available

## Test Scenarios

### 1. Digital PDF Extraction
- **Service**: Should use pdfplumber for native text extraction
- **Expected**: Extracted text matches embedded content
- **OCR usage**: Should NOT be used (native extraction sufficient)

### 2. Scanned PDF OCR (Requires Tesseract+Poppler)
- **Service**: Should fall back to OCR via pdf2image + pytesseract
- **Condition**: Native extraction returns <50 characters
- **Dependencies**: Tesseract OCR and Poppler must be installed

### 3. Image OCR (Requires Tesseract)
- **Service**: Should use pytesseract directly
- **File types**: PNG, JPEG images with synthetic text
- **Dependencies**: Tesseract OCR must be installed

## Security Notes

- All documents contain synthetic data only
- No real patient information or medical records
- Test patient ID: `test-patient` (not a real patient)
- For production use, replace with real uploads directory structure

## Directory Structure

```
uploads/
├── test-patient/
│   ├── digital-test.pdf      # Digital PDF with embedded text
│   └── digital-text.txt      # Text fallback (if PDF unavailable)
├── test_documents.md         # This file
└── .gitkeep                  # Keep directory in git
```

## Usage for Testing

When testing the Python processing service, use storage keys like:
- `test-patient/digital-test.pdf` for PDF processing
- Set appropriate MIME types: `application/pdf`, `image/png`, etc.
- Use `enable_ocr_fallback: true` to test OCR fallback behavior
"""

    with open(index_path, "w", encoding="utf-8") as f:
        f.write(index_content)

    print(f"[OK] Created test document index: {index_path}")

def create_gitkeep():
    """Create .gitkeep file to preserve directory structure."""
    gitkeep_path = UPLOADS_DIR / ".gitkeep"
    with open(gitkeep_path, "w") as f:
        f.write("# Keep uploads directory in git\n")
    print(f"[OK] Created .gitkeep file: {gitkeep_path}")

def main():
    """Create all test documents."""
    print("Creating synthetic test documents for OCR verification...")

    # Create directories
    os.makedirs(TEST_PATIENT_DIR, exist_ok=True)

    # Create test documents
    create_digital_pdf()
    create_test_document_index()
    create_gitkeep()

    print("\n[SUCCESS] Test documents created successfully!")
    print("\nNext steps:")
    print("1. Install Tesseract and Poppler (see INSTALL.md)")
    print("2. Install Python dependencies: pip install -r requirements.txt")
    print("3. Start Python service: uvicorn app.main:app --reload --port 8001")
    print("4. Test processing with: curl -X POST http://localhost:8001/internal/process-document")
    print("   - Header: Authorization: Bearer <INTERNAL_SERVICE_TOKEN>")
    print("   - Body: {\"storage_key\": \"test-patient/digital-test.pdf\", \"mime_type\": \"application/pdf\"}")

if __name__ == "__main__":
    main()