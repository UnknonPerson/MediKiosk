# PowerShell script to check OCR dependencies on Windows
# Run from: python-service directory

Write-Host "=== Vaidyam OCR Dependencies Check ===" -ForegroundColor Cyan
Write-Host ""

# Check Python version
Write-Host "1. Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   [OK] $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Python not found or error occurred" -ForegroundColor Red
}
Write-Host ""

# Check Tesseract
Write-Host "2. Checking Tesseract OCR..." -ForegroundColor Yellow
try {
    $tesseractPath = Get-Command tesseract -ErrorAction SilentlyContinue
    if ($tesseractPath) {
        $version = & tesseract --version 2>&1 | Select-Object -First 1
        Write-Host "   [OK] Tesseract found at: $($tesseractPath.Source)" -ForegroundColor Green
        Write-Host "   Version: $version" -ForegroundColor Gray

        # Check language data
        $tessData = & tesseract --list-langs 2>&1 | Select-String "eng"
        if ($tessData) {
            Write-Host "   [OK] English language data installed" -ForegroundColor Green
        } else {
            Write-Host "   [WARN] English language data may not be installed" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   [FAIL] Tesseract not found on PATH" -ForegroundColor Red
        Write-Host "   Installation: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor Gray
    }
} catch {
    Write-Host "   [FAIL] Error checking Tesseract: $_" -ForegroundColor Red
}
Write-Host ""

# Check Poppler
Write-Host "3. Checking Poppler (pdf2image)..." -ForegroundColor Yellow
try {
    $pdftoppmPath = Get-Command pdftoppm -ErrorAction SilentlyContinue
    if ($pdftoppmPath) {
        $popplerVersion = & pdftoppm --version 2>&1
        Write-Host "   [OK] Poppler found at: $($pdftoppmPath.Source)" -ForegroundColor Green
        Write-Host "   Version: $popplerVersion" -ForegroundColor Gray
    } else {
        Write-Host "   [FAIL] pdftoppm not found on PATH" -ForegroundColor Red
        Write-Host "   Installation: https://github.com/oschwartz10612/poppler-windows/releases/" -ForegroundColor Gray
    }
} catch {
    Write-Host "   [FAIL] Error checking Poppler: $_" -ForegroundColor Red
}
Write-Host ""

# Check Python packages
Write-Host "4. Checking Python packages..." -ForegroundColor Yellow

$packages = @(
    "fastapi",
    "uvicorn",
    "pytesseract",
    "Pillow",
    "pdfplumber",
    "pdf2image",
    "pydantic",
    "pydantic-settings"
)

foreach ($pkg in $packages) {
    $result = pip show $pkg 2>&1 | Select-String "Name:"
    if ($result) {
        Write-Host "   [OK] $pkg installed" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] $pkg not installed (may need: pip install -r requirements.txt)" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "=== Summary ===" -ForegroundColor Cyan

# Check Tesseract availability
$hasTesseract = Get-Command tesseract -ErrorAction SilentlyContinue
$hasPoppler = Get-Command pdftoppm -ErrorAction SilentlyContinue

if ($hasTesseract -and $hasPoppler) {
    Write-Host "[OK] OCR dependencies appear to be installed" -ForegroundColor Green
    Write-Host "  You can run OCR tests" -ForegroundColor Gray
} else {
    Write-Host "[WARN] Some dependencies are missing" -ForegroundColor Yellow
    Write-Host "  See INSTALL.md for installation instructions" -ForegroundColor Gray
}

Write-Host ""
Write-Host "To test Python service: uvicorn app.main:app --reload --port 8001" -ForegroundColor Gray
