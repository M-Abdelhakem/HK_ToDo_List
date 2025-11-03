"""
User model for authentication and user management.
"""
from database import db
import bcrypt
import re


class User(db.Model):
    """
    User model representing a user in the system.
    
    Attributes:
        id: Primary key (auto-increment)
        name: User's full name (max 100 characters)
        email: User's email address (unique, max 120 characters)
        password_hash: Hashed password using bcrypt
    """
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    def set_password(self, password):
        """
        Hash and store the password using bcrypt.
        
        Args:
            password: Plain text password to hash
        """
        # Generate salt and hash password using bcrypt
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        """
        Verify if the provided password matches the stored bcrypt hash.
        
        Args:
            password: Plain text password to verify
            
        Returns:
            bool: True if password matches, False otherwise
        """
        try:
            # Check password against stored hash
            return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
        except Exception:
            return False
    
    @staticmethod
    def validate_password(password):
        """
        Validate password against requirements.
        
        Password requirements:
        - Minimum 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one number
        - At least one special character
        
        Args:
            password: Password string to validate
            
        Returns:
            tuple: (is_valid: bool, error_message: str or None)
        """
        if not password:
            return False, "Password is required"
        
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        
        if not re.search(r'\d', password):
            return False, "Password must contain at least one number"
        
        # Check for special characters (non-alphanumeric)
        if not re.search(r'[^A-Za-z0-9]', password):
            return False, "Password must contain at least one special character"
        
        return True, None
    
    def to_dict(self):
        """
        Convert user instance to dictionary (excluding password).
        
        Returns:
            dict: User data without password_hash
        """
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email
        }
    
    def __repr__(self):
        return f'<User {self.email}>'

