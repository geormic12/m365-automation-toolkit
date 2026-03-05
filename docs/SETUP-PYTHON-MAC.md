# Environment Setup

Set up a Mac development environment for the Program Document Builder.

## 1. Install Homebrew (Mac package manager)

Homebrew does not come with macOS — it must be installed first. Check if it's already there:

```bash
brew --version
```

If that returns "command not found", install it:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the on-screen prompts. When it finishes, it may tell you to run two commands to add Homebrew to your PATH — run those before continuing.

## 2. Install Python 3.11+

Check if Python 3.11 or higher is already installed:

```bash
python3 --version
```

If that shows 3.11 or higher, skip to step 3. Otherwise, install it:

```bash
brew install python

# Verify — should show 3.11 or higher
python3 --version
```

## 3. Install Poppler (PDF Tools)

Poppler provides command-line PDF tools — `pdftotext`, `pdfinfo`, `pdfimages`, `pdftoppm`. Used by Python libraries like `pdfplumber` under the hood, and available directly from the terminal for quick text extraction.

```bash
brew install poppler

# Verify
pdftotext -v
pdfinfo -v
```

**Quick usage from terminal:**
```bash
# Extract all text from a PDF
pdftotext document.pdf -

# Extract text from specific pages (page 3 to 5)
pdftotext -f 3 -l 5 document.pdf -

# Get PDF metadata (page count, title, author, etc.)
pdfinfo document.pdf
```

## 4. Install Python Packages

First, create a virtual environment. macOS 14+ and Homebrew Python 3.12+ enforce PEP 668, which blocks global `pip install` by default. A virtual environment avoids this and keeps project dependencies isolated.

```bash
python3 -m venv ~/pdf-tools-env
source ~/pdf-tools-env/bin/activate
pip install openpyxl python-docx python-pptx reportlab pymupdf pdfplumber pyhanko
```

To use these packages in future terminal sessions, activate the environment first:

```bash
source ~/pdf-tools-env/bin/activate
```

## 5. Verify Installation

Run this to confirm all packages are available (make sure the virtual environment is activated):

```bash
source ~/pdf-tools-env/bin/activate
python3 -c "
import openpyxl; print(f'openpyxl:    {openpyxl.__version__}')
import docx;     print(f'python-docx: {docx.__version__}')
import pptx;     print(f'python-pptx: {pptx.__version__}')
import reportlab; print(f'reportlab:   {reportlab.Version}')
import pymupdf;  print(f'pymupdf:     {pymupdf.__version__}')
import pdfplumber; print(f'pdfplumber:  {pdfplumber.__version__}')
from pyhanko.sign import signers; print('pyhanko:     OK')
print('All packages installed successfully.')
"
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
| **poppler** (CLI) | `pdftotext` for quick terminal-level text extraction, `pdfinfo` for metadata, `pdfimages` for image extraction. Installed via Homebrew, not pip. |

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
