# Python Environment Setup (Windows)

Set up a Windows development environment for the Program Document Builder.

## 1. Install Python 3.11+

Download from [python.org/downloads](https://www.python.org/downloads/) and run the installer.

**Important:** Check the box that says "Add Python to PATH" during installation.

Verify from a terminal (PowerShell or Command Prompt):

```powershell
py -3.11 --version
```

If Python 3.11 is already installed, skip to step 2.

## 2. Install Poppler (PDF Tools)

Poppler provides command-line PDF tools — `pdftotext`, `pdfinfo`, `pdfimages`, `pdftoppm`. Used by Python libraries like `pdfplumber` under the hood, and available directly from the terminal for quick text extraction.

```powershell
winget install oschwartz10612.Poppler
```

After installing, restart your terminal so the new PATH entries take effect.

```powershell
# Verify
pdftotext -v
pdfinfo -v
```

**Quick usage from terminal:**
```powershell
# Extract all text from a PDF
pdftotext document.pdf -

# Extract text from specific pages (page 3 to 5)
pdftotext -f 3 -l 5 document.pdf -

# Get PDF metadata (page count, title, author, etc.)
pdfinfo document.pdf
```

## 3. Install Python Packages

```powershell
py -3.11 -m pip install openpyxl python-docx python-pptx reportlab pymupdf pdfplumber pyhanko
```

## 4. Verify Installation

Run this to confirm all packages are available:

```powershell
py -3.11 -c "import openpyxl; print(f'openpyxl:    {openpyxl.__version__}'); import docx; print(f'python-docx: {docx.__version__}'); import pptx; print(f'python-pptx: {pptx.__version__}'); import reportlab; print(f'reportlab:   {reportlab.Version}'); import pymupdf; print(f'pymupdf:     {pymupdf.__version__}'); import pdfplumber; print(f'pdfplumber:  {pdfplumber.__version__}'); from pyhanko.sign import signers; print('pyhanko:     OK'); print('All packages installed successfully.')"
```

Expected output — seven lines with version numbers, ending with "All packages installed successfully."

## What These Packages Do

### Office Documents

| Package | Purpose |
|---------|---------|
| **openpyxl** | Read/write Excel (.xlsx, .xlsm) |
| **python-docx** | Read/write Word (.docx) |
| **python-pptx** | Read/write PowerPoint (.pptx) |

### PDF — Reading

| Package | Purpose |
|---------|---------|
| **pymupdf** | Fast PDF text extraction, page rendering, image extraction, merging, splitting. Works on any PDF. |
| **pdfplumber** | PDF table extraction — pulls structured tables into Python lists/dicts. Better than PyMuPDF for tabular data. |
| **poppler** (CLI) | `pdftotext` for quick terminal-level text extraction, `pdfinfo` for metadata, `pdfimages` for image extraction. Installed via WinGet, not pip. |

### PDF — Writing

| Package | Purpose |
|---------|---------|
| **reportlab** | Generate PDFs from scratch (invoices, reports, forms) |
| **pyhanko** | PDF digital signatures |

### When to Use Which PDF Tool

| Task | Best Tool |
|------|-----------|
| Extract text from a PDF | **pymupdf** (Python) or **pdftotext** (terminal) |
| Extract tables from a PDF | **pdfplumber** |
| Get page count, title, author | **pdfinfo** (terminal) or **pymupdf** |
| Extract images from a PDF | **pymupdf** or **pdfimages** (terminal) |
| Merge/split PDFs | **pymupdf** |
| Generate a new PDF | **reportlab** |
| Digitally sign a PDF | **pyhanko** |
