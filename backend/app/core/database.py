from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config.settings import settings

from sqlalchemy import event
from sqlalchemy.engine import Engine

# Set up database-specific connection arguments
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

# Create async database engine, dynamically referencing SQL_ECHO
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.SQL_ECHO,
    pool_pre_ping=True,
    connect_args=connect_args
)

# Conditionally enforce foreign keys and enable WAL mode for SQLite connections
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if "sqlite" in dbapi_connection.__class__.__module__.lower():
        cursor = dbapi_connection.cursor()

        try:
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
        except Exception:
            pass
        finally:
            cursor.close()


# Async session factory
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Dependency generator to retrieve database sessions per request
async def get_db():
    async with SessionLocal() as session:
        yield session
