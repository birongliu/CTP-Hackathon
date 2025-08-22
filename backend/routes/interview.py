from flask import Blueprint, request, jsonify, abort
from config import DEFAULT_NUM_QUESTIONS
from services.auth import get_user_id_from_auth
from services.interview_logic import first_question_logic, evaluate_and_next_logic
from db.supabase_db import (
    create_session, insert_question, get_latest_qa, save_answer,
    insert_eval, get_all_qas, mark_session_done, get_session
)
import re
import os
import shutil
from datetime import datetime

bp = Blueprint("interview", __name__)

def store_technical_interview_audio(session_id, turn_index, temp_file_path):
    """
    Store the audio file from a technical interview for later review.
    This can be useful for technical interviews where exact wording and code explanation matters.
    
    Args:
        session_id: The interview session ID
        turn_index: The turn/question number
        temp_file_path: Path to the temporary audio file
    
    Returns:
        str: The path where the file was stored
    """
    # Create storage directory if it doesn't exist
    storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                              "storage", "audio", session_id)
    os.makedirs(storage_dir, exist_ok=True)
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_ext = os.path.splitext(temp_file_path)[1]
    filename = f"q{turn_index}_{timestamp}{file_ext}"
    
    # Full path to store the file
    target_path = os.path.join(storage_dir, filename)
    
    # Copy the file
    shutil.copy2(temp_file_path, target_path)
    
    return target_path

