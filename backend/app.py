from flask import Flask
from flask_cors import CORS
from routes.interview import bp as interview_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(interview_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(port=8000, debug=True)
