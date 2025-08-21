from functools import wraps
from flask import request, jsonify, abort
from services.auth import get_user_id_from_auth

def require_auth(f):
    """
    Authentication decorator for Flask routes.
    Verifies the JWT token in the Authorization header and provides the user_id to the route.
    
    Usage:
    @require_auth
    def protected_route():
        # user_id is injected by the decorator
        return jsonify({"message": f"Hello, user {user_id}"})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Extract Authorization header
        auth_header = request.headers.get("Authorization")
        
        # Validate the token
        success, result = get_user_id_from_auth(auth_header)
        
        if not success:
            # If validation failed, return 401 Unauthorized with error message
            abort(401, description=result)
        
        # If validation succeeded, result contains the user_id
        # Add user_id to kwargs so the decorated function can access it
        kwargs['user_id'] = result
        
        # Call the original function with the arguments and the user_id
        return f(*args, **kwargs)
    
    return decorated_function
