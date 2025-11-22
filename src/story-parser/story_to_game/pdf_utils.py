import pdfplumber

def pdf_to_text(path_pdf: str) -> str:
    """Extract raw text from a PDF file."""
    full_text = []
    with pdfplumber.open(path_pdf) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)
    return "\n\n".join(full_text)
