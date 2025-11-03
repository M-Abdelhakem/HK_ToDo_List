"""
Database utility functions for initializing and managing the database.
"""
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
import logging

# Initialize SQLAlchemy instance (will be initialized with app in init_db)
db = SQLAlchemy()

logger = logging.getLogger(__name__)

# Note: User model is imported inside functions to avoid circular import issues
# (User model imports db from this file, so we can't import User at module level)


def init_db(app):
    """
    Initialize the database with the Flask application.
    
    Args:
        app: Flask application instance
    """
    try:
        db.init_app(app)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise


def create_tables(app):
    """
    Create all database tables defined in models.
    
    Args:
        app: Flask application instance
        
    Raises:
        SQLAlchemyError: If table creation fails
    """
    try:
        with app.app_context():
            db.create_all()
            logger.info("Database tables created successfully")
    except SQLAlchemyError as e:
        logger.error(f"Error creating database tables: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating tables: {str(e)}")
        raise


def get_db_connection_status(app):
    """
    Check if database connection is working.
    
    Args:
        app: Flask application instance
        
    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        with app.app_context():
            db.session.execute(db.text('SELECT 1'))
            return True
    except Exception as e:
        logger.error(f"Database connection check failed: {str(e)}")
        return False


# ============================================================================
# User Management Functions
# ============================================================================

def get_user_by_email(email):
    """
    Get a user by their email address.
    
    Args:
        email: User's email address (will be lowercased)
        
    Returns:
        User: User object if found, None otherwise
    """
    try:
        from models.user import User  # Import here to avoid circular imports
        return User.query.filter_by(email=email.lower()).first()
    except Exception as e:
        logger.error(f"Error getting user by email: {str(e)}")
        return None


def add_user(name, email, password):
    """
    Create a new user in the database.
    
    Args:
        name: User's full name
        email: User's email address (will be lowercased)
        password: Plain text password (will be hashed)
        
    Returns:
        tuple: (user, None) on success, (None, error_message) on failure
    """
    try:
        from models.user import User  # Import here to avoid circular imports
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=email.lower()).first()
        if existing_user:
            return None, "Email already exists"
        
        # Create new user
        new_user = User(name=name, email=email.lower())
        new_user.set_password(password)
        
        # Add to session and commit
        db.session.add(new_user)
        db.session.commit()
        
        logger.info(f"User created successfully: {email}")
        return new_user, None
        
    except IntegrityError:
        db.session.rollback()
        logger.error(f"Integrity error creating user: {email}")
        return None, "Email already exists"
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating user: {str(e)}")
        return None, f"An error occurred during registration: {str(e)}"


def authenticate_user(email, password):
    """
    Authenticate a user by email and password.
    
    Args:
        email: User's email address (will be lowercased)
        password: Plain text password to verify
        
    Returns:
        tuple: (user, None) on success, (None, error_message) on failure
    """
    try:
        from models.user import User  # Import here to avoid circular imports
        
        # Find user by email
        user = User.query.filter_by(email=email.lower()).first()
        
        # Verify user exists and password is correct
        if not user:
            logger.warning(f"Authentication failed: user not found for email {email}")
            return None, "Invalid email or password"
        
        if not user.check_password(password):
            logger.warning(f"Authentication failed: incorrect password for email {email}")
            return None, "Invalid email or password"
        
        logger.info(f"User authenticated successfully: {email}")
        return user, None
        
    except Exception as e:
        logger.error(f"Error authenticating user: {str(e)}")
        return None, f"An error occurred during authentication: {str(e)}"


# ============================================================================
# List Management Functions
# ============================================================================

def get_user_lists(user_id):
    """
    Get all lists for a user, ordered by position.
    
    Args:
        user_id: User ID
        
    Returns:
        list: List of List objects ordered by position
    """
    try:
        from models.list import List  # Import here to avoid circular imports
        return List.query.filter_by(user_id=user_id).order_by(List.position).all()
    except Exception as e:
        logger.error(f"Error getting user lists: {str(e)}")
        return []


def get_list_by_id(list_id):
    """
    Get a specific list by ID.
    
    Args:
        list_id: List ID
        
    Returns:
        List: List object if found, None otherwise
    """
    try:
        from models.list import List  # Import here to avoid circular imports
        return List.query.filter_by(id=list_id).first()
    except Exception as e:
        logger.error(f"Error getting list by id: {str(e)}")
        return None


def create_list(user_id, title):
    """
    Create a new list for a user.
    Auto-assigns position (highest position + 1).
    
    Args:
        user_id: User ID
        title: List title (max 200 characters)
        
    Returns:
        tuple: (list, None) on success, (None, error_message) on failure
    """
    try:
        from models.list import List  # Import here to avoid circular imports
        
        # Validate title
        if not title or not title.strip():
            return None, "Title is required"
        
        title = title.strip()
        if len(title) > 200:
            return None, "Title must be 200 characters or less"
        
        # Get the highest position for this user's lists
        max_position = db.session.query(db.func.max(List.position)).filter_by(user_id=user_id).scalar()
        new_position = (max_position or 0) + 1
        
        # Create new list
        new_list = List(user_id=user_id, title=title, position=new_position)
        
        # Add to session and commit
        db.session.add(new_list)
        db.session.commit()
        
        logger.info(f"List created successfully: {title} for user {user_id}")
        return new_list, None
        
    except IntegrityError:
        db.session.rollback()
        logger.error(f"Integrity error creating list: {title}")
        return None, "An error occurred while creating the list"
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating list: {str(e)}")
        return None, f"An error occurred while creating the list: {str(e)}"


def update_list(list_id, title=None, position=None):
    """
    Update list properties.
    
    Args:
        list_id: List ID
        title: New title (optional)
        position: New position (optional)
        
    Returns:
        tuple: (list, None) on success, (None, error_message) on failure
    """
    try:
        from models.list import List  # Import here to avoid circular imports
        
        list_obj = List.query.filter_by(id=list_id).first()
        if not list_obj:
            return None, "List not found"
        
        # Update title if provided
        if title is not None:
            title = title.strip()
            if not title:
                return None, "Title cannot be empty"
            if len(title) > 200:
                return None, "Title must be 200 characters or less"
            list_obj.title = title
        
        # Update position if provided
        if position is not None:
            if not isinstance(position, int) or position < 0:
                return None, "Position must be a non-negative integer"
            list_obj.position = position
        
        # Commit changes
        db.session.commit()
        
        logger.info(f"List updated successfully: {list_id}")
        return list_obj, None
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating list: {str(e)}")
        return None, f"An error occurred while updating the list: {str(e)}"


def delete_list(list_id):
    """
    Delete a list and all its items (cascade delete).
    
    Args:
        list_id: List ID
        
    Returns:
        tuple: (True, None) on success, (False, error_message) on failure
    """
    try:
        from models.list import List  # Import here to avoid circular imports
        
        list_obj = List.query.filter_by(id=list_id).first()
        if not list_obj:
            return False, "List not found"
        
        # Delete list (cascade will delete all items)
        db.session.delete(list_obj)
        db.session.commit()
        
        logger.info(f"List deleted successfully: {list_id}")
        return True, None
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting list: {str(e)}")
        return False, f"An error occurred while deleting the list: {str(e)}"


# ============================================================================
# Item Management Functions
# ============================================================================

def get_list_items(list_id):
    """
    Get all top-level items for a list with nested children (3 levels deep), ordered by position.
    
    Args:
        list_id: List ID
        
    Returns:
        list: List of Item objects (top-level only, with nested children loaded)
    """
    try:
        from models.item import Item  # Import here to avoid circular imports
        
        # Get all top-level items (parent_id is None) for this list
        top_level_items = Item.query.filter_by(list_id=list_id, parent_id=None).order_by(Item.position).all()
        
        return top_level_items
    except Exception as e:
        logger.error(f"Error getting list items: {str(e)}")
        return []


def get_item_by_id(item_id):
    """
    Get a specific item by ID.
    
    Args:
        item_id: Item ID
        
    Returns:
        Item: Item object if found, None otherwise
    """
    try:
        from models.item import Item  # Import here to avoid circular imports
        return Item.query.filter_by(id=item_id).first()
    except Exception as e:
        logger.error(f"Error getting item by id: {str(e)}")
        return None


def create_item(list_id, title, parent_id=None):
    """
    Create a new item in a list.
    Auto-calculates level based on parent hierarchy and position.
    
    Hierarchy rules:
    - If parent_id is None: level = 1 (top-level item)
    - Otherwise: level = parent.level + 1 (infinite depth supported)
    
    Args:
        list_id: List ID
        title: Item title (max 500 characters)
        parent_id: Parent item ID for hierarchical structure (optional)
        
    Returns:
        tuple: (item, None) on success, (None, error_message) on failure
    """
    try:
        from models.item import Item  # Import here to avoid circular imports
        from models.list import List  # Import here to avoid circular imports
        
        # Validate title
        if not title or not title.strip():
            return None, "Title is required"
        
        title = title.strip()
        if len(title) > 500:
            return None, "Title must be 500 characters or less"
        
        # Verify list exists
        list_obj = List.query.filter_by(id=list_id).first()
        if not list_obj:
            return None, "List not found"
        
        # Calculate level and validate hierarchy
        level = 1
        if parent_id is not None:
            parent_item = Item.query.filter_by(id=parent_id).first()
            if not parent_item:
                return None, "Parent item not found"
            
            # Verify parent belongs to same list
            if parent_item.list_id != list_id:
                return None, "Parent item must belong to the same list"
            
            # Calculate level based on parent (no maximum depth restriction)
            level = parent_item.level + 1
        
        # Get the highest position for items at this level in this list
        # If parent_id is provided, get position within parent's children
        # Otherwise, get position for top-level items
        if parent_id:
            max_position = db.session.query(db.func.max(Item.position)).filter_by(
                list_id=list_id, parent_id=parent_id
            ).scalar()
        else:
            max_position = db.session.query(db.func.max(Item.position)).filter_by(
                list_id=list_id, parent_id=None
            ).scalar()
        
        new_position = (max_position or 0) + 1
        
        # Create new item
        new_item = Item(
            list_id=list_id,
            title=title,
            parent_id=parent_id,
            position=new_position,
            level=level
        )
        
        # Add to session and commit
        db.session.add(new_item)
        db.session.commit()
        
        logger.info(f"Item created successfully: {title} in list {list_id} at level {level}")
        return new_item, None
        
    except IntegrityError:
        db.session.rollback()
        logger.error(f"Integrity error creating item: {title}")
        return None, "An error occurred while creating the item"
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating item: {str(e)}")
        return None, f"An error occurred while creating the item: {str(e)}"


def update_item(item_id, title=None, completed=None, position=None, list_id=None, parent_id=None):
    """
    Update item properties.
    
    Args:
        item_id: Item ID
        title: New title (optional)
        completed: New completion status (optional)
        position: New position (optional)
        list_id: New list ID (optional - for moving items, only top-level items can be moved)
        
    Returns:
        tuple: (item, None) on success, (None, error_message) on failure
    """
    try:
        from models.item import Item  # Import here to avoid circular imports
        from models.list import List  # Import here to avoid circular imports
        
        item = Item.query.filter_by(id=item_id).first()
        if not item:
            return None, "Item not found"
        
        # Update title if provided
        if title is not None:
            title = title.strip()
            if not title:
                return None, "Title cannot be empty"
            if len(title) > 500:
                return None, "Title must be 500 characters or less"
            item.title = title
        
        # Update completed status if provided
        if completed is not None:
            item.completed = bool(completed)
        
        # Update position if provided
        if position is not None:
            if not isinstance(position, int) or position < 0:
                return None, "Position must be a non-negative integer"
            item.position = position
        
        # Helpers for subtree operations
        def is_descendant(possible_ancestor: Item, possible_descendant: Item) -> bool:
            stack = list(possible_ancestor.children)
            while stack:
                node = stack.pop()
                if node.id == possible_descendant.id:
                    return True
                stack.extend(list(node.children))
            return False

        def update_subtree_list_and_levels(root: Item, new_list_id: int, level_delta: int):
            for child in root.children:
                if new_list_id is not None:
                    child.list_id = new_list_id
                if level_delta != 0:
                    child.level = max(1, child.level + level_delta)
                update_subtree_list_and_levels(child, new_list_id, level_delta)

        # Resolve new parent and/or new list targets
        new_parent = None
        if parent_id is not None:
            if parent_id == 0:
                parent_id = None
            else:
                new_parent = Item.query.filter_by(id=parent_id).first()
                if not new_parent:
                    return None, "Target parent not found"

        # If moving lists, verify list exists
        target_list_id = list_id if list_id is not None else item.list_id
        if list_id is not None:
            target_list = List.query.filter_by(id=list_id).first()
            if not target_list:
                return None, "Target list not found"

        # If parent provided, ensure it is in the target list
        if new_parent is not None and new_parent.list_id != target_list_id:
            return None, "Parent item must belong to the target list"

        # Prevent circular references
        if new_parent is not None and (new_parent.id == item.id or is_descendant(item, new_parent)):
            return None, "Cannot move an item under its own descendant"

        # Apply move: compute new level and deltas
        if parent_id is not None or list_id is not None:
            old_level = item.level
            old_list_id = item.list_id

            # Set new list first on root item if changing lists
            if list_id is not None:
                item.list_id = target_list_id

            # Set new parent (can be None for top-level)
            item.parent_id = parent_id if parent_id is not None else item.parent_id
            if parent_id is None:
                item.parent_id = None

            # Recalculate level: top-level => 1, else parent.level + 1
            if item.parent_id is None:
                item.level = 1
            else:
                # fetch parent to ensure we have its current level
                parent_ref = new_parent or Item.query.filter_by(id=item.parent_id).first()
                if not parent_ref:
                    return None, "Target parent not found"
                item.level = parent_ref.level + 1

            level_delta = item.level - old_level

            # Update subtree list_id and levels
            update_subtree_list_and_levels(item, target_list_id if list_id is not None else None, level_delta)

            logger.info(
                f"Item {item_id} moved: list {old_list_id}->{item.list_id}, level {old_level}->{item.level}, parent {item.parent_id}"
            )
        
        # Commit changes
        db.session.commit()
        
        logger.info(f"Item updated successfully: {item_id}")
        return item, None
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating item: {str(e)}")
        return None, f"An error occurred while updating the item: {str(e)}"


def delete_item(item_id):
    """
    Delete an item and all its children (cascade delete).
    
    Args:
        item_id: Item ID
        
    Returns:
        tuple: (True, None) on success, (False, error_message) on failure
    """
    try:
        from models.item import Item  # Import here to avoid circular imports
        
        item = Item.query.filter_by(id=item_id).first()
        if not item:
            return False, "Item not found"
        
        # Delete item (cascade will delete all children)
        db.session.delete(item)
        db.session.commit()
        
        logger.info(f"Item deleted successfully: {item_id}")
        return True, None
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting item: {str(e)}")
        return False, f"An error occurred while deleting the item: {str(e)}"
