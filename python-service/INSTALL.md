# Windows Installation Guide for OCR Dependencies

## Prerequisites

Python 3.9+ must be installed. The project has been tested with Python 3.14.

## Step 1: Install Tesseract OCR

### Option A: Using Windows Installer (Recommended)

1. Download the Windows installer from:
   https://github.com/UB-Mannheim/tesseract/wiki

2. Run the installer (e.g., `tesseract-ocr-w64-setup-5.x.x.exe`)

3. During installation, note the installation path. Default is:
   ```
   C:\Program Files\Tesseract-OCR\tesseract.exe
   ```

4. The installer should add Tesseract to PATH automatically.

### Option B: Manual Installation

If using manual installation or a custom path, set the environment variable:

```bash
# In .env file for the Python service:
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

### Verify Installation

```bash
tesseract --version
```

Expected output:
```
tesseract 5.x.x
 leptonica-1.8x.x
  libjpeg 9x : libpng 1.6xx : libtiff 5.x : libwebp 1.x
 Found AVX2
 Found AVX
 Found SSE
```

## Step 2: Install Poppler for Windows

Poppler is required for PDF to image conversion (pdf2image library).

### Download Poppler for Windows

1. Download from: https://github.com/oschwartz10612/poppler-windows/releases/
   - Choose the latest release (e.g., `Release-24.02.0-0.zip`)

2. Extract to a permanent location, e.g.:
   ```
   C:\Program Files\poppler-24.02.0\Library\bin
   ```

3. Add the bin directory to your PATH, or set the path in the `.env`:

```bash
# In .env file:
POPPLER_PATH=C:\Program Files\poppler-24.02.0\Library\bin
```

### Verify Poppler Installation

```bash
# Check pdftoppm is available
pdftoppm --version
```

## Step 3: Install Python Dependencies

```bash
cd python-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Step 4: Configure Environment

Create `.env` file in `python-service/` directory:

```bash
# Copy example
cp .env.example .env

# Edit .env with your configuration
```

Required settings:
```bash
# Internal authentication (must match Node backend)
INTERNAL_SERVICE_TOKEN=your-secure-token-here

# Optional: If Tesseract is not on PATH
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe

# Optional: If Poppler is not on PATH
# (Note: Poppler is auto-detected on PATH, or configured via environment)
```

## Step 5: Test the Installation

Start the Python service:
```bash
uvicorn app.main:app --reload --port 8001
```

Test health endpoint:
```bash
curl http://localhost:8001/health
```

## Troubleshooting

### Tesseract not found

Error: `pytesseract.pytesseract.TesseractNotFoundError`

**Solution:**
1. Verify Tesseract is installed: `tesseract --version`
2. If not on PATH, set `TESSERACT_CMD` in `.env`
3. Restart your terminal/session after adding to PATH

### Poppler pdftoppm not found

Error: `pdf2image.exceptions.PDFPageCountError: Unable to get page count`

**Solution:**
1. Verify Poppler is installed and `pdftoppm` is accessible
2. Add Poppler `bin` directory to PATH
3. Or set `POPPLER_PATH` in your environment

### OCR returns empty text

**Possible causes:**
1. Image quality too low
2. Text is in a language not supported by default Tesseract data
3. Image format not supported

**Solutions:**
1. Ensure images are at least 300 DPI
2. Install language data packs if needed
3. Try different image formats

## Docker Alternative

If Windows installation is problematic, consider using Docker:

```bash
docker run -p 8001:8001 \
  -v /path/to/documents:/app/uploads \
  -e INTERNAL_SERVICE_TOKEN=your-token \
  your-python-service-image
```

See Dockerfile example in project repository.
