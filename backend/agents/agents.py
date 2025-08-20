from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict, Any
from openai import OpenAI
import os

# ---- Client (Ollama OpenAI-compatible) ----
INTERVIEW_MODEL = os.getenv("INTERVIEW_MODEL", "qwen2.5:7b-instruct")
JUDGE_MODEL     = os.getenv("JUDGE_MODEL", "qwen2.5:7b-instruct")
COACH_MODEL     = os.getenv("COACH_MODEL", JUDGE_MODEL)  # reuse judge by default

client = OpenAI(
    base_url=os.getenv("OLLAMA_HOST", "http://localhost:11434/v1"),
    api_key=os.getenv("OLLAMA_KEY", "ola")
)

# ---- STATE ----
class InterviewState(TypedDict, total=False):
    mode: str                      # "technical" | "behavioral"
    history: List[str]             # "Q: ..." / "A: ..." lines
    questions: List[str]           # questions asked
    round: int                     # 1-based round counter
    question: str                  # current question
    candidate_answer: str          # latest answer
    ai_feedback: str               # interviewer feedback
    judge_score: str               # per-round score (string)
    judge_feedback: str            # per-round judge line
    all_judge_lines: List[str]     # collected judge feedback across rounds

# Topic maps to push variety per round
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

# ---- PROMPTS ----
def interviewer_prompt(mode: str, recent_questions: List[str], round_num: int) -> str:
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
You are an AI interviewer. Output ONLY the question text in English — no preface.

{style}
- This round's focus: {topic_hint}.
- DO NOT repeat or paraphrase any recent questions.

Recent questions to avoid:
{recent_block}

Now produce ONE new {mode} interview question.
""".strip()

def judge_prompt(mode: str, question: str, answer: str, ai_feedback: str) -> str:
    rubric = (
        "Grade 1–5 on correctness, completeness, clarity, and tradeoffs. Mention Big-O when relevant."
        if mode == "technical" else
        "Grade 1–5 based on STAR: Was the Situation/Task/Action/Result clear and quantified?"
    )
    return f"""
You are an AI judge. Evaluate this interview step in one concise line.

Mode: {mode}
Question: {question}
Candidate Answer: {answer}
Interviewer Feedback: {ai_feedback}

{rubric}
Reply as: "Score: <1-5>. Feedback: <one short sentence>."
""".strip()

def coach_prompt(mode: str, history_lines: List[str], judge_lines: List[str]) -> str:
    mode_line = "BEHAVIORAL (STAR)" if mode == "behavioral" else "TECHNICAL"
    history_block = "\n".join(history_lines[-12:]) if history_lines else "(no history)"
    judge_block = "\n".join(judge_lines[-12:]) if judge_lines else "(no judge notes)"

    return f"""
You are a concise interview coach. Session type: {mode_line}.
Write ONLY three short markdown sections. No preface, no outro, no code fences.

### Strengths
- Two bullets, concrete and specific.

### Improvements
- Three bullets with actionable phrasing (e.g., "Start with X", "Include Y", "Quantify Z").
- Keep each bullet under 16 words.

### Next practice
- One mini-task (3 steps) the user can do in 10 minutes.

Use only the evidence below.

HISTORY:
{history_block}

JUDGE:
{judge_block}
""".strip()


# ---- NODES ----
def interviewer_node(state: InterviewState) -> InterviewState:
    mode = state["mode"]
    history = state.get("history", [])
    qs = state.get("questions", [])
    round_num = state.get("round", 0) + 1  # increment

    # Generate next question with anti-repeat + topic hint
    resp = client.chat.completions.create(
        model=INTERVIEW_MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful interviewer. Respond with ONE question only, in English."},
            {"role": "user", "content": interviewer_prompt(mode, qs, round_num)}
        ],
        temperature=0.7,
        max_tokens=80,
        timeout=120
    )
    question = (resp.choices[0].message.content or "").strip()

    print(f"\n🤖 Interviewer: {question}")
    candidate_answer = input("👤 Your Answer: ").strip()

    ai_feedback = f"Thanks — noted. (mode: {mode}, round {round_num})"

    # Update history
    history.append(f"Q: {question}")
    history.append(f"A: {candidate_answer}")
    qs.append(question)

    return {
        **state,
        "history": history,
        "questions": qs,
        "round": round_num,
        "question": question,
        "candidate_answer": candidate_answer,
        "ai_feedback": ai_feedback
    }

def judge_node(state: InterviewState) -> InterviewState:
    mode = state["mode"]
    question = state["question"]
    answer = state["candidate_answer"]
    ai_feedback = state["ai_feedback"]

    resp = client.chat.completions.create(
        model=JUDGE_MODEL,
        messages=[
            {"role": "system", "content": "You are a concise interview judge. Reply in one short line, in English."},
            {"role": "user", "content": judge_prompt(mode, question, answer, ai_feedback)}
        ],
        temperature=0.2,
        max_tokens=80,
        timeout=120
    )
    judge_eval = (resp.choices[0].message.content or "").strip()
    print(f"⚖️ Judge: {judge_eval}\n")

    # naive parse: first digit 1-5
    score = next((c for c in judge_eval if c in "12345"), "?")
    lines = state.get("all_judge_lines", [])
    lines.append(judge_eval)

    return {
        **state,
        "judge_score": str(score),
        "judge_feedback": judge_eval,
        "all_judge_lines": lines
    }

# ---- GRAPH ----
def build_graph():
    graph = StateGraph(InterviewState)
    graph.add_node("interviewer", interviewer_node)
    graph.add_node("judge", judge_node)
    graph.set_entry_point("interviewer")
    graph.add_edge("interviewer", "judge")
    graph.add_edge("judge", END)
    return graph.compile()

# ---- COACHING (after the loop) ----
def generate_coaching_tips(mode: str, history_lines: List[str], judge_lines: List[str]) -> str:
    resp = client.chat.completions.create(
        model=COACH_MODEL,
        messages=[
            {"role": "system", "content": "You are a direct, practical interview coach. Respond in clear markdown."},
            {"role": "user", "content": coach_prompt(mode, history_lines, judge_lines)}
        ],
        temperature=0.3,
        max_tokens=900,
        timeout=180
    )
    return (resp.choices[0].message.content or "").strip()

# ---- RUN ----
if __name__ == "__main__":
    mode = input("Select interview type (technical/behavioral): ").strip().lower()
    if mode not in ("technical", "behavioral"):
        print("Defaulting to 'technical'.")
        mode = "technical"

    try:
        rounds = int(input("How many questions? (default 3): ").strip() or "3")
    except Exception:
        rounds = 3

    workflow = build_graph()
    state: InterviewState = {"mode": mode, "history": [], "questions": [], "round": 0, "all_judge_lines": []}

    for _ in range(rounds):
        state = workflow.invoke(state)

    print("\n✅ Interview Finished")
    print("History:\n", "\n".join(state["history"]))

    # ---- Personalized tips right after history ----
    tips_md = generate_coaching_tips(state["mode"], state["history"], state.get("all_judge_lines", []))
    print("\n📈 Strong Coaching Tips\n")
    print(tips_md)
