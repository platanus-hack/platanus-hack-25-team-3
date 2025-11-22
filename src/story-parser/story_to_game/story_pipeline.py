from collections import Counter
from typing import Dict, Any, List

from .pdf_utils import pdf_to_text
from .segmenter import split_into_paragraphs, group_paragraphs_into_sections
from .api_client import analyze_section_with_openai


def process_pdf_into_story(
    pdf_path: str,
    max_paragraphs_per_section: int = 4,
    max_sections: int = 5,
    model: str = "gpt-4.1-mini",
) -> Dict[str, Any]:
    """Pipeline completa: PDF -> texto -> secciones -> análisis OpenAI -> JSON historia."""
    raw_text = pdf_to_text(pdf_path)
    paragraphs = split_into_paragraphs(raw_text)
    sections = group_paragraphs_into_sections(
        paragraphs,
        max_paragraphs_per_section=max_paragraphs_per_section,
        max_sections=max_sections,
    )

    analyzed_sections: List[Dict[str, Any]] = []
    for sec in sections:
        sec_data = analyze_section_with_openai(sec["text"], model=model)
        analyzed_sections.append(
            {
                **sec,
                **sec_data,
            }
        )

    # Consolidar personajes globales
    char_counter = Counter()
    char_roles = {}
    char_alignments = {}
    char_sections = {}

    for sec in analyzed_sections:
        sec_id = sec["id"]
        for ch in sec.get("characters", []):
            name = ch.get("name")
            if not name:
                continue
            char_counter[name] += 1
            char_roles.setdefault(name, ch.get("role", "npc"))
            char_alignments.setdefault(name, ch.get("alignment", "neutral"))
            char_sections.setdefault(name, set()).add(sec_id)

    characters = []
    main_character = None
    if char_counter:
        main_character = char_counter.most_common(1)[0][0]

    for name, count in char_counter.items():
        role = char_roles.get(name, "npc")
        alignment = char_alignments.get(name, "neutral")
        sections_involved = sorted(list(char_sections.get(name, [])))

        # Ajustar rol del protagonista global
        if name == main_character:
            role = "protagonist"
            if alignment == "evil":
                alignment = "good"

        characters.append(
            {
                "name": name,
                "role": role,
                "alignment": alignment,
                "mentions": int(count),
                "sections_involved": sections_involved,
            }
        )

    story = {
        "meta": {
            "source_pdf": pdf_path,
            "num_paragraphs": len(paragraphs),
            "num_sections": len(analyzed_sections),
            "main_character": main_character,
        },
        "characters": characters,
        "sections": analyzed_sections,
    }

    return story
