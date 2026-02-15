from flask import Blueprint, jsonify
from app.models import File, Section
from app.routes.auth import token_required
from sqlalchemy import func
from datetime import datetime
from flask import jsonify

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    # Filter by section if user belongs to one
    if current_user.section_id:
        # Overall Stats (Scoped to Section)
        total = File.query.filter_by(section_id=current_user.section_id).count()
        pending = File.query.filter_by(section_id=current_user.section_id, status='Pending').count()
        completed = File.query.filter_by(section_id=current_user.section_id, status='Completed').count()
        overdue = File.query.filter_by(section_id=current_user.section_id, status='Overdue').count()
        
        # Section-wise Stats (Only show their section)
        sections = Section.query.filter_by(id=current_user.section_id).all()
    else:
        # Overall Stats (Global)
        total = File.query.count()
        pending = File.query.filter_by(status='Pending').count()
        completed = File.query.filter_by(status='Completed').count()
        overdue = File.query.filter_by(status='Overdue').count()
        
        # Section-wise Stats (All Sections)
        sections = Section.query.all()

    section_stats = []
    for section in sections:
        s_pending = File.query.filter_by(section_id=section.id, status='Pending').count()
        s_overdue = File.query.filter_by(section_id=section.id, status='Overdue').count()
        s_completed = File.query.filter_by(section_id=section.id, status='Completed').count()
        s_total = File.query.filter_by(section_id=section.id).count()
        
        section_stats.append({
            'name': section.name,
            'pending': s_pending,
            'overdue': s_overdue,
            'completed': s_completed,
            'total': s_total
        })
        
    return jsonify({
        'overview': {
            'total': total,
            'pending': pending,
            'completed': completed,
            'overdue': overdue
        },
        'sections': section_stats
    })

@dashboard_bp.route('/alerts', methods=['GET'])
@token_required
def get_alerts(current_user):
    # Logic:
    # 1. Get all Pending files
    # 2. Filter by section if User has section_id
    # 3. Calculate SLA time elapsed
    # 4. If > 50% elapsed, add to alerts list
    
    query = File.query.filter_by(status='Pending')
    
    if current_user.section_id:
        query = query.filter_by(section_id=current_user.section_id)
        
    pending_files = query.all()
    alerts = []
    
    now = datetime.utcnow()
    
    for file in pending_files:
        if file.sla_deadline and file.upload_date:
            total_sla_duration = (file.sla_deadline - file.upload_date).total_seconds()
            elapsed_duration = (now - file.upload_date).total_seconds()
            
            if total_sla_duration > 0 and elapsed_duration > (total_sla_duration / 2):
                # Calculate percentage for UI
                percentage = min(100, int((elapsed_duration / total_sla_duration) * 100))
                time_left = file.sla_deadline - now
                
                # Format time left friendly
                days = time_left.days
                hours = time_left.seconds // 3600
                time_left_str = f"{days}d {hours}h" if days > 0 else f"{hours}h"
                if time_left.total_seconds() < 0:
                     time_left_str = "Overdue"

                alerts.append({
                    'id': file.id,
                    'filename': file.filename,
                    'section': file.section_ref.name,
                    'upload_date': file.upload_date.strftime('%Y-%m-%d'),
                    'sla_deadline': file.sla_deadline.strftime('%Y-%m-%d'),
                    'percentage': percentage,
                    'time_left': time_left_str,
                    'priority': file.priority
                })
    
    return jsonify(alerts)
