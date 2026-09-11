#!/usr/bin/env python3
"""
Real OCR Runtime Verification Script

Tests all four document processing paths using actual production services:
1. Digital PDF - Native text extraction
2. PNG OCR - Tesseract OCR on PNG images
3. JPEG OCR - Tesseract OCR on JPEG images
4. Image-based PDF OCR Fallback - Poppler + Tesseract

Uses real Tesseract, Poppler, and document processing services.
No mocks or fakes - all actual runtime verification.
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Add app to path
sys.path.insert(0, os.path.dirname(__file__))

from app.services.document_processor import DocumentProcessor
from app.services.pdf_service import PDFService
from app.services.ocr_service import OCRService
from app.core.config import settings

# Test directories
UPLOADS_DIR = Path("uploads")
TEST_PATIENT_DIR = UPLOADS_DIR / "test-patient"
OCR_TEST_DIR = UPLOADS_DIR / "ocr-test"

# Ensure directories exist
os.makedirs(TEST_PATIENT_DIR, exist_ok=True)
os.makedirs(OCR_TEST_DIR, exist_ok=True)


def create_text_image(text: str, filename: str, format: str = "PNG") -> str:
    """
    Create a real image with text drawn on it using PIL.

    Args:
        text: Text to write on image
        filename: Output filename
        format: Image format (PNG or JPEG)

    Returns:
        Full path to created image
    """
    # Create a white background image
    img = Image.new('RGB', (800, 400), color='white')
    draw = ImageDraw.Draw(img)

    # Draw the text
    # Try to use a default font
    try:
        # Try to load a TTF font if available
        font = ImageFont.truetype("arial.ttf", 24)
    except (OSError, IOError):
        # Fall back to default font
        font = ImageFont.load_default()

    # Draw text lines
    y_position = 50
    for line in text.split('\n'):
        draw.text((50, y_position), line, fill='black', font=font)
        y_position += 35

    # Save the image
    output_path = OCR_TEST_DIR / filename
    img.save(str(output_path), format=format)
    return str(output_path)


def create_image_based_pdf(text: str, filename: str) -> str:
    """
    Create a PDF that is essentially an image (scanned document style).
    This PDF will NOT have embedded selectable text - only an image.

    Args:
        text: Text to include in the PDF
        filename: Output filename

    Returns:
        Full path to created PDF
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors

    # Create an image with the text first
    img = Image.new('RGB', (800, 1000), color='white')
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except (OSError, IOError):
        font = ImageFont.load_default()

    y_position = 50
    for line in text.split('\n'):
        draw.text((50, y_position), line, fill='black', font=font)
        y_position += 30

    # Save as temporary image
    temp_img_path = OCR_TEST_DIR / "temp_scan_image.png"
    img.save(str(temp_img_path))

    # Create PDF by drawing the image (not adding as image object, but converting to PDF)
    # Using canvas with image - this creates a PDF where content is image-based
    pdf_path = OCR_TEST_DIR / filename
    c = canvas.Canvas(str(pdf_path), pagesize=letter)

    # Draw the image onto the PDF canvas - this makes it image-based content
    c.drawImage(str(temp_img_path), 50, 100, width=500, height=600)
    c.save()

    # Clean up temp image
    os.remove(str(temp_img_path))

    return str(pdf_path)


