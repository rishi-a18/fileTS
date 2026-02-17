from flask import Blueprint, send_file, current_app
from app.models import File, Section
from app.routes.auth import token_required
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
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
    p.setFillColor(colors.darkblue)
    p.setFont("Helvetica-Bold", 18)
    p.drawString(50, height - 50, f"Daily File Status Report")
    p.setFont("Helvetica", 12)
    p.setFillColor(colors.black)
    p.drawString(50, height - 70, f"Date: {datetime.utcnow().strftime('%Y-%m-%d')}")
    
    # Stats
    total = File.query.count()
    pending = File.query.filter_by(status='Pending').count()
    completed = File.query.filter_by(status='Completed').count()
    overdue = File.query.filter_by(status='Overdue').count()
    
    y = height - 120
    
    # Draw colored stats
    # Total
    p.setFont("Helvetica-Bold", 14)
    p.setFillColor(colors.blue)
    p.drawString(50, y, f"Total: {total}")
    
    # Completed
    p.setFillColor(colors.green)
    p.drawString(200, y, f"Completed: {completed}")

    # Pending
    p.setFillColor(colors.orange)
    p.drawString(350, y, f"Pending: {pending}")

    # Overdue
    p.setFillColor(colors.red)
    p.drawString(500, y, f"Overdue: {overdue}")
    
    y -= 20
    p.setStrokeColor(colors.lightgrey)
    p.line(50, y, 550, y)
    
    # Section Breakdown
    y -= 40
    p.setFillColor(colors.black)
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Section Breakdown")
    y -= 30
    
    sections = Section.query.all()
    p.setFont("Helvetica", 11)
    
    for section in sections:
        s_total = File.query.filter_by(section_id=section.id).count()
        s_pending = File.query.filter_by(section_id=section.id, status='Pending').count()
        s_completed = File.query.filter_by(section_id=section.id, status='Completed').count()
        s_overdue = File.query.filter_by(section_id=section.id, status='Overdue').count()
        
        # Section Name
        p.setFillColor(colors.black)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(60, y, f"Section: {section.name}")
        
        # Stats for section
        p.setFont("Helvetica", 10)
        p.setFillColor(colors.blue)
        p.drawString(200, y, f"T: {s_total}")
        
        p.setFillColor(colors.green)
        p.drawString(260, y, f"C: {s_completed}")
        
        p.setFillColor(colors.orange)
        p.drawString(320, y, f"P: {s_pending}")
        
        p.setFillColor(colors.red)
        p.drawString(380, y, f"O: {s_overdue}")
        
        y -= 25
        if y < 50:
            p.showPage()
            y = height - 50
            
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name='daily_report.pdf', mimetype='application/pdf')
