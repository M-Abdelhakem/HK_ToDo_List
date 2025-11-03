"""
Main Flask application file.
Initializes the app, configures CORS, JWT, and registers blueprints.
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database import init_db, create_tables
from routes.auth import auth_bp
from routes.lists import lists_bp
from routes.items import items_bp
import models  # Import models so SQLAlchemy knows about them

# Initialize Flask app
app = Flask(__name__)

# Load configuration
app.config.from_object(Config)

# Initialize CORS with credentials support
CORS(app, supports_credentials=True, origins="*")  # In production, specify actual origins

# Initialize database
init_db(app)

# Initialize JWT
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(lists_bp)
app.register_blueprint(items_bp)


# # JWT Error Handlers
# @jwt.expired_token_loader
# def expired_token_callback(jwt_header, jwt_payload):
#     """
#     Handle expired JWT tokens.
    
#     Returns:
#         JSON error response with 401 status
#     """
#     return jsonify({'error': 'Token has expired'}), 401


# @jwt.invalid_token_loader
# def invalid_token_callback(error):
#     """
#     Handle invalid JWT tokens.
    
#     Args:
#         error: Error message
        
#     Returns:
#         JSON error response with 401 status
#     """
#     return jsonify({'error': 'Invalid token'}), 401


# @jwt.unauthorized_loader
# def missing_token_callback(error):
#     """
#     Handle missing JWT tokens.
    
#     Args:
#         error: Error message
        
#     Returns:
#         JSON error response with 401 status
#     """
#     return jsonify({'error': 'Authorization token is required'}), 401


# @jwt.revoked_token_loader
# def revoked_token_callback(jwt_header, jwt_payload):
#     """
#     Handle revoked JWT tokens.
    
#     Returns:
#         JSON error response with 401 status
#     """
#     return jsonify({'error': 'Token has been revoked'}), 401


# General Error Handlers
@app.errorhandler(400)
def bad_request(error):
    """
    Handle 400 Bad Request errors.
    
    Returns:
        JSON error response
    """
    return jsonify({'error': 'Bad request'}), 400


@app.errorhandler(401)
def unauthorized(error):
    """
    Handle 401 Unauthorized errors.
    
    Returns:
        JSON error response
    """
    return jsonify({'error': 'Unauthorized'}), 401


@app.errorhandler(403)
def forbidden(error):
    """
    Handle 403 Forbidden errors.
    
    Returns:
        JSON error response
    """
    return jsonify({'error': 'Forbidden'}), 403


@app.errorhandler(404)
def not_found(error):
    """
    Handle 404 Not Found errors.
    
    Returns:
        JSON error response
    """
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(409)
def conflict(error):
    """
    Handle 409 Conflict errors.
    
    Returns:
        JSON error response
    """
    return jsonify({'error': 'Resource conflict'}), 409


@app.errorhandler(500)
def internal_error(error):
    """
    Handle 500 Internal Server errors.
    
    Returns:
        JSON error response
    """
    return jsonify({'error': 'Internal server error'}), 500


@app.route('/')
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON response confirming API is running
    """
    return jsonify({'message': 'Flask API is running', 'status': 'ok'}), 200


if __name__ == '__main__':
    # Create database tables if they don't exist
    with app.app_context():
        create_tables(app)
    
    # Run app on port 5001
    app.run(debug=True, port=5001, host='0.0.0.0')

