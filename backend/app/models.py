from app import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), nullable=False) # Operator, Section Officer, Collector, Admin
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=True)

    def set_password(self, password):
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'section': self.section.name if self.section else None
        }

class Section(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False) # A, B, C... H
    users = db.relationship('User', backref='section', lazy=True)
    files = db.relationship('File', backref='section_ref', lazy=True)

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)
    priority = db.Column(db.String(20), default='Medium') # Low, Medium, High, Critical
    status = db.Column(db.String(20), default='Pending') # Pending, Completed, Overdue
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    extracted_date = db.Column(db.Date, nullable=True)
    sla_deadline = db.Column(db.DateTime, nullable=True)
    completion_date = db.Column(db.DateTime, nullable=True)
    reminder_sent = db.Column(db.Boolean, default=False)
    escalation_level = db.Column(db.Integer, default=0)

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey('file.id'), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

class Escalation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey('file.id'), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    triggered_at = db.Column(db.DateTime, default=datetime.utcnow)
