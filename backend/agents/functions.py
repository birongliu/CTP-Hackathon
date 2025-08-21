from typing import Dict, List, Any, cast
from agents.agents import build_graph, InterviewState, generate_coaching_tips

# Global state to maintain the graph instance
_graph = None
_state = None

def _get_graph():
    """Get or create the graph instance"""
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph

def generate_first_question(mode="technical") -> Dict[str, Any]:
    """Generate the first interview question using the graph's invoke method"""
    global _state
    
    # Initialize the workflow
    graph = _get_graph()
    
    # Create initial state for the graph invocation
    # Cast to InterviewState to satisfy type checking
    initial_state = cast(InterviewState, {
        "mode": mode,
        "history": [],
        "questions": [],
        "round": 0,
        "question": "",
        "candidate_answer": "",  # No answer yet for the first question
        "ai_feedback": "",
        "judge_score": 0.0,
        "judge_feedback": "",
        "all_judge_lines": []
    })
    
    # Invoke the graph with the initial state
    # This will run the interviewer node and generate the first question
    result = graph.invoke(initial_state)
    
    # Extract the question from the result
    question = result["question"]
    
    # Update our state for subsequent operations
    _state = {
        "mode": mode,
        "history": result["history"],  # This now contains only the question
        "questions": result["questions"],
        "round": result["round"],
        "question": question,
        "candidate_answer": "",
        "ai_feedback": "",
        "judge_score": 0.0,
        "judge_feedback": "",
        "all_judge_lines": []
    }
    
    return {
        "question": question,
        "history": _state["history"]
    }

def judge_step(question: str, answer: str, history: List[str]) -> Dict[str, Any]:
    """Judge the answer and generate the next question using the graph"""
    global _state
    
    if _state is None:
        # If state doesn't exist, recreate it based on history
        mode = "technical"  # Default mode
        # Try to extract mode from history
        for h in history:
            if "mode: behavioral" in h:
                mode = "behavioral"
                break
                
        _state = {
            "mode": mode,
            "history": history.copy(),
            "questions": [h[2:].strip() for h in history if h.startswith("Q:")],
            "round": len([h for h in history if h.startswith("Q:")]),
            "question": question,
            "candidate_answer": "",
            "ai_feedback": "",
            "judge_score": 0.0,
            "judge_feedback": "",
            "all_judge_lines": []
        }
    
    # Import here to avoid circular imports
    from agents.agents import process_candidate_answer
    
    # First, process the candidate's answer
    graph_state = cast(InterviewState, _state)
    updated_state = process_candidate_answer(graph_state, answer)
    
    # Update our global state with the processed answer
    _state["history"] = updated_state["history"]
    _state["candidate_answer"] = answer
    _state["ai_feedback"] = updated_state["ai_feedback"]
    
    # Prepare state for judge invocation
    judge_state = cast(InterviewState, {
        "mode": _state["mode"],
        "history": _state["history"].copy(),
        "questions": _state["questions"].copy(),
        "round": _state["round"],
        "question": question,
        "candidate_answer": answer,
        "ai_feedback": _state["ai_feedback"],
        "judge_score": _state.get("judge_score", 0.0),
        "judge_feedback": _state.get("judge_feedback", ""),
        "all_judge_lines": _state.get("all_judge_lines", []).copy()
    })
    
    # Invoke the graph to run the judge node
    graph = _get_graph()
    result = graph.invoke(judge_state)
    
    # Extract results from the graph execution
    judge_eval = result["judge_feedback"]
    _state["judge_feedback"] = judge_eval
    _state["judge_score"] = result["judge_score"]
    _state["all_judge_lines"] = result["all_judge_lines"]
    
    # The next question will be in the result if we continue the graph flow
    # Otherwise, we need to prepare for the next round
    _state["round"] += 1
    
    # Use the interviewer node to generate the next question
    interviewer_state = cast(InterviewState, {
        "mode": _state["mode"],
        "history": _state["history"].copy(),
        "questions": _state["questions"].copy(),
        "round": _state["round"],
        "question": "",
        "candidate_answer": "",
        "ai_feedback": "",
        "judge_score": 0.0,
        "judge_feedback": "",
        "all_judge_lines": _state["all_judge_lines"].copy()
    })
    
    # Generate the next question using the interviewer node
    next_result = graph.invoke(interviewer_state)
    next_question = next_result["question"]
    
    # Update global state with the next question and history
    _state["history"] = next_result["history"]
    _state["questions"] = next_result["questions"]
    
    # Prepare response with the evaluation and next question
    return {
        "evaluation_raw_json": judge_eval,
        "next_question": next_question,
        "history": _state["history"]
    }

def generate_coaching_summary(mode: str, history: List[str]) -> str:
    """Generate coaching tips based on the interview history"""
    # For coaching, use the original function from agents.py
    # This leverages the existing implementation
    
    # Extract judge lines from state if available
    judge_lines = _state.get("all_judge_lines", []) if _state else []
    
    # Call the existing coaching function
    return generate_coaching_tips(mode, history, judge_lines)