# backend/main.py
import os
import textwrap
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from duckduckgo_search import ddg
from humanizer import humanize_text
import subprocess
from dotenv import load_dotenv

load_dotenv()

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")
SEARCH_MAX_RESULTS = int(os.getenv("SEARCH_MAX_RESULTS", "3"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    message: str

def web_search(query: str, max_results: int = 3):
    """Use duckduckgo to fetch a few snippets (title, snippet, link)."""
    results = ddg(query, region="wt-wt", safesearch="Moderate", max_results=max_results)
    # ddg returns list of dicts with title, body, href
    snippets = []
    links = []
    if results:
        for r in results:
            title = r.get("title") or ""
            body = r.get("body") or ""
            href = r.get("href") or ""
            snippets.append(f"{title}: {body}")
            links.append(href)
    return snippets, links

def build_prompt(question: str, snippets: list[str]) -> str:
    # Compose a short prompt including web context
    search_block = "\n".join(f"- {s}" for s in snippets) if snippets else "No recent web results found."
    prompt = textwrap.dedent(f"""
    You are an expert interview assistant. Use the web search results below as factual sources.
    If the web results contain relevant info, prefer them and cite them. Do not invent facts.
    Answer the user's question concisely, then speak naturally — in a casual, slightly imperfect spoken tone,
    with occasional small fillers (e.g. "um", "you know") and a short micro-anecdote if appropriate.

    Web results:
    {search_block}

    User question:
    {question}

    Provide the answer. Keep it concise (2-3 short paragraphs).
    """).strip()
    return prompt

def call_ollama(prompt: str, model: str = OLLAMA_MODEL, timeout=60) -> str:
    """Call Ollama locally via subprocess. The prompt is sent to stdin for 'ollama run <model>'."""
    try:
        proc = subprocess.run(
            ["ollama", "run", model],
            input=prompt,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        out = proc.stdout.strip()
        if not out:
            # fallback to stderr if no stdout
            out = proc.stderr.strip()
        return out
    except Exception as e:
        return f"Error calling local LLM: {e}"

@app.post("/chat")
async def chat(q: Query):
    user_q = q.message.strip()
    # 1. Web search for freshness (you can make this conditional)
    snippets, links = web_search(user_q, max_results=SEARCH_MAX_RESULTS)

    # 2. Build prompt that includes web snippets and user question
    prompt = build_prompt(user_q, snippets)

    # 3. Call local LLM (Ollama)
    raw_answer = call_ollama(prompt)

    # 4. Additional humanization layer (extra randomness)
    humanized = humanize_text(raw_answer)

    return {"answer": humanized, "sources": links}
