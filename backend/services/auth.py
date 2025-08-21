import os
import jwt
import time
import uuid
from typing import Optional, Tuple, Dict, Any
from db.supabase_db import sb
from supabase import create_client
import os

class AuthError(Exception):
    """Custom exception for authentication errors"""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def signup(email: str, password: str):
    return supabase.auth.sign_up({"email": email, "password": password})

def login(email: str, password: str):
    return supabase.auth.sign_in_with_password({"email": email, "password": password})

def logout(token: str):
    return supabase.auth.sign_out(token)


def get_user_id_from_auth(auth_header: Optional[str]) -> Tuple[bool, str]:
    """
    Extract and validate the user ID from the Authorization header.
    
    Args:
        auth_header: The Authorization header from the HTTP request
        
    Returns:
        A tuple (success, result) where:
          - If successful: (True, user_id)
          - If failed: (False, error_message)
    """
    if not auth_header:
        return False, "Authorization header is required"
    
    # Check for Bearer token format
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return False, "Authorization header must be in the format: Bearer {token}"
    
    token = parts[1]
    
    try:
        # For Supabase JWT verification
        # You would typically verify the JWT against Supabase's JWT secret
        # This is a simplified version that extracts the user ID
        
        # Decode without verification for development - in production you should verify the token
        payload = jwt.decode(token, options={"verify_signature": False})
        
        # The user ID is typically in the 'sub' claim for Supabase tokens
        user_id = payload.get('sub')
        
        if not user_id:
            return False, "Invalid token: user ID not found"
        
        return True, user_id
        
    except jwt.ExpiredSignatureError:
        return False, "Token has expired"
    except jwt.InvalidTokenError:
        return False, "Invalid token"
    except Exception as e:
        return False, f"Authentication error: {str(e)}"

def generate_jwt_token(user_id: str, expiry_seconds: int = 3600, secret_key: Optional[str] = None, additional_claims: Optional[Dict[str, Any]] = None) -> str:
    """
    Generate a JWT token for a user.
    
    Args:
        user_id: The ID of the user for whom to generate the token
        expiry_seconds: Token expiry time in seconds (default: 1 hour)
        secret_key: Secret key to sign the token (defaults to a dev key if not provided)
        additional_claims: Additional claims to include in the token
        
    Returns:
        A JWT token string
    """
    # Use provided secret key or a default one for development
    secret = secret_key or os.getenv("JWT_SECRET_KEY", "dev-secret-key")
    
    # Current timestamp
    now = int(time.time())
    
    # Basic claims
    payload = {
        "sub": user_id,            # Subject (user ID)
        "iat": now,                # Issued at
        "exp": now + expiry_seconds,  # Expiry time
        "jti": str(uuid.uuid4()),  # JWT ID (unique identifier for this token)
    }
    
    # Add any additional claims
    if additional_claims:
        payload.update(additional_claims)
    
    # Generate the token
    token = jwt.encode(payload, secret, algorithm="HS256")
    
    return token
