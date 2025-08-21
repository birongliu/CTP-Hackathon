from typing import List

TECH_TOPICS = [
    "data structures & algorithms",
    "system design tradeoffs",
    "complexity & Big-O",
    "concurrency and threads",
    "databases and indexing",
    "networking and HTTP",
    "testing & debugging strategy",
]
BEHAV_TOPICS = [
    "teamwork/conflict resolution",
    "ownership and accountability",
    "deadline/pressure management",
    "communication with non-technical stakeholders",
    "leadership and influence",
    "learning from mistakes",
    "prioritization and ambiguity",
]

def get_interviewee_prompt(mode: str, recent_questions: List[str], round_num: int) -> str:
    topics = TECH_TOPICS if mode == "technical" else BEHAV_TOPICS
    topic_hint = topics[(round_num - 1) % len(topics)]
    style = (
        "Ask ONE concise TECHNICAL interview question.\n"
        "- Focus on correctness, tradeoffs, and depth.\n"
        "- Keep it short (≤25 words)."
        if mode == "technical" else
        "Ask ONE concise BEHAVIORAL interview question.\n"
        "- Use STAR-friendly phrasing (Situation, Task, Action, Result).\n"
        "- Keep it short (≤25 words)."
    )
    recent_block = "\n".join("- " + q for q in recent_questions[-3:]) if recent_questions else "(none)"
    return f"""
    You are an AI Interviewer.  
    Your sole job is to generate **exactly ONE interview question in English**.  
    Do not include explanations, prefacing text, or anything besides the raw question.

    # Style Guide
    {style}

    # Context Controls
    - Focus of this round: {topic_hint}
    - DO NOT repeat, rephrase, or closely resemble any of the following recent questions:
    {recent_block}

    # Output Rule
    Produce one new, in-depth {mode} interview question only.  
    Return only the question text.

""".strip()