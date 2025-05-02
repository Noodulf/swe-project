# create_tables.py
from app.__init__ import create_app
from app.extensions import db
from app.models.user import User
from app.models.manager import Manager
from app.models.chef import Chef
from app.models.sales_clerk import SalesClerk

# Initialize the app
app = create_app()

# Create tables in the database
with app.app_context():
    try:
        print("Initializing DB...")
        db.create_all()  # Create tables
        print("Tables created successfully.")
    except Exception as e:
        print(f"Error: {e}")