def post_process_technical_transcript(text):
    """
    Post-process a technical interview transcript to improve code formatting,
    fix common speech-to-text errors in technical terms, and handle syntax.
    """
    # Common replacements for programming terms that Whisper might misinterpret
    replacements = {
        # Programming languages
        r'\bpie\s?thon\b': 'Python',
        r'\bjava\s?script\b': 'JavaScript',
        r'\bc\s?plus\s?plus\b': 'C++',
        r'\bc\s?sharp\b': 'C#',
        r'\btype\s?script\b': 'TypeScript',
        r'\bgo\s?lang\b': 'Golang',
        
        # Frameworks & Libraries
        r'\breact\s?js\b': 'React',
        r'\bangular\s?js\b': 'Angular',
        r'\bnode\s?js\b': 'Node.js',
        r'\bdot\s?net\b': '.NET',
        r'\bj\s?query\b': 'jQuery',
        r'\bvue\s?js\b': 'Vue.js',
        r'\bflask\b': 'Flask',
        r'\bdjango\b': 'Django',
        r'\bspring\s?boot\b': 'Spring Boot',
        r'\blaravel\b': 'Laravel',
        r'\bnext\s?js\b': 'Next.js',
        r'\btensor\s?flow\b': 'TensorFlow',
        r'\bpie\s?torch\b': 'PyTorch',
        
        # Databases
        r'\bmysequel\b': 'MySQL',
        r'\bsequal\b': 'SQL',
        r'\bpost\s?gress?\b': 'PostgreSQL',
        r'\bmongo\s?d\s?b\b': 'MongoDB',
        r'\bredis\b': 'Redis',
        r'\belastic\s?search\b': 'Elasticsearch',
        r'\bcassandra\b': 'Cassandra',
        r'\boracle\b': 'Oracle',
        
        # Web Technologies
        r'\bapi\b': 'API',
        r'\bapis\b': 'APIs',
        r'\brest\s?ful\b': 'RESTful',
        r'\brest\s?api\b': 'REST API',
        r'\bjson\b': 'JSON',
        r'\bxml\b': 'XML',
        r'\bhtml\b': 'HTML',
        r'\bcss\b': 'CSS',
        r'\bhttp\b': 'HTTP',
        r'\bhttps\b': 'HTTPS',
        r'\burl\b': 'URL',
        r'\burls\b': 'URLs',
        r'\bui\b': 'UI',
        r'\bux\b': 'UX',
        r'\bgraph\s?q\s?l\b': 'GraphQL',
        r'\bweb\s?socket\b': 'WebSocket',
        
        # Architecture & Development Terms
        r'\bback\s?end\b': 'backend',
        r'\bfront\s?end\b': 'frontend',
        r'\bfull\s?stack\b': 'full-stack',
        r'\bdocker\b': 'Docker',
        r'\bkubernetes\b': 'Kubernetes',
        r'\bk8s\b': 'K8s',
        r'\baws\b': 'AWS',
        r'\bazure\b': 'Azure',
        r'\bgcp\b': 'GCP',
        r'\bgit\b': 'Git',
        r'\bgithub\b': 'GitHub',
        r'\blinux\b': 'Linux',
        r'\bunix\b': 'Unix',
        r'\bmac\s?os\b': 'macOS',
        r'\bwindows\b': 'Windows',
        r'\bio\s?t\b': 'IoT',
        r'\bdevops\b': 'DevOps',
        r'\bci\s?cd\b': 'CI/CD',
        r'\bsaas\b': 'SaaS',
        r'\bpaas\b': 'PaaS',
        r'\biaas\b': 'IaaS',
        r'\bmicro\s?services\b': 'microservices',
        r'\bservice\s?oriented\s?architecture\b': 'service-oriented architecture',
        r'\bmonolithic\b': 'monolithic',
        
        # Algorithms & Data Structures
        r'\bbinary\s?search\b': 'binary search',
        r'\bdepth\s?first\s?search\b': 'depth-first search',
        r'\bdfs\b': 'DFS',
        r'\bbreadth\s?first\s?search\b': 'breadth-first search',
        r'\bbfs\b': 'BFS',
        r'\bdynamic\s?programming\b': 'dynamic programming',
        r'\bgreedy\s?algorithm\b': 'greedy algorithm',
        r'\blinked\s?list\b': 'linked list',
        r'\bbinary\s?tree\b': 'binary tree',
        r'\bbinary\s?search\s?tree\b': 'binary search tree',
        r'\bbst\b': 'BST',
        r'\bheap\b': 'heap',
        r'\bhash\s?map\b': 'hash map',
        r'\bhash\s?table\b': 'hash table',
        r'\bgraph\b': 'graph',
        r'\btrie\b': 'trie',
        r'\bqueue\b': 'queue',
        r'\bstack\b': 'stack',
        r'\barraay\b': 'array',
        r'\bsort\b': 'sort',
        r'\bquick\s?sort\b': 'quicksort',
        r'\bmerge\s?sort\b': 'merge sort',
        r'\bheap\s?sort\b': 'heap sort',
        r'\bbubble\s?sort\b': 'bubble sort',
        r'\binsertion\s?sort\b': 'insertion sort',
        r'\btime\s?complexity\b': 'time complexity',
        r'\bspace\s?complexity\b': 'space complexity',
        r'\bbig\s?o\b': 'Big O',
        r'\bo\s?of\s?n\b': 'O(n)',
        r'\bo\s?of\s?n\s?squared\b': 'O(n²)',
        r'\bo\s?of\s?log\s?n\b': 'O(log n)',
        r'\bo\s?of\s?n\s?log\s?n\b': 'O(n log n)',
        
        # Function-related patterns
        r'\b(?:function|func)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(': r'function \1(',
        r'\bdef\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(': r'def \1(',
        
        # Sites & Resources
        r'\bstack\s?overflow\b': 'StackOverflow',
        r'\bgit\s?hub\b': 'GitHub',
        r'\bleet\s?code\b': 'LeetCode',
        r'\bhacker\s?rank\b': 'HackerRank',
        r'\bcode\s?pen\b': 'CodePen',
    }
    
    # Apply all replacements
    processed_text = text
    for pattern, replacement in replacements.items():
        processed_text = re.sub(pattern, replacement, processed_text, flags=re.IGNORECASE)
    
    # Try to identify code blocks and format them
    # This is a simple approach - more sophisticated would require AI processing
    code_block_markers = [
        (r'```(?:python|java|javascript|js|typescript|ts|c\+\+|cpp|csharp|c#|ruby|go|rust|php|swift|kotlin|scala)\s*(.*?)\s*```', r'```\1```'),
        (r'code\s*:\s*(.*?)(?=\n\n|\Z)', r'```\1```'),
        (r'function\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*{[^}]*}', lambda m: f'```{m.group(0)}```'),
        (r'class\s+[a-zA-Z_][a-zA-Z0-9_]*\s*{[^}]*}', lambda m: f'```{m.group(0)}```'),
        (r'def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*:', lambda m: f'```{m.group(0)}```'),
        (r'(?:public|private|protected|internal)\s+(?:static\s+)?(?:void|int|string|bool|float|double)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*{', lambda m: f'```{m.group(0)}```'),
    ]
    
    for pattern, replacement in code_block_markers:
        processed_text = re.sub(pattern, replacement, processed_text, flags=re.DOTALL)
    
    # Improve code formatting by adding proper indentation for languages with specific syntax patterns
    # Python indentation fix (simple cases)
    processed_text = re.sub(r'(def\s+[^\n]+:)\s*([^\s])', r'\1\n    \2', processed_text)
    processed_text = re.sub(r'(if\s+[^\n]+:)\s*([^\s])', r'\1\n    \2', processed_text)
    processed_text = re.sub(r'(for\s+[^\n]+:)\s*([^\s])', r'\1\n    \2', processed_text)
    processed_text = re.sub(r'(while\s+[^\n]+:)\s*([^\s])', r'\1\n    \2', processed_text)
    
    return processed_text

@bp.post("/start")
def start():
    success, result = get_user_id_from_auth(request.headers.get("Authorization"))
    if not success:
        abort(401, description=result)
    user_id = result
    
    body = request.get_json(force=True) or {}
    track = body.get("track", "behavioral")
    num_questions = int(body.get("num_questions", DEFAULT_NUM_QUESTIONS))

    # 1) create session
    session_id = create_session(user_id, track, num_questions)

    # 2) get first question from graph
    q1, history = first_question_logic(mode=track)

    # 3) save Q1 as turn_index=1
    insert_question(session_id, 1, q1)

    # 4) return to UI (also return minimal history so UI could persist if needed)
    return jsonify({"session_id": session_id, "question": q1, "history": history})

