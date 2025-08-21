import os
from dotenv import load_dotenv
load_dotenv()

DEFAULT_NUM_QUESTIONS = int(os.getenv("DEFAULT_NUM_QUESTIONS", "5"))

# LLM (Ollama via OpenAI compat)
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "http://localhost:11434/v1")
OLLAMA_KEY = os.getenv("OLLAMA_KEY", "ola")

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
