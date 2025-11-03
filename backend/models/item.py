"""
Item model for tasks within lists with hierarchical structure.
"""
from database import db


class Item(db.Model):
    """
    Item model representing a task within a list.
    Supports hierarchical structure up to 3 levels deep.
    
    Attributes:
        id: Primary key (auto-increment)
        title: Item title (max 500 characters, required)
        completed: Boolean indicating completion status (default False)
        list_id: Foreign key to List (required)
        parent_id: Foreign key to Item for hierarchical structure (nullable)
        position: Integer for ordering items within same level (default 0)
        level: Integer (1-3) representing depth: 1=item, 2=sub-item, 3=sub-sub-item
    """
    __tablename__ = 'items'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(500), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    list_id = db.Column(db.Integer, db.ForeignKey('lists.id', ondelete='CASCADE'), nullable=False, index=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('items.id', ondelete='CASCADE'), nullable=True, index=True)
    position = db.Column(db.Integer, default=0, nullable=False)
    level = db.Column(db.Integer, default=1, nullable=False)
    
    # Relationships
    parent = db.relationship('Item', remote_side=[id], backref=db.backref('children', lazy=True, cascade='all, delete-orphan', order_by='Item.position'))
    
    def to_dict(self, include_children=True):
        """
        Convert item instance to dictionary with nested children if requested.
        
        Args:
            include_children: If True, include nested children recursively
            
        Returns:
            dict: Item data with optional children
        """
        result = {
            'id': self.id,
            'title': self.title,
            'completed': self.completed,
            'level': self.level,
            'position': self.position,
            'list_id': self.list_id,
            'parent_id': self.parent_id
        }
        
        if include_children:
            # Include children up to 3 levels deep
            result['children'] = [child.to_dict(include_children=True) for child in self.children]
        
        return result
    
    def __repr__(self):
        return f'<Item {self.title}>'