@bp.post("/answer")
def answer():
    success, result = get_user_id_from_auth(request.headers.get("Authorization"))
    if not success:
        abort(401, description=result)
    user_id = result
    
    # Check if the request contains a file or JSON data
    if request.content_type and 'multipart/form-data' in request.content_type:
        # Handle audio file upload
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "No selected audio file"}), 400
        
        # Check if the file has actual content
        audio_file.seek(0, 2)  # Go to the end of the file
        file_size = audio_file.tell()  # Get position (size)
        audio_file.seek(0)  # Reset to beginning
        
        if file_size == 0:
            return jsonify({"error": "Empty audio file"}), 400
            
        print(f"Received audio file: {audio_file.filename}, size: {file_size} bytes")
        
        session_id = request.form.get('session_id')
        if not session_id:
            return jsonify({"error": "No session_id provided"}), 400
        
        # Get session info to determine if this is a technical or behavioral interview
        sess = get_session(session_id)
        is_technical = sess["track"] == "technical"
        
        # Convert speech to text using Groq client
        from agents.agents import groq_client
        try:
            # Save the audio file temporarily
            import os  # Add explicit import here
            temp_path = f"/tmp/{audio_file.filename}"
            audio_file.save(temp_path)
            
            # Verify the file was saved and has content
            if not os.path.exists(temp_path) or os.path.getsize(temp_path) == 0:
                return jsonify({"error": "Failed to save audio file or file is empty"}), 400
                
            print(f"Saved audio to temp file: {temp_path}, size: {os.path.getsize(temp_path)} bytes")
            
            # Transcribe using Whisper with appropriate settings for interview type
            with open(temp_path, "rb") as audio:
                try:
                    if is_technical:
                        # For technical interviews, use more specialized settings
                        transcript = groq_client.audio.transcriptions.create(
                            model="whisper-large-v3",
                            file=audio,
                            response_format="verbose_json",  # Get more detailed output
                            temperature=0.0,                 # More precise transcription
                            prompt="This is a technical interview with code syntax, programming terms, and algorithms."  # Context hint
                        )
                        
                        # Extract the text from verbose JSON response
                        user_answer = transcript.text
                        
                        # Post-process for technical content
                        user_answer = post_process_technical_transcript(user_answer)
                        
                        # For technical interviews, optionally store the audio file for later review
                        # Uncomment and implement if you want to store audio files
                        # store_technical_interview_audio(session_id, cur.get("turn_index"), temp_path)
                    else:
                        # For behavioral interviews, use standard settings
                        transcript = groq_client.audio.transcriptions.create(
                            model="whisper-large-v3",
                            file=audio
                        )
                        user_answer = transcript.text
                        
                    print(f"Successfully transcribed audio: {len(user_answer)} characters")
                    
                except Exception as transcription_error:
                    print(f"Transcription error: {transcription_error}")
                    return jsonify({"error": f"Speech-to-text conversion failed: {str(transcription_error)}"}), 500
            
            # Clean up the temporary file (only if not storing for technical interviews)
            import os
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
        except Exception as e:
            print(e)
            return jsonify({"error": f"Speech-to-text conversion failed"}), 500
    else:
        # Handle JSON data (text submission)
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

@bp.get("/technical-audio")
def get_technical_audio():
    """
    Endpoint to retrieve audio recordings for technical interviews.
    This is useful for reviewing the exact audio of a technical explanation.
    """
    success, result = get_user_id_from_auth(request.headers.get("Authorization"))
    if not success:
        abort(401, description=result)
    
    session_id = request.args.get("session_id")
    if not session_id:
        return jsonify({"error": "Invalid session id"}), 400
    
    # Verify the session belongs to the user
    sess = get_session(session_id)
    if not sess or sess["user_id"] != result:
        return jsonify({"error": "Session not found or unauthorized"}), 404
    
    # Only for technical interviews
    if sess["track"] != "technical":
        return jsonify({"error": "Audio recordings only available for technical interviews"}), 400
    
    # Get the turn index (question number) if provided
    turn_index = request.args.get("turn_index")
    
    # Path to audio storage
    storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                               "storage", "audio", session_id)
    
    # If directory doesn't exist, no recordings
    if not os.path.exists(storage_dir):
        return jsonify({"audio_files": []})
    
    # List all audio files for this session
    audio_files = []
    for filename in os.listdir(storage_dir):
        if turn_index and not filename.startswith(f"q{turn_index}_"):
            continue
        
        file_path = os.path.join(storage_dir, filename)
        file_stats = os.stat(file_path)
        
        audio_files.append({
            "filename": filename,
            "path": file_path,
            "size": file_stats.st_size,
            "created": datetime.fromtimestamp(file_stats.st_ctime).isoformat()
        })
    
    return jsonify({"audio_files": audio_files})

@bp.get("/summary")
def summary():
    success, result = get_user_id_from_auth(request.headers.get("Authorization"))
    if not success:
        abort(401, description=result)
    
    session_id = request.args.get("session_id")
    if not session_id:
        return jsonify({"error": "Invalid session id"}), 400
    
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
