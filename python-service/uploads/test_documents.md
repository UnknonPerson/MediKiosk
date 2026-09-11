# Test Documents for OCR Verification

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
