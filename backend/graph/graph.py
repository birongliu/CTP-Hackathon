from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict, Any
from openai import OpenAI
import os
from config import OPENAI_BASE_URL, OLLAMA_KEY

# OpenAI-compatible client pointing to local Ollama
client = OpenAI(base_url=OPENAI_BASE_URL, api_key=OLLAMA_KEY)

MODEL_NAME = "qwen2.5:14b-instruct"  # keep your model

class InterviewState(TypedDict, total=False):
    history: List[str]        # ["Q: ...", "A: ...", ...]
    question: str             # current question
    candidate_answer: str     # latest answer
    ai_feedback: str          # (optional) inline feedback
    judge_score: str          # json string or int as string
    judge_feedback: str

# ---- SYSTEM PROMPTS ----
def get_interviewer_prompt(history: List[str]) -> str:
    return f"""
You are an AI interviewer. Continue the interview.

Conversation so far:
{chr(10).join(history) if history else "None"}

Ask the next question for the candidate. Keep it short and clear.
"""

def get_judge_prompt(question: str, candidate_answer: str, ai_feedback: str) -> str:
    return f"""
You are an AI judge. Evaluate this interview step.

Question: {question}
Candidate Answer: {candidate_answer}
AI Feedback: {ai_feedback}

Respond in JSON ONLY:
{{
  "ai_interviewer_score": "int (1-5)",
  "ai_interviewer_feedback": "string feedback"
}}
"""

# ---- AGENTS (no I/O, return dicts) ----
def interviewer_node(state: InterviewState) -> InterviewState:
    history = state.get("history", [])
    resp = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": "You are a helpful interviewer."},
            {"role": "user", "content": get_interviewer_prompt(history)}
        ]
    )
    question = resp.choices[0].message.content.strip()
    new_history = history + [f"Q: {question}"]
    return {"history": new_history, "question": question}

def judge_node(state: InterviewState) -> InterviewState:
    q = state["question"]
    a = state["candidate_answer"]
    fb = state.get("ai_feedback", f"Noted your answer: '{a}'.")
    resp = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": "You are a judge evaluating interview quality."},
            {"role": "user", "content": get_judge_prompt(q, a, fb)}
        ]
    )
    judge_json = resp.choices[0].message.content.strip()
    # Don't parse here; return raw json string. The route can parse safely.
    return {"judge_score": judge_json, "judge_feedback": "Scoring complete"}

# ---- GRAPH BUILDER ----
def build_graph():
    g = StateGraph(InterviewState)
    g.add_node("interviewer", interviewer_node)
    g.add_node("judge", judge_node)
    g.set_entry_point("interviewer")
    g.add_edge("interviewer", "judge")
    g.add_edge("judge", END)
    return g.compile()

# Convenience helpers the routes will call:

def generate_first_question() -> Dict[str, Any]:
    state: InterviewState = {"history": []}
    compiled = build_graph()
    # Run ONLY interviewer node (ask first question, no judging yet)
    # We can emulate by invoking interviewer_node directly:
    first = interviewer_node(state)
    return {"question": first["question"], "history": first["history"]}

def judge_step(question: str, answer: str, history: List[str]) -> Dict[str, Any]:
    # run judge on the provided Q/A; then also produce next question
    # 1) judge
    jstate: InterviewState = {"question": question, "candidate_answer": answer}
    judged = judge_node(jstate)

    # 2) append answer to history
    new_history = history + [f"A: {answer}"]

    # 3) interviewer asks next question based on updated history
    i_out = interviewer_node({"history": new_history})
    next_q = i_out["question"]
    final_history = i_out["history"]

    return {
        "evaluation_raw_json": judged.get("judge_score", "{}"),
        "next_question": next_q,
        "history": final_history
    }
