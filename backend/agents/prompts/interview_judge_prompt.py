def get_judge_user_and_interviewer_prompt(mode: str, question: str, answer: str, ai_feedback: str) -> str:
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