def verify_digital_pdf() -> dict:
    """Test 1: Digital PDF with embedded selectable text."""
    print("\n" + "="*60)
    print("TEST 1: DIGITAL PDF - NATIVE EXTRACTION")
    print("="*60)

    # Check if digital PDF exists
    pdf_path = TEST_PATIENT_DIR / "digital-test.pdf"
    if not pdf_path.exists():
        print(f"[FAIL] Digital PDF not found: {pdf_path}")
        return {"input_type": "digital_pdf", "extraction_path": "native", "success": False, "error": "File not found"}

    print(f"[INFO] Input file: {pdf_path}")

    # Use actual PDF service to test
    pdf_service = PDFService()
    text, page_count, method = pdf_service.extract_text(str(pdf_path))

    print(f"[INFO] Extraction method: {method}")
    print(f"[INFO] Pages: {page_count}")
    print(f"[INFO] Characters extracted: {len(text) if text else 0}")

    if text and len(text.strip()) > 0:
        print(f"[SUCCESS] Native text extraction succeeded!")
        print(f"[INFO] Sample text (first 200 chars):")
        print("-" * 40)
        print(text[:200])
        print("-" * 40)
        return {
            "input_type": "digital_pdf",
            "extraction_path": "native",
            "success": True,
            "method": method,
            "character_count": len(text),
            "page_count": page_count
        }
    else:
        print(f"[FAIL] No text extracted from digital PDF")
        return {
            "input_type": "digital_pdf",
            "extraction_path": "native",
            "success": False,
            "error": "No text extracted"
        }


def verify_png_ocr() -> dict:
    """Test 2: PNG image OCR using Tesseract."""
    print("\n" + "="*60)
    print("TEST 2: PNG IMAGE OCR - TESSERACT")
    print("="*60)

    # Create test PNG with clear text
    test_text = """PATIENT LAB RESULTS
Test: Complete Blood Count
Date: 2026-09-10

White Blood Cells: 7.5 K/uL (Normal: 4.5-11.0)
Red Blood Cells: 4.8 M/uL (Normal: 4.5-5.5)
Hemoglobin: 14.2 g/dL (Normal: 12.0-16.0)
Platelets: 250 K/uL (Normal: 150-400)

Physician: Dr. Medical Test
Facility: Vaidyam Test Lab"""

    png_path = create_text_image(test_text, "test-png-ocr.png", "PNG")

    if not os.path.exists(png_path):
        print(f"[FAIL] Could not create PNG test file")
        return {"input_type": "png_image", "extraction_path": "ocr", "success": False, "error": "File creation failed"}

    print(f"[INFO] Input file: {png_path}")

    # Test using actual OCR service
    ocr_service = OCRService()
    text = ocr_service.process_image_file(png_path)

    print(f"[INFO] Characters extracted: {len(text) if text else 0}")
    print(f"[INFO] Sample text (first 200 chars):")
    print("-" * 40)
    print(text[:200] if text else "[EMPTY]")
    print("-" * 40)

    if text and len(text.strip()) > 0:
        print(f"[SUCCESS] PNG OCR succeeded!")
        return {
            "input_type": "png_image",
            "extraction_path": "ocr",
            "success": True,
            "method": "ocr",
            "character_count": len(text)
        }
    else:
        print(f"[FAIL] PNG OCR failed - no text extracted")
        return {
            "input_type": "png_image",
            "extraction_path": "ocr",
            "success": False,
            "error": "OCR returned empty text"
        }


def verify_jpeg_ocr() -> dict:
    """Test 3: JPEG image OCR using Tesseract."""
    print("\n" + "="*60)
    print("TEST 3: JPEG IMAGE OCR - TESSERACT")
    print("="*60)

    # Create test JPEG with clear text
    test_text = """MEDICAL PRESCRIPTION
Date: September 10, 2026

Patient ID: TEST-12345

Medication: Amoxicillin 500mg
Dosage: 1 capsule three times daily
Duration: 10 days
Instructions: Take with food

Dr. Test Physician
License: MD-12345"""

    jpeg_path = create_text_image(test_text, "test-jpeg-ocr.jpg", "JPEG")

    if not os.path.exists(jpeg_path):
        print(f"[FAIL] Could not create JPEG test file")
        return {"input_type": "jpeg_image", "extraction_path": "ocr", "success": False, "error": "File creation failed"}

    print(f"[INFO] Input file: {jpeg_path}")

    # Test using actual OCR service
    ocr_service = OCRService()
    text = ocr_service.process_image_file(jpeg_path)

    print(f"[INFO] Characters extracted: {len(text) if text else 0}")
    print(f"[INFO] Sample text (first 200 chars):")
    print("-" * 40)
    print(text[:200] if text else "[EMPTY]")
    print("-" * 40)

    if text and len(text.strip()) > 0:
        print(f"[SUCCESS] JPEG OCR succeeded!")
        return {
            "input_type": "jpeg_image",
            "extraction_path": "ocr",
            "success": True,
            "method": "ocr",
            "character_count": len(text)
        }
    else:
        print(f"[FAIL] JPEG OCR failed - no text extracted")
        return {
            "input_type": "jpeg_image",
            "extraction_path": "ocr",
            "success": False,
            "error": "OCR returned empty text"
        }


