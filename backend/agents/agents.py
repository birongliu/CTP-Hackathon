from langgraph.graph import StateGraph, END
from typing import TypedDict, List
from openai import OpenAI
import os

# Setup OpenAI/Ollama client
client = OpenAI(base_url="http://localhost:11434/v1", api_key=os.getenv("OLLAMA_KEY", "ola"))

# ---- STATE ----
class InterviewState(TypedDict):
    history: List[str]       # conversation history
    question: str            # current question
    candidate_answer: str    # latest answer
    ai_feedback: str         # feedback from interviewer
    judge_score: str         # judge score
    judge_feedback: str      # judge comments

# ---- SYSTEM PROMPTS ----
def get_interviewer_prompt(history: List[str]):
    return f"""
You are an AI interviewer. Continue the interview.

Conversation so far:
{chr(10).join(history)}

Ask the next question for the candidate. Keep it short and clear.
"""

def get_judge_prompt(question: str, candidate_answer: str, ai_feedback: str):
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

# ---- AGENTS ----
def interviewer_node(state: InterviewState):
    history = state.get("history", [])
    
    # Generate next question
    response = client.chat.completions.create(
        model="qwen2.5:14b-instruct",
        messages=[{"role": "system", "content": "You are a helpful interviewer."},
                  {"role": "user", "content": get_interviewer_prompt(history)}]
    )
    question = response.choices[0].message.content.strip()
    print(f"\n🤖 Interviewer: {question}")
    
    # Human input
    candidate_answer = input("👤 Your Answer: ")

    ai_feedback = f"Noted your answer: '{candidate_answer}'."
    
    # Update history
    history.append(f"Q: {question}")
    history.append(f"A: {candidate_answer}")
    
    return {
        "history": history,
        "question": question,
        "candidate_answer": candidate_answer,
        "ai_feedback": ai_feedback
    }

def judge_node(state: InterviewState):
    question = state["question"]
    candidate_answer = state["candidate_answer"]
    ai_feedback = state["ai_feedback"]

    response = client.chat.completions.create(
        model="qwen2.5:14b-instruct",
        messages=[
            {"role": "system", "content": "You are a judge evaluating interview quality."},
            {"role": "user", "content": get_judge_prompt(question, candidate_answer, ai_feedback)}
        ]
    )

    judge_eval = response.choices[0].message.content
    print(f"\n⚖️ Judge: {judge_eval}\n")

    return {
        "judge_score": judge_eval,
        "judge_feedback": "Scoring complete"
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

# ---- RUN LOOP ----
if __name__ == "__main__":
    workflow = build_graph()

    # Start with empty history
    state = {"history": []}

    for i in range(3):   # 3 interview questions
        state = workflow.invoke(state)

    print("\n✅ Interview Finished")
    print("History:\n", "\n".join(state))
