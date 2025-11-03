"""
Item routes for tasks within lists with hierarchical structure.
All endpoints require JWT authentication.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import (
    get_user_by_email,
    get_list_by_id,
    get_list_items,
    get_item_by_id,
    create_item,
    update_item,
    delete_item
)

# Create blueprint for item routes
items_bp = Blueprint('items', __name__)


@items_bp.route('/lists/<int:list_id>/items', methods=['GET'])
@jwt_required()
def get_items_for_list(list_id):
    """
    Get all items for a specific list with nested children (3 levels deep).
    Verifies that the list belongs to the authenticated user.
    
    Returns:
        JSON response with list of items (nested structure)
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
            return jsonify({'error': 'You do not have permission to access this list'}), 403
        
        # Get all items for the list using database function
        items = get_list_items(list_id)
        
        # Convert to dictionary format with nested children
        items_data = [item.to_dict(include_children=True) for item in items]
        
        return jsonify({'items': items_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'An error occurred while fetching items'}), 500


@items_bp.route('/lists/<int:list_id>/items', methods=['POST'])
@jwt_required()
def create_new_item(list_id):
    """
    Create a new item in a list.
    Verifies that the list belongs to the authenticated user.
    
    Request body:
        {
            "title": "string",
            "parent_id": int (optional)
        }
    
    Returns:
        JSON response with success message and item data
        Status: 201, 400, 403, 404
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        title = data.get('title', '').strip()
        parent_id = data.get('parent_id')
        
        # Validate required fields
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
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
            return jsonify({'error': 'You do not have permission to add items to this list'}), 403
        
        # Validate parent_id if provided
        if parent_id is not None:
            parent_item = get_item_by_id(parent_id)
            if not parent_item:
                return jsonify({'error': 'Parent item not found'}), 404
            
            # Verify parent belongs to same list
            if parent_item.list_id != list_id:
                return jsonify({'error': 'Parent item must belong to the same list'}), 400
        
        # Create item using database function
        new_item, error_message = create_item(list_id, title, parent_id=parent_id)
        
        if not new_item:
            return jsonify({'error': error_message}), 400
        
        return jsonify({
            'message': 'Item created successfully',
            'item': {
                'id': new_item.id,
                'title': new_item.title,
                'completed': new_item.completed,
                'level': new_item.level,
                'parent_id': new_item.parent_id,
                'position': new_item.position
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'An error occurred while creating the item'}), 500


@items_bp.route('/items/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_existing_item(item_id):
    """
    Update an existing item.
    Verifies that the item's list belongs to the authenticated user.
    Allows moving items between lists and under new parents.
    
    Request body:
        {
            "title": "string" (optional),
            "completed": bool (optional),
            "position": int (optional),
            "list_id": int (optional - for moving to different list),
            "parent_id": int|null (optional - new parent, null for top-level)
        }
    
    Returns:
        JSON response with success message and updated item data
        Status: 200, 400, 403, 404
    """
    try:
        data = request.get_json()

        # Validate input
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        title = data.get('title')
        completed = data.get('completed')
        position = data.get('position')
        new_list_id = data.get('list_id')
        new_parent_id = data.get('parent_id') if 'parent_id' in data else None
        
        # Get user email from JWT token
        email = get_jwt_identity()
        user = get_user_by_email(email)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get item and verify ownership through list
        item = get_item_by_id(item_id)
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        list_obj = get_list_by_id(item.list_id)
        if not list_obj or list_obj.user_id != user.id:
            return jsonify({'error': 'You do not have permission to modify this item'}), 403
        
        # Validate target list permissions if provided
        if new_list_id is not None and new_list_id != item.list_id:
            new_list_obj = get_list_by_id(new_list_id)
            if not new_list_obj:
                return jsonify({'error': 'Target list not found'}), 404
            if new_list_obj.user_id != user.id:
                return jsonify({'error': 'You do not have permission to move items to this list'}), 403

        # Validate parent if provided (non-null)
        if new_parent_id is not None:
            if new_parent_id is not None:
                parent_item = get_item_by_id(new_parent_id)
                if new_parent_id is not None and parent_item is None and data.get('parent_id') is not None:
                    return jsonify({'error': 'Target parent not found'}), 404
        
        # Update item using database function
        updated_item, error_message = update_item(
            item_id,
            title=title,
            completed=completed,
            position=position,
            list_id=new_list_id,
            parent_id=data.get('parent_id') if 'parent_id' in data else None
        )
        
        if not updated_item:
            return jsonify({'error': error_message}), 400
        
        return jsonify({
            'message': 'Item updated successfully',
            'item': {
                'id': updated_item.id,
                'title': updated_item.title,
                'completed': updated_item.completed,
                'level': updated_item.level,
                'position': updated_item.position,
                'list_id': updated_item.list_id
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'An error occurred while updating the item'}), 500


@items_bp.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_existing_item(item_id):
    """
    Delete an existing item.
    Verifies that the item's list belongs to the authenticated user.
    Cascade deletes all children.
    
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
        
        # Get item and verify ownership through list
        item = get_item_by_id(item_id)
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        list_obj = get_list_by_id(item.list_id)
        if not list_obj or list_obj.user_id != user.id:
            return jsonify({'error': 'You do not have permission to delete this item'}), 403
        
        # Delete item using database function
        success, error_message = delete_item(item_id)
        
        if not success:
            return jsonify({'error': error_message}), 404
        
        return jsonify({'message': 'Item deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': 'An error occurred while deleting the item'}), 500

