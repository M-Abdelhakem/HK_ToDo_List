"""
List model for task management containers.
"""
from database import db


class List(db.Model):
    """
    List model representing a container for items (tasks).
    
    Attributes:
        id: Primary key (auto-increment)
        title: List title (max 200 characters, required)
        user_id: Foreign key to User (required)
        position: Integer for ordering lists (default 0)
    """
    __tablename__ = 'lists'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    position = db.Column(db.Integer, default=0, nullable=False)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('lists', lazy=True, cascade='all, delete-orphan'))
    items = db.relationship('Item', backref='list', lazy=True, cascade='all, delete-orphan', order_by='Item.position')
    
    def to_dict(self):
        """
        Convert list instance to dictionary.
        
        Returns:
            dict: List data with item_count
        """
        return {
            'id': self.id,
            'title': self.title,
            'position': self.position,
            'item_count': len([item for item in self.items if item.parent_id is None])  # Count only top-level items
        }
    
    def __repr__(self):
        return f'<List {self.title}>'

