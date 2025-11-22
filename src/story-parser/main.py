import json
import argparse
import os
from dotenv import load_dotenv

# Cargar variables de entorno al inicio
load_dotenv()

from story_to_game.story_pipeline import process_pdf_into_story


def main():
    parser = argparse.ArgumentParser(description="Convierte un PDF infantil en un JSON jugable usando la API de OpenAI.")
    parser.add_argument("pdf_path", help="Ruta al PDF de cuento infantil.")
    parser.add_argument("--out", default="story_game.json", help="Archivo de salida JSON.")
    parser.add_argument("--max-sections", type=int, default=5, help="Máximo número de secciones (niveles).")
    parser.add_argument("--max-paragraphs", type=int, default=4, help="Máximo de párrafos por sección.")
    parser.add_argument("--model", default="gpt-4.1-mini", help="Modelo de OpenAI a usar.")

    args = parser.parse_args()

    story = process_pdf_into_story(
        args.pdf_path,
        max_paragraphs_per_section=args.max_paragraphs,
        max_sections=min(args.max_sections, 5),  # forzamos el máximo a 5
        model=args.model,
    )

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(story, f, ensure_ascii=False, indent=2)

    print(f"Historia procesada y guardada en {args.out}")


if __name__ == "__main__":
    main()
