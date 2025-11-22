import os
import json
from typing import Dict, Any
from openai import OpenAI
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Verificar que la API key esté configurada
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("""
    No se encontró OPENAI_API_KEY en las variables de entorno.
    Por favor, crea un archivo .env en la raíz del proyecto con:
    OPENAI_API_KEY=tu_clave_aqui
    """)

client = OpenAI(api_key=api_key)


SYSTEM_PROMPT = (
    "Eres un analizador de cuentos infantiles. "
    "Dado un fragmento de historia, debes devolver UNICAMENTE un JSON válido, sin texto extra. "
    "El JSON describe la escena como si fuera un nivel de videojuego para niños."
)


def build_user_prompt(section_text: str) -> str:
    return f"""Analiza la siguiente sección de un cuento infantil.

Devuelve SOLO un JSON con este formato:

{{
  "summary": "resumen corto estilo videojuego infantil",
  "characters": [
    {{
      "name": "string",
      "role": "protagonist | antagonist | sidekick | npc",
      "alignment": "good | evil | neutral"
    }}
  ],
  "locations": ["lista de lugares relevantes"],
  "items": ["lista de objetos importantes"],
  "goals": "objetivo del protagonista en esta sección",
  "conflict": "obstáculo principal en esta sección",
  "tension_level": 0.0
}}

Asegúrate de que:
- tension_level sea un número entre 0.0 y 1.0
- el JSON sea válido
- no incluyas comentarios ni texto fuera del JSON

SECCIÓN:
""" + section_text


def analyze_section_with_openai(section_text: str, model: str = "gpt-4.1-mini") -> Dict[str, Any]:
    """Envía una sección de historia a la API de OpenAI y devuelve el JSON parseado."""
    prompt = build_user_prompt(section_text)

    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )

    content = resp.choices[0].message.content
    # Esperamos que 'content' sea un JSON válido
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        # Si algo sale mal, envolvemos el contenido en una estructura conocida
        data = {
            "summary": "",
            "characters": [],
            "locations": [],
            "items": [],
            "goals": "",
            "conflict": "",
            "tension_level": 0.0,
            "raw": content,
        }
    return data
