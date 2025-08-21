from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict, Any, Union, Literal
from openai import OpenAI
from .prompts import get_interviewee_prompt, get_interviewer_system_prompt, get_judge_user_and_interviewer_prompt, get_interview_couch_user_prompt
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
class InterviewState(TypedDict):
    mode: Literal["technical", "behavioral"] # "technical" | "behavioral"
    history: List[str]             # "Q: ..." / "A: ..." lines
    questions: List[str]           # questions asked
    round: int                     # 1-based round counter
    question: str                  # current question
    candidate_answer: str          # latest answer
    ai_feedback: str               # interviewer feedback
    judge_score: float             # per-round score (float)
    judge_feedback: str            # per-round judge line
    all_judge_lines: List[str]     # collected judge feedback across rounds





# ---- NODES ----
def interviewer_node(state: InterviewState) -> InterviewState:
    """Generate the next interview question without waiting for a response.
    
    This node increments the interview round and asks the model to produce a new
    interview question (avoiding repetition and adding a topic hint). This function
    is designed to work with a web frontend - it doesn't collect the candidate's 
    answer directly but returns a state with the question that the frontend can 
    display to the user.

    Args:
        state: A mapping representing the current interview state. Expected keys:
            - "mode": str, interview type ("technical" or "behavioral").
            - "history": list of str, alternating Q/A lines from prior rounds.
            - "questions": list of str, previously asked questions.
            - "round": int, current round number (0-based before increment).
            - "candidate_answer": str, the user's previous answer (if any).

    Returns:
        InterviewState: A new state dictionary with updated fields:
            - "history": appended with the new Q (the answer will be added later).
            - "questions": includes the new question.
            - "round": incremented round number.
            - "question": the text of the new question.
            - "ai_feedback": lightweight acknowledgement string.

    Side Effects:
        - Calls the chat completion API to generate a question.
        - Only updates the history with the question (answer will be added later).
        
    Example:
        >>> state = {"mode": "technical", "history": [], "questions": [], "round": 0}
        >>> new_state = interviewer_node(state)
        >>> print(new_state["question"])
        Explain the difference between a list and a tuple in Python.
    """

    mode = state.get("mode", "")
    history = state.get("history", [])
    qs = state.get("questions", [])
    round_num = state.get("round", 0) + 1  # increment
    
    # If there's a candidate answer from previous round, provide feedback
    candidate_answer = state.get("candidate_answer", "")
    ai_feedback = ""
    
    if candidate_answer:
        ai_feedback = f"Thanks — noted. (mode: {mode}, round {round_num-1})"
    
    # Generate next question with anti-repeat + topic hint
    resp = client.chat.completions.create(
        model=INTERVIEW_MODEL,
        messages=[
            {"role": "system", "content": get_interviewer_system_prompt()},
            {"role": "user", "content": get_interviewee_prompt(mode, qs, round_num)}
        ],
        temperature=0.7,
        max_tokens=80,
        timeout=120
    )
    question = (resp.choices[0].message.content or "").strip()

    # Update history with just the question
    # (answer will be added when the user responds via the frontend)
    history.append(f"Q: {question}")
    qs.append(question)

    return {
        **state,
        "history": history,
        "questions": qs,
        "round": round_num,
        "question": question,
        "ai_feedback": ai_feedback
    }

def process_candidate_answer(state: InterviewState, answer: str) -> InterviewState:
    """Process the candidate's answer received from the frontend.
    
    This function updates the interview state with the candidate's answer
    received from the frontend UI.
    
    Args:
        state: The current interview state.
        answer: The candidate's answer string received from the frontend.
        
    Returns:
        InterviewState: Updated state with the candidate's answer.
    """
    # Make a copy of the current history
    history = state.get("history", []).copy()
    
    # Add the answer to the history
    history.append(f"A: {answer}")
    
    # Generate appropriate feedback
    mode = state.get("mode", "")
    round_num = state.get("round", 1)
    ai_feedback = f"Thanks — noted. (mode: {mode}, round {round_num})"
    
    return {
        **state,
        "history": history,
        "candidate_answer": answer,
        "ai_feedback": ai_feedback
    }

def judge_node(state: InterviewState) -> InterviewState:
    mode = state.get("mode", "")
    question = state.get("question", "")
    answer = state.get("candidate_answer", "")
    ai_feedback = state.get("ai_feedback", "")

    resp = client.chat.completions.create(
        model=JUDGE_MODEL,
        messages=[
            {"role": "system", "content": "You are a concise interview judge. Reply in one short line, in English."},
            {"role": "user", "content": get_judge_user_and_interviewer_prompt(mode, question, answer, ai_feedback)}
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
        "judge_score": float(score),
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
            {"role": "user", "content": get_interview_couch_user_prompt(mode, history_lines, judge_lines)}
        ],
        temperature=0.3,
        max_tokens=900,
        timeout=180
    )
    md = (resp.choices[0].message.content or "").strip()

    return md


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
    state: InterviewState = {
        "mode": mode,
        "history": [],
        "questions": [],
        "round": 0,
        "question": "",
        "candidate_answer": "",
        "ai_feedback": "",
        "judge_score": 0.0,
        "judge_feedback": "",
        "all_judge_lines": []
    }

    for _ in range(rounds):
        result = workflow.invoke(state)
        # Cast the result back to InterviewState
        state = InterviewState(**result)

    print("\n✅ Interview Finished")
    print("History:\n", "\n".join(state.get("history", [])))

    # ---- Personalized tips right after history ----
    tips_md = generate_coaching_tips(state["mode"], state["history"], state.get("all_judge_lines", []))
    print("\n📈 Strong Coaching Tips\n")
    print(tips_md)