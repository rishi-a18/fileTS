from flask import Flask
import os
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    from app.models import User, File, Section, Alert, Escalation
    
    from app.routes.auth import auth_bp
    from app.routes.files import files_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.reports import reports_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(files_bp, url_prefix='/api/file')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    
    # Start Scheduler
    if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        from app.services.scheduler_service import start_scheduler
        start_scheduler(app)

    @app.route('/')
    def index():
        return "Backend is running!", 200

    return app
