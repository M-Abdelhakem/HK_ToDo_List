"""
Authentication routes for user registration, login, and logout.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, unset_jwt_cookies
from database import get_user_by_email, add_user, authenticate_user
from models.user import User

# Create blueprint for auth routes
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user.
    
    Request body:
        {
            "name": "string",
            "email": "string",
            "password": "string"
        }
    
    Returns:
        JSON response with success message and user data (without tokens).
        Frontend should redirect to login page with success notification.
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validate required fields
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Validate email format (basic validation)
        if '@' not in email or '.' not in email:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate name length
        if len(name) > 100:
            return jsonify({'error': 'Name must be 100 characters or less'}), 400
        
        # Validate password requirements
        is_valid, error_message = User.validate_password(password)
        if not is_valid:
            return jsonify({'error': error_message}), 400
        
        # Create user using database function
        new_user, error_message = add_user(name, email, password)
        
        if not new_user:
            # Determine status code based on error
            status_code = 409 if error_message == "Email already exists" else 500
            return jsonify({'error': error_message}), status_code
        
        # Return success response without tokens
        # Frontend should redirect to login page with success notification
        return jsonify({
            'message': 'Registration successful. Please login to continue.',
            'user': new_user.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': 'An error occurred during registration'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate user and generate JWT tokens.
    
    Request body:
        {
            "email": "string",
            "password": "string"
        }
    
    Returns:
        JSON response with access token, refresh token, and user data
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validate required fields
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Authenticate user using database function
        user, error_message = authenticate_user(email, password)
        
        if not user:
            return jsonify({'error': error_message}), 401
        
        # Generate JWT tokens
        access_token = create_access_token(identity=user.email)
        refresh_token = create_refresh_token(identity=user.email)
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'An error occurred during login'}), 500


# TODO: handle logout in frontend by clearing the token form local storage
@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Log out the current user by clearing JWT cookies.
    
    Requires:
        Nothing
    
    Returns:
        JSON response confirming logout
    """
    # Create response with logout message
    response = jsonify({'message': 'Logged out successfully'})
    
    return response, 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current authenticated user.
    The @jwt_required() decorator automatically:
    - Extracts token from Authorization header (Bearer <token>)
    - Verifies the token
    - Returns 401 if invalid
    - Provides user_id via get_jwt_identity()
    """
    try:
        # Extract user_id from JWT token (set during login/register)
        email = get_jwt_identity()
        user = get_user_by_email(email)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({'user': user.to_dict()}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500