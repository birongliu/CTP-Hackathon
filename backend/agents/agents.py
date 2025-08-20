from openai import OpenAI
import os, json

client = OpenAI(base_url='http://localhost:11434/v1', api_key=os.getenv("OLLAMA_KEY", "ola"))

# -------------------------
# System prompt for Judge AI
# -------------------------
def get_judge_system_prompt():
    return '''
You are an evaluator for AI-conducted interviews. Assess both:
1. The AI Interviewer (how well it asked questions/prompts)
2. The User (candidate) response

Respond in strict JSON:
{
    "user_score": int (1-5),
    "user_feedback": "string",
    "ai_interviewer_score": int (1-5),
    "ai_interviewer_feedback": "string"
}
Behavioral: STAR (Situation, Task, Action, Result)
Technical: correctness, completeness, clarity
'''

# -------------------------
# Judge AI
# -------------------------
def judge_ai(question: str, answer: str):
    user_prompt = f"""
Question: "{question}"
Candidate Answer: "{answer}"
"""
    response = client.chat.completions.create(
        model="qwen2.5:14b-instruct",
        messages=[
            {"role": "system", "content": get_judge_system_prompt()},
            {"role": "user", "content": user_prompt}
        ]
    )
    # parse JSON safely
    raw_content = response.choices[0].message.content
    start = raw_content.find("{")
    end = raw_content.rfind("}") + 1
    return json.loads(raw_content[start:end])

# -------------------------
# Interviewer Agent
# -------------------------
def ai_interviewer(interview_type, round_num):
    if interview_type == "behavioral":
        return f"Tell me about a time you faced a challenge at work (Question {round_num})?"
    else:
        return f"How would you reverse a linked list? (Question {round_num})"

# -------------------------
# Main Interview Loop
# -------------------------
def run_interview(interview_type="technical", rounds=3):
    history = []
    for i in range(1, rounds + 1):
        # 1. Interviewer asks a question
        question = ai_interviewer(interview_type, i)
        print(f"AI Interviewer: {question}")

        # 2. User input
        answer = input("Your Answer: ")

        # 3. Judge AI evaluates both
        evaluation = judge_ai(question, answer)

        # 4. Show feedback
        print("\n--- Feedback ---")
        print(f"Your Score: {evaluation['user_score']}")
        print(f"Your Feedback: {evaluation['user_feedback']}")
        print(f"AI Interviewer Score: {evaluation['ai_interviewer_score']}")
        print(f"AI Interviewer Feedback: {evaluation['ai_interviewer_feedback']}")
        print("----------------\n")

        # 5. Save to history
        history.append({
            "question": question,
            "answer": answer,
            **evaluation
        })

    # 6. Summary at the end
    print("\n=== Interview Summary ===")
    for idx, entry in enumerate(history, 1):
        print(f"\nQuestion {idx}: {entry['question']}")
        print(f"Your Answer: {entry['answer']}")
        print(f"Your Score: {entry['user_score']}, Feedback: {entry['user_feedback']}")
        print(f"AI Interviewer Score: {entry['ai_interviewer_score']}, Feedback: {entry['ai_interviewer_feedback']}")

# -------------------------
# Run it
# -------------------------
if __name__ == "__main__":
    interview_type = input("Select interview type (technical/behavioral): ").strip()
    run_interview(interview_type=interview_type, rounds=3)
