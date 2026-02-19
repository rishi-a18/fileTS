import sqlite3
import os

# Database path (adjust if needed, usually in instance folder or root)
db_path = r'd:\file_mgmt\file_management_system\fileTS\backend\instance\filetracking.db'

# Check if file exists
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

print(f"Updating database at {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Add is_deleted column
    try:
        cursor.execute("ALTER TABLE file ADD COLUMN is_deleted BOOLEAN DEFAULT 0")
        print("Added is_deleted column.")
    except sqlite3.OperationalError as e:
        print(f"is_deleted column might already exist: {e}")

    # Add deletion_remarks column
    try:
        cursor.execute("ALTER TABLE file ADD COLUMN deletion_remarks VARCHAR(255)")
        print("Added deletion_remarks column.")
    except sqlite3.OperationalError as e:
        print(f"deletion_remarks column might already exist: {e}")

    conn.commit()
    print("Database update successful.")
except Exception as e:
    print(f"An error occurred: {e}")
    conn.rollback()
finally:
    conn.close()
