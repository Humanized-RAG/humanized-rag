# backend/humanizer.py
import random
import re

FILLERS = ["um", "you know", "like", "hmm", "I mean"]
OPENERS = ["Hmm, let me think…", "Well,", "That’s a good question.", "Honestly,"]

def inject_fillers(text: str, prob=0.2) -> str:
    # Insert small fillers at random sentence boundaries
    parts = re.split(r'([.!?])', text)
    out = []
    for i in range(0, len(parts), 2):
        sent = parts[i].strip()
        punct = parts[i+1] if i+1 < len(parts) else ""
        if sent and random.random() < prob:
            sent = random.choice(FILLERS) + " " + sent
        out.append(sent + punct)
    return " ".join(p for p in out if p).strip()

def short_anecdote() -> str:
    candidates = [
        "Back when I started, I built a tiny project like this.",
        "I remember trying something similar in a small project.",
        "In an internship I once did, we faced something like this."
    ]
    return random.choice(candidates)

def humanize_text(text: str) -> str:
    text = text.strip()
    # Add opener sometimes
    if random.random() > 0.5:
        text = random.choice(OPENERS) + " " + text
    # Inject fillers
    text = inject_fillers(text, prob=0.18)
    # Maybe append a micro anecdote
    if random.random() < 0.35:
        text += " " + short_anecdote()
    return text
