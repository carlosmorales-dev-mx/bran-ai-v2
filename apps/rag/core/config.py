from pathlib import Path
from dotenv import load_dotenv
import os

# 🔥 ruta real al root
ENV_PATH = Path(__file__).resolve().parents[3] / ".env"

load_dotenv(dotenv_path=ENV_PATH)

# LLM_PROVIDER: quién genera las respuestas del chat (gemini | deepseek)
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")

# ✅ NUEVO: EMBEDDING_PROVIDER es independiente de LLM_PROVIDER.
# DeepSeek no tiene una API pública de embeddings, así que aunque uses
# DeepSeek para generar respuestas, los embeddings deben seguir viniendo
# de Gemini (o de cualquier otro proveedor que sí los soporte).
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "gemini")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL")
