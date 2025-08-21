from flask import Blueprint, request, jsonify, make_response
from services.supa import supabase
from jose import jwk, jwt
from jose.utils import base64url_decode
import requests, time, os

auth_bp = Blueprint("auth", __name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
JWKS_URL = f"{SUPABASE_URL}/auth/v1/keys"

def verify_jwt(token: str):
    headers = jwt.get_unverified_header(token)
    kid = headers["kid"]
    jwks = requests.get(JWKS_URL, timeout=5).json()
    key_json = next(k for k in jwks["keys"] if k["kid"] == kid)
    key = jwk.construct(key_json)
    message, encoded_sig = token.rsplit(".", 1)
    if not key.verify(message.encode(), base64url_decode(encoded_sig.encode())):
        raise ValueError("Invalid signature")
    claims = jwt.get_unverified_claims(token)
    if claims.get("exp") and time.time() > claims["exp"]:
        raise ValueError("Token expired")
    if SUPABASE_URL not in claims.get("iss",""):
        raise ValueError("Bad issuer")
    return claims

@auth_bp.post("/signup")
def signup_route():
    data = request.get_json(force=True) or {}
    email, password = data.get("email"), data.get("password")
    if not email or not password:
        return jsonify({"error":"email and password required"}), 400
    res = supabase.auth.sign_up({"email": email, "password": password})
    if res.user is None:
        return jsonify({"error": "sign up failed"}), 400
    return jsonify({"ok": True, "message": "Check your email to verify your account."})

@auth_bp.post("/login")
def login_route():
    data = request.get_json(force=True) or {}
    email, password = data.get("email"), data.get("password")
    if not email or not password:
        return jsonify({"error":"email and password required"}), 400
    res = supabase.auth.sign_in_with_password({"email": email, "password": password})
    if res.session is None:
        return jsonify({"error":"invalid credentials"}), 401
    access = res.session.access_token
    refresh = res.session.refresh_token
    resp = make_response({
        "ok": True, 
        "user": {"id": res.user.id, "email": res.user.email},
        "access_token": access,  # Include token in response body
        "refresh_token": refresh  # Include refresh token in response body
    })
    # In prod: secure=True, samesite="None"
    resp.set_cookie("sb-access-token", access, httponly=True, secure=False, samesite="None", path="/")
    resp.set_cookie("sb-refresh-token", refresh, httponly=True, secure=False, samesite="None", path="/")
    return resp

@auth_bp.post("/logout")
def logout_route():
    resp = make_response({"ok": True})
    resp.delete_cookie("sb-access-token", path="/")
    resp.delete_cookie("sb-refresh-token", path="/")
    return resp

@auth_bp.get("/me")
def me_route():
    token = request.cookies.get("sb-access-token")
    if not token:
        return jsonify({"user": None})

    try:
        # Let Supabase validate the token and return the user
        res = supabase.auth.get_user(token)
        if res.user is None:
            return jsonify({"user": None})
        return jsonify({"user": {"id": res.user.id, "email": res.user.email}})
    except Exception as e:
        # print(e)  # optionally log
        return jsonify({"user": None})
