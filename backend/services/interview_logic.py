import json
from typing import List, Tuple, Dict, Any
from agents import generate_first_question, judge_step

def first_question_logic(mode) -> Tuple[str, List[str]]:
    out = generate_first_question(mode)
    return out["question"], out["history"]

def evaluate_and_next_logic(question: str, answer: str, history: List[str]) -> Dict[str, Any]:
    out = judge_step(question, answer, history)
    # parse judge JSON safely
    try:
        j = json.loads(out["evaluation_raw_json"])
        score = int(j.get("ai_interviewer_score", 3))
        feedback = j.get("ai_interviewer_feedback", "")
    except Exception:
        score, feedback = 3, "Feedback unavailable."
    return {
        "score": score,
        "feedback": feedback,
        "next_question": out["next_question"],
        "history": out["history"]
    }
