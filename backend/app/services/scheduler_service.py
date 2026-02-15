from app import db
from app.models import File, Alert, Escalation
from datetime import datetime, timedelta
from flask import current_app

def check_sla_status(app):
    """
    Checks for files that are near deadline or overdue.
    """
    with app.app_context():
        # Get pending files
        pending_files = File.query.filter_by(status='Pending').all()
        now = datetime.utcnow()
        
        for file in pending_files:
            if not file.sla_deadline:
                continue
                
            # Check for Overdue
            if now > file.sla_deadline:
                file.status = 'Overdue'
                file.overdue_level = 1 # Initial overdue
                
                # Create Alert
                alert = Alert(
                    file_id=file.id,
                    message=f"File {file.filename} is OVERDUE! Deadline was {file.sla_deadline}"
                )
                db.session.add(alert)
                
            # Check for Nearing Deadline (e.g. 1 day left)
            elif (file.sla_deadline - now) < timedelta(days=1) and not file.reminder_sent:
                file.reminder_sent = True
                alert = Alert(
                    file_id=file.id,
                    message=f"File {file.filename} is nearing deadline. Due: {file.sla_deadline}"
                )
                db.session.add(alert)
                
        db.session.commit()

def start_scheduler(app):
    from apscheduler.schedulers.background import BackgroundScheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=check_sla_status, args=[app], trigger="interval", minutes=60, id='sla_check', replace_existing=True)
    scheduler.start()
