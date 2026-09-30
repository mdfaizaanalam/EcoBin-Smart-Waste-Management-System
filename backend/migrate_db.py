import sys
from database.db import engine, init_db
from sqlalchemy import text
from database.models import Base

def run_migration():
    print("[MIGRATION] Initializing missing tables...")
    init_db()

    print("[MIGRATION] Checking/adding column waste_category to bins...")
    with engine.connect() as conn:
        try:
            # Check database dialect
            dialect_name = engine.dialect.name
            print(f"[MIGRATION] Database dialect: {dialect_name}")
            if dialect_name == 'postgresql':
                conn.execute(text("ALTER TABLE bins ADD COLUMN IF NOT EXISTS waste_category VARCHAR(50) DEFAULT 'general';"))
            else:
                # SQLite
                try:
                    conn.execute(text("ALTER TABLE bins ADD COLUMN waste_category VARCHAR(50) DEFAULT 'general';"))
                except Exception as sqle:
                    if 'duplicate column' in str(sqle).lower() or 'already exists' in str(sqle).lower():
                        print("[MIGRATION] Column already exists in SQLite")
                    else:
                        raise sqle
            conn.commit()
            print("[MIGRATION] Column waste_category verified successfully.")
        except Exception as e:
            print(f"[MIGRATION] Note: {e}")

if __name__ == '__main__':
    run_migration()
