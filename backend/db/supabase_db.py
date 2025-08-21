from typing import Any, Dict, List, Optional
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

_sb: Optional[Client] = None

def sb() -> Client:
    global _sb
    if _sb is None:
        if SUPABASE_URL is None or SUPABASE_SERVICE_KEY is None:
            raise ValueError("SUPABASE_URL or SUPABASE_SERVICE_KEY not found")
        _sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _sb

# --- Sessions ---
def create_session(user_id: str, track: str, num_questions: int) -> str:
    res = sb().table("sessions").insert({
        "user_id": user_id, "track": track, "num_questions": num_questions
    }).execute()
    return res.data[0]["id"]

def mark_session_done(session_id: str):
    sb().table("sessions").update({"status": "done", "finished_at": "now()"}).eq("id", session_id).execute()

def get_session(session_id: str) -> Dict[str, Any]:
    res = sb().table("sessions").select("*").eq("id", session_id).single().execute()
    return res.data

# --- QA ---
def insert_question(session_id: str, turn_index: int, question: str) -> str:
    res = sb().table("qa_pairs").insert({
        "session_id": session_id, "turn_index": turn_index, "question": question
    }).execute()
    return res.data[0]["id"]

def get_latest_qa(session_id: str) -> Optional[Dict[str, Any]]:
    res = (sb().table("qa_pairs")
           .select("*").eq("session_id", session_id)
           .order("turn_index", desc=True).limit(1)
           .execute())
    
    return res.data[0] if res.data else None

def get_all_qas(session_id: str) -> List[Dict[str, Any]]:
    res = (sb().table("qa_pairs")
           .select("id,turn_index,question,answer,evals(*)")
           .eq("session_id", session_id)
           .order("turn_index", desc=False).execute())
    return res.data

def save_answer(qa_id: str, answer: str):
    sb().table("qa_pairs").update({"answer": answer}).eq("id", qa_id).execute()

# --- Evals ---
def insert_eval(qa_id: str, score: int, feedback: str):
    sb().table("evals").insert({
        "qa_id": qa_id, "ai_interviewer_score": score, "ai_interviewer_feedback": feedback
    }).execute()
