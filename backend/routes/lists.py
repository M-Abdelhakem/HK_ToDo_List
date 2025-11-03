"""
List routes for task management containers.
All endpoints require JWT authentication.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import (
    get_user_by_email,
    get_user_lists,
    get_list_by_id,
    create_list,
    update_list,
    delete_list
)

# Create blueprint for list routes
lists_bp = Blueprint('lists', __name__, url_prefix='/lists')


@lists_bp.route('', methods=['GET'])
@jwt_required()
def get_lists():
    """
    Get all lists for the authenticated user.
    
    Returns:
        JSON response with list of lists ordered by position
        Status: 200
    """
    try:
        # Get user email from JWT token
        email = get_jwt_identity()
        user = get_user_by_email(email)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get all lists for the user
        lists = get_user_lists(user.id)
        
        # Convert to dictionary format
        lists_data = [lst.to_dict() for lst in lists]
        
        return jsonify({'lists': lists_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'An error occurred while fetching lists'}), 500


@lists_bp.route('', methods=['POST'])
@jwt_required()
def create_new_list():
    """
    Create a new list for the authenticated user.
    
    Request body:
        {
            "title": "string"
        }
    
    Returns:
        JSON response with success message and list data
        Status: 201, 400
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        title = data.get('title', '').strip()
        
        # Validate required fields
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        # Get user email from JWT token
        email = get_jwt_identity()
        user = get_user_by_email(email)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Create list using database function
        new_list, error_message = create_list(user.id, title)
        
        if not new_list:
            return jsonify({'error': error_message}), 400
        
        return jsonify({
            'message': 'List created successfully',
            'list': {
                'id': new_list.id,
                'title': new_list.title,
                'position': new_list.position
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'An error occurred while creating the list'}), 500


@lists_bp.route('/<int:list_id>', methods=['PUT'])
@jwt_required()
def update_existing_list(list_id):
    """
    Update an existing list.
    Verifies that the list belongs to the authenticated user.
    
    Request body:
        {
            "title": "string" (optional),
            "position": int (optional)
        }
    
    Returns:
        JSON response with success message and updated list data
        Status: 200, 400, 403, 404
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        title = data.get('title')
        position = data.get('position')
        
        # At least one field must be provided
        if title is None and position is None:
            return jsonify({'error': 'At least one field (title or position) must be provided'}), 400
        
        # Get user email from JWT token
        email = get_jwt_identity()
        user = get_user_by_email(email)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get list and verify ownership
        list_obj = get_list_by_id(list_id)
        if not list_obj:
            return jsonify({'error': 'List not found'}), 404
        
        if list_obj.user_id != user.id:
            return jsonify({'error': 'You do not have permission to modify this list'}), 403
        
        # Update list using database function
        updated_list, error_message = update_list(list_id, title=title, position=position)
        
        if not updated_list:
            return jsonify({'error': error_message}), 400
        
        return jsonify({
            'message': 'List updated successfully',
            'list': {
                'id': updated_list.id,
                'title': updated_list.title,
                'position': updated_list.position
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'An error occurred while updating the list'}), 500


@lists_bp.route('/<int:list_id>', methods=['DELETE'])
@jwt_required()
def delete_existing_list(list_id):
    """
    Delete an existing list.
    Verifies that the list belongs to the authenticated user.
    Cascade deletes all items in the list.
    
    Returns:
        JSON response with success message
        Status: 200, 403, 404
    """
    try:
        # Get user email from JWT token
        email = get_jwt_identity()
        user = get_user_by_email(email)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get list and verify ownership
        list_obj = get_list_by_id(list_id)
        if not list_obj:
            return jsonify({'error': 'List not found'}), 404
        
        if list_obj.user_id != user.id:
            return jsonify({'error': 'You do not have permission to delete this list'}), 403
        
        # Delete list using database function
        success, error_message = delete_list(list_id)
        
        if not success:
            return jsonify({'error': error_message}), 404
        
        return jsonify({'message': 'List deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': 'An error occurred while deleting the list'}), 500

