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

if __name__ == '__main__':
    app.run(debug=True)