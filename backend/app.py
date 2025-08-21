import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Backend server is running!"

@app.post("/interview/start")
def start_interview():
    # { "mode": "technical", or "behavioral" "candidate_id": "1234" }
    # a function that gets the user_id
    # generate by ai agent
    # store into db interview (postgresql)
    # return {"session_id": "abcd-efgh", "round": 0, "message": "Interview started" }
    return jsonify({"message": "Interview started"})


if __name__ == '__main__':
    app.run(debug=True)