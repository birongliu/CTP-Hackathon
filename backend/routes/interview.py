from flask import Blueprint, request, jsonify
from config import DEFAULT_NUM_QUESTIONS
from services.auth import get_user_id_from_auth
from services.interview_logic import first_question_logic, evaluate_and_next_logic
from db.supabase_db import (
    create_session, insert_question, get_latest_qa, save_answer,
    insert_eval, get_all_qas, mark_session_done, get_session
)

bp = Blueprint("interview", __name__)

@bp.post("/start")
def start():
    user_id = get_user_id_from_auth(request.headers.get("Authorization"))
    body = request.get_json(force=True) or {}
    track = body.get("track", "behavioral")
    num_questions = int(body.get("num_questions", DEFAULT_NUM_QUESTIONS))

    # 1) create session
    session_id = create_session(user_id, track, num_questions)

    # 2) get first question from graph
    q1, history = first_question_logic()

    # 3) save Q1 as turn_index=1
    insert_question(session_id, 1, q1)

    # 4) return to UI (also return minimal history so UI could persist if needed)
    return jsonify({"session_id": session_id, "question": q1, "history": history})

@bp.post("/answer")
def answer():
    _user_id = get_user_id_from_auth(request.headers.get("Authorization"))
    b = request.get_json(force=True)
    session_id = b["session_id"]
    user_answer = b["answer"]

    # 1) get current (latest) QA row (should be unanswered)
    cur = get_latest_qa(session_id)
    if not cur:
        return jsonify({"error": "No question found for session"}), 400
    if cur.get("answer"):
        # already answered; client may have double-posted
        return jsonify({"error": "Latest question already answered"}), 400

    # 2) save answer
    save_answer(cur["id"], user_answer)

    # 3) reconstruct history for graph: all Q/A up to now
    #    (fetch all to be safe and ordered)
    all_qas = get_all_qas(session_id)
    history = []
    for qa in all_qas:
        history.append(f"Q: {qa['question']}")
        if qa.get("answer"):
            history.append(f"A: {qa['answer']}")

    # 4) evaluate + possibly ask next question
    eval_out = evaluate_and_next_logic(cur["question"], user_answer, history)
    score, feedback = eval_out["score"], eval_out["feedback"]
    next_q = eval_out["next_question"]
    new_history = eval_out["history"]

    # 5) insert eval
    insert_eval(cur["id"], score, feedback)

    # 6) decide if we need another question
    sess = get_session(session_id)
    next_turn = cur["turn_index"] + 1
    if next_turn <= int(sess["num_questions"]):
        insert_question(session_id, next_turn, next_q)
        done = False
    else:
        mark_session_done(session_id)
        next_q = None
        done = True

    return jsonify({
        "evaluation": {"score": score, "feedback": feedback},
        "done": done,
        "next_question": next_q,
        "history": new_history
    })

@bp.get("/summary")
def summary():
    session_id = request.args.get("session_id")
    qas = get_all_qas(session_id)
    questions = [q["question"] for q in qas]
    answers = [q.get("answer", "") for q in qas]
    evals = [{
        "score": (q["evals"][0]["ai_interviewer_score"] if q.get("evals") else None),
        "feedback": (q["evals"][0]["ai_interviewer_feedback"] if q.get("evals") else None)
    } for q in qas]

    # simple coach tip (you can call model here if you want)
    coach_tip = "Use STAR (Situation, Task, Action, Result) and include measurable outcomes."

    return jsonify({
        "questions": questions,
        "answers": answers,
        "evaluations": evals,
        "coach_tip": coach_tip
    })
