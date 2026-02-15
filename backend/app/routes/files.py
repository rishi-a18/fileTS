import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from app import db
from app.models import File, Section
from app.routes.auth import token_required
from app.services.ai_service import extract_metadata
from datetime import datetime, timedelta

files_bp = Blueprint('files', __name__)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'docx'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@files_bp.route('/', methods=['GET'])
@token_required
def get_files(current_user):
    # Filter based on role
    if current_user.role == 'Section Officer':
        files = File.query.filter_by(section_id=current_user.section_id).all()
    elif current_user.role == 'Operator':
         # Operators might see all or just what they uploaded? Let's say all for now or recently uploaded
         files = File.query.all()
    else:
        files = File.query.all()

    output = []
    for file in files:
        file_data = {
            'id': file.id,
            'filename': file.filename,
            'section': file.section_ref.name,
            'priority': file.priority,
            'status': file.status,
            'upload_date': file.upload_date.isoformat() if file.upload_date else None,
            'sla_deadline': file.sla_deadline.isoformat() if file.sla_deadline else None
        }
        output.append(file_data)
    
    return jsonify({'files': output})

@files_bp.route('/upload', methods=['POST'])
@token_required
def upload_file(current_user):
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']
    section_id = request.form.get('section_id') # Operator selects section

    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if not section_id:
         return jsonify({'message': 'Section is required'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_folder = current_app.config['UPLOAD_FOLDER']
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        # Extract metadata via AI
        metadata = extract_metadata(file_path)
        priority = metadata.get('priority', 'Medium')
        extracted_date = metadata.get('extracted_date')
        
        # Calculate SLA
        sla_days = {'Critical': 1, 'High': 3, 'Medium': 5, 'Low': 7}
        days = sla_days.get(priority, 5)
        sla_deadline = datetime.utcnow() + timedelta(days=days)
        
        new_file = File(
            filename=filename,
            file_path=file_path,
            section_id=section_id,
            priority=priority,
            extracted_date=datetime.strptime(extracted_date, '%Y-%m-%d').date() if extracted_date else None,
            sla_deadline=sla_deadline,
            status='Pending'
        )
        
        db.session.add(new_file)
        db.session.commit()
        
        return jsonify({'message': 'File uploaded successfully', 'file_id': new_file.id}), 201
    
    return jsonify({'message': 'File type not allowed'}), 400

@files_bp.route('/<int:file_id>/complete', methods=['PUT'])
@token_required
def mark_completed(current_user, file_id):
    file = File.query.get_or_404(file_id)
    
    # Permission check:
    # 1. Admin/Collector can complete any file
    # 2. Section Officer can only complete files in their section
    if current_user.role not in ['Admin', 'Collector']:
        if current_user.role != 'Section Officer' or file.section_id != current_user.section_id:
            return jsonify({'message': 'Permission denied'}), 403

    file.status = 'Completed'
    file.completion_date = datetime.utcnow()
    file.sla_deadline = None # Remove from SLA monitoring? Or keep for record? User req said "Remove from SLA monitoring"
    # Actually, keep the deadline for record, but status 'Completed' excludes it from checks in scheduler
    
    db.session.commit()
    return jsonify({'message': 'File marked as completed'}), 200

@files_bp.route('/<int:file_id>/view', methods=['GET'])
@token_required
def view_file(current_user, file_id):
    file = File.query.get_or_404(file_id)
    
    # Permission check:
    # 1. Admin/Collector can view any file
    # 2. Section Officer can view files in their section
    # 3. Operator? Maybe if they uploaded it? For now, let's allow Operator to view all for simplicity or restrict.
    # Let's align with get_files:
    if current_user.role == 'Section Officer' and file.section_id != current_user.section_id:
        return jsonify({'message': 'Permission denied'}), 403

    # Construct absolute path
    # File.file_path is stored as absolute path in upload_file (os.path.join(upload_folder, filename))
    # send_from_directory requires directory and filename
    
    upload_folder = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_folder, file.filename)
