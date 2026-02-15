from app import create_app, db
from app.models import Section, User

app = create_app()

def seed_data():
    with app.app_context():
        # Seed Sections
        sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        for name in sections:
            if not Section.query.filter_by(name=name).first():
                db.session.add(Section(name=name))
        
        db.session.commit()
        print("Sections seeded.")
        
        # Seed Admin User
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', role='Admin')
            admin.set_password('admin123')
            db.session.add(admin)
        
        # Seed Operator
        if not User.query.filter_by(username='operator').first():
            op = User(username='operator', role='Operator')
            op.set_password('op123')
            db.session.add(op)
            
        # Seed Collector
        if not User.query.filter_by(username='collector').first():
            col = User(username='collector', role='Collector')
            col.set_password('col123')
            db.session.add(col)
            
        # Seed Section Officers
        sections = Section.query.all()
        for section in sections:
            username = f"section_{section.name.lower()}"
            if not User.query.filter_by(username=username).first():
                officer = User(username=username, role='Section Officer', section_id=section.id)
                officer.set_password('sec123')
                db.session.add(officer)
                print(f"Created user: {username}")
            
        db.session.commit()
        print("Users seeded.")

if __name__ == '__main__':
    seed_data()