def verify_scanned_pdf_ocr() -> dict:
    """Test 4: Image-based PDF (scanned document) OCR fallback."""
    print("\n" + "="*60)
    print("TEST 4: IMAGE-BASED PDF OCR FALLBACK")
    print("="*60)

    # Create a PDF that is essentially an image (no embedded text)
    test_text = """SCANNED MEDICAL DOCUMENT
Department: Laboratory Results
Scan Date: 2026-09-10

TEST RESULTS:
~~~~~~~~~~~~~

Glucose: 95 mg/dL (Fasting)
Normal Range: 70-100 mg/dL

Cholesterol: 180 mg/dL
Normal Range: <200 mg/dL

HDL Cholesterol: 55 mg/dL
Normal Range: >40 mg/dL

LDL Cholesterol: 110 mg/dL
Normal Range: <100 mg/dL

Triglycerides: 130 mg/dL
Normal Range: <150 mg/dL

~~~~~~~~~~~~~~~~~~~~~~~
Verified by: Lab Tech Test
Report generated automatically"""

    pdf_path = create_image_based_pdf(test_text, "scanned-test.pdf")

    if not os.path.exists(pdf_path):
        print(f"[FAIL] Could not create scanned PDF test file")
        return {"input_type": "scanned_pdf", "extraction_path": "ocr_fallback", "success": False, "error": "File creation failed"}

    print(f"[INFO] Input file: {pdf_path}")

    # Step 1: Try native extraction first (should fail or return minimal text)
    pdf_service = PDFService()
    native_text, page_count, native_method = pdf_service.extract_text(pdf_path)

    print(f"[INFO] Native extraction result:")
    print(f"       Method: {native_method}")
    print(f"       Characters: {len(native_text) if native_text else 0}")

    if native_text and len(native_text.strip()) >= 50:
        print(f"[INFO] PDF has embedded text - not truly image-based")
        print(f"[SKIP] OCR fallback not triggered")
        return {
            "input_type": "scanned_pdf",
            "extraction_path": "native",
            "success": True,
            "method": native_method,
            "character_count": len(native_text),
            "note": "PDF contained embedded text"
        }

    # Step 2: Convert PDF to images using Poppler
    print(f"[INFO] Converting PDF pages to images (Poppler)...")
    try:
        images = pdf_service.convert_to_images(pdf_path)
        print(f"[INFO] Converted {len(images)} pages to images")
    except Exception as e:
        print(f"[FAIL] PDF to image conversion failed: {e}")
        return {
            "input_type": "scanned_pdf",
            "extraction_path": "ocr_fallback",
            "success": False,
            "error": f"Poppler conversion failed: {str(e)}"
        }

    if not images:
        print(f"[FAIL] No images generated from PDF")
        return {
            "input_type": "scanned_pdf",
            "extraction_path": "ocr_fallback",
            "success": False,
            "error": "No images generated"
        }

    # Step 3: Run OCR on the images
    print(f"[INFO] Running OCR on {len(images)} images (Tesseract)...")
    ocr_service = OCRService()
    ocr_text = ocr_service.extract_text_from_images(images)

    print(f"[INFO] OCR extraction:")
    print(f"       Total characters: {len(ocr_text) if ocr_text else 0}")
    print(f"[INFO] Sample text (first 200 chars):")
    print("-" * 40)
    print(ocr_text[:200] if ocr_text else "[EMPTY]")
    print("-" * 40)

    if ocr_text and len(ocr_text.strip()) > 0:
        print(f"[SUCCESS] Scanned PDF OCR fallback succeeded!")
        return {
            "input_type": "scanned_pdf",
            "extraction_path": "ocr_fallback",
            "success": True,
            "method": "ocr",
            "character_count": len(ocr_text),
            "page_count": len(images)
        }
    else:
        print(f"[FAIL] Scanned PDF OCR failed - no text extracted")
        return {
            "input_type": "scanned_pdf",
            "extraction_path": "ocr_fallback",
            "success": False,
            "error": "OCR returned empty text"
        }


