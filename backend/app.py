from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp

app = Flask(__name__)
CORS(app, supports_credentials=True,
     resources={r"/api/*": {"origins": "http://localhost:5173"}})

app.register_blueprint(auth_bp, url_prefix="/api/auth")

if __name__ == "__main__":
    app.run(port=5000, debug=True)
