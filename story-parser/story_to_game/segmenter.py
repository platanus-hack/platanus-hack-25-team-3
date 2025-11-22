from typing import List, Dict


def split_into_paragraphs(text: str, min_len: int = 40) -> List[str]:
    """Rough split of a text into paragraphs based on line breaks and length."""
    blocks = [b.strip() for b in text.split("\n") if b.strip()]
    paragraphs: List[str] = []
    current: List[str] = []

    for b in blocks:
        current.append(b)
        if sum(len(x) for x in current) > min_len:
            paragraphs.append(" ".join(current))
            current = []

    if current:
        paragraphs.append(" ".join(current))

    return paragraphs


def group_paragraphs_into_sections(
    paragraphs: List[str],
    max_paragraphs_per_section: int = 4,
    max_sections: int = 5,
) -> List[Dict]:
    """Group paragraphs into coarse 'sections' (levels).

    - max_paragraphs_per_section: cuántos párrafos como máximo por sección.
    - max_sections: máximo número de secciones (niveles) que se generarán.
    """
    sections = []
    current = []
    start_idx = 0

    for i, p in enumerate(paragraphs):
        current.append(p)
        if len(current) >= max_paragraphs_per_section:
            sections.append(
                {
                    "id": len(sections),
                    "start_paragraph": start_idx,
                    "end_paragraph": i,
                    "text": "\n".join(current),
                }
            )
            current = []
            start_idx = i + 1
            if len(sections) >= max_sections:
                break

    if current and len(sections) < max_sections:
        sections.append(
            {
                "id": len(sections),
                "start_paragraph": start_idx,
                "end_paragraph": min(len(paragraphs) - 1, start_idx + len(current) - 1),
                "text": "\n".join(current),
            }
        )

    # recortar si por alguna razón se superó el máximo
    return sections[:max_sections]