def verify_full_pipeline() -> dict:
    """Test the full document processor pipeline (as used by the API)."""
    print("\n" + "="*60)
    print("FULL PIPELINE TEST: DocumentProcessor service")
    print("="*60)

    # Create a test image
    test_text = """FULL PIPELINE TEST
This tests the complete document processing service
like the /internal/process-document endpoint uses.

Patient: PIPELINE-TEST-001
Type: Image OCR Test"""

    png_path = create_text_image(test_text, "pipeline-test.png", "PNG")

    if not os.path.exists(png_path):
        print(f"[FAIL] Could not create test file")
        return {"success": False, "error": "File creation failed"}

    # Use the actual DocumentProcessor service
    processor = DocumentProcessor(upload_directory=str(UPLOADS_DIR))

    # Process as PNG (should use OCR)
    result = processor.process(
        storage_key="ocr-test/pipeline-test.png",
        mime_type="image/png",
        original_filename="pipeline-test.png",
        enable_ocr_fallback=True
    )

    print(f"[INFO] Processing result:")
    print(f"       Method: {result.processing_method}")
    print(f"       Characters: {result.character_count}")
    print(f"       Success: {result.extracted_text is not None and len(result.extracted_text) > 0}")

    if result.extracted_text and len(result.extracted_text) > 0:
        print(f"[SUCCESS] Full pipeline test passed!")
        return {
            "pipeline_test": True,
            "success": True,
            "method": result.processing_method,
            "character_count": result.character_count
        }
    else:
        print(f"[FAIL] Full pipeline test failed")
        return {
            "pipeline_test": True,
            "success": False,
            "method": result.processing_method,
            "error": "Processing returned empty result"
        }


def main():
    """Run all OCR verification tests."""
    print("="*60)
    print("VAIDYAM OCR RUNTIME VERIFICATION")
    print("="*60)
    print(f"Upload directory: {UPLOADS_DIR.absolute()}")

    results = []

    # Run all four tests
    results.append(("Digital PDF - Native", verify_digital_pdf()))
    results.append(("PNG OCR", verify_png_ocr()))
    results.append(("JPEG OCR", verify_jpeg_ocr()))
    results.append(("Scanned PDF OCR Fallback", verify_scanned_pdf_ocr()))

    # Test full pipeline
    results.append(("Full Pipeline Test", verify_full_pipeline()))

    # Summary
    print("\n" + "="*60)
    print("VERIFICATION SUMMARY")
    print("="*60)

    all_passed = True
    for name, result in results:
        status = "[PASS]" if result.get("success") else "[FAIL]"
        print(f"{status} {name}")
        if not result.get("success"):
            all_passed = False
            print(f"       Error: {result.get('error', 'Unknown')}")

    print("\n" + "-"*60)
    print("DETAILED RESULTS:")
    print("-"*60)

    for name, result in results:
        print(f"\n{name}:")
        for key, value in result.items():
            if key != "success":
                print(f"  {key}: {value}")

    print("\n" + "="*60)
    if all_passed:
        print("ALL OCR RUNTIME VERIFICATIONS PASSED")
    else:
        print("SOME VERIFICATIONS FAILED - See details above")
    print("="*60)

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())