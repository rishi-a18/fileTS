from flask import Blueprint, send_file, current_app
from app.models import File, Section
from app.routes.auth import token_required
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from datetime import datetime

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/daily', methods=['GET'])
@token_required
def generate_daily_report(current_user):
    # Only Admin or Collector or Section Officer can generate?
    # For now, allow logged in users
    
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 50, f"Daily File Status Report - {datetime.utcnow().strftime('%Y-%m-%d')}")
    
    # Stats
    total = File.query.count()
    pending = File.query.filter_by(status='Pending').count()
    completed = File.query.filter_by(status='Completed').count()
    overdue = File.query.filter_by(status='Overdue').count()
    
    p.setFont("Helvetica", 12)
    y = height - 100
    p.drawString(50, y, f"Total Files: {total}")
    p.drawString(200, y, f"Pending: {pending}")
    p.drawString(350, y, f"Completed: {completed}")
    p.drawString(500, y, f"Overdue: {overdue}")
    
    y -= 40
    p.line(50, y+10, 550, y+10)
    
    # Section Breakdown
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Section Breakdown")
    y -= 30
    
    sections = Section.query.all()
    p.setFont("Helvetica", 10)
    for section in sections:
        s_total = File.query.filter_by(section_id=section.id).count()
        s_pending = File.query.filter_by(section_id=section.id, status='Pending').count()
        s_completed = File.query.filter_by(section_id=section.id, status='Completed').count()
        s_overdue = File.query.filter_by(section_id=section.id, status='Overdue').count()
        
        stat_line = f"Section {section.name}: Total={s_total}, Pending={s_pending}, Completed={s_completed}, Overdue={s_overdue}"
        p.drawString(60, y, stat_line)
        y -= 20
        if y < 50:
            p.showPage()
            y = height - 50
            
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name='daily_report.pdf', mimetype='application/pdf')
