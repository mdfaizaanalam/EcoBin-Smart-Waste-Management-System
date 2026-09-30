import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from dotenv import load_dotenv
from database.models import Base

# Load environment variables
load_dotenv()

# Database URL configuration (defaults to SQLite for local development convenience)
if not os.getenv("DATABASE_URL"):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_file = os.path.join(base_dir, "waste_management.db")
    if not os.path.exists(db_file):
        parent_db = os.path.join(os.path.dirname(base_dir), "waste_management.db")
        if os.path.exists(parent_db):
            db_file = parent_db
    DATABASE_URL = f"sqlite:///{db_file}"
else:
    raw_url = os.getenv("DATABASE_URL")
    if raw_url.startswith("postgres://"):
        raw_url = raw_url.replace("postgres://", "postgresql://", 1)
    DATABASE_URL = raw_url

from sqlalchemy import event

# Create engine
# If SQLite, allow multi-threaded access for FastAPI and enable WAL mode
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA synchronous=NORMAL;")
        cursor.execute("PRAGMA cache_size=10000;")
        cursor.execute("PRAGMA temp_store=MEMORY;")
        cursor.close()
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=60,
        pool_timeout=30
    )

# Create session factories
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db_session = scoped_session(SessionLocal)

def init_db():
    """Initializes the database by creating all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")

def get_db():
    """Dependency for FastAPI endpoints to yield a database session."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
