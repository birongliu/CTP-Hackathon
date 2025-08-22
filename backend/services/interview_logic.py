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
        print("out", out)
        # Check if the output is already in JSON format
        if isinstance(out["evaluation_raw_json"], dict):
            j = out["evaluation_raw_json"]
        else:
            # Try to parse as JSON
            try:
                j = json.loads(out["evaluation_raw_json"])
            except json.JSONDecodeError:
                # Handle the case where it's a plain string
                eval_text = out["evaluation_raw_json"]
                j = {}
                # Extract score from "Score: X" format
                if "Score:" in eval_text:
                    try:
                        score_part = eval_text.split("Score:")[1].split(".")[0].strip()
                        j["ai_interviewer_score"] = int(score_part)
                    except (ValueError, IndexError):
                        pass
                # Extract feedback from "Feedback: X" format
                if "Feedback:" in eval_text:
                    try:
                        j["ai_interviewer_feedback"] = eval_text.split("Feedback:")[1].strip()
                    except IndexError:
                        pass
        
        score = int(j.get("ai_interviewer_score", 3))
        feedback = j.get("ai_interviewer_feedback", "")
        
    except Exception as e:
        print(f"Error processing evaluation: {e}")
        score, feedback = 3, "Feedback unavailable."
    return {
        "score": score,
        "feedback": feedback,
        "next_question": out["next_question"],
        "history": out["history"]
    }
