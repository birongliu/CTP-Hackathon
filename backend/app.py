from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp

app = Flask(__name__)

FRONTEND_ORIGIN = "http://localhost:5174"  # <-- your Vite port

CORS(
    app,
    supports_credentials=True,                         # allow cookies
    resources={r"/api/*": {"origins": FRONTEND_ORIGIN}},
    allow_headers=["Content-Type", "Authorization"],   # preflight allowed headers
    methods=["GET", "POST", "OPTIONS"],                # preflight allowed methods
)

app.register_blueprint(auth_bp, url_prefix="/api/auth")

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
