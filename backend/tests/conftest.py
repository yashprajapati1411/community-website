import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import pool

from app.main import app as fastapi_app
from app.core.database import get_db
from app.models.base import Base
import app.models.user
import app.models.member
import app.models.booking
import app.models.content

# Isolated test database URL using SQLite in-memory with StaticPool for fast, isolated tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=pool.StaticPool,
    echo=False
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

@pytest_asyncio.fixture(scope="function", autouse=True)
async def reset_database():
    """Reset and recreate all tables in the in-memory SQLite database before each test function."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def db_session():
    """Yield a fresh async database session for the current test case."""
    async with TestSessionLocal() as session:
        yield session

@pytest_asyncio.fixture(scope="function")
async def client():
    """Yield an async HTTPX client overriding the FastAPI database dependency."""
    async def override_get_db():
        async with TestSessionLocal() as session:
            yield session
            
    fastapi_app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=fastapi_app), base_url="http://testserver") as ac:
        yield ac
    fastapi_app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def admin_user(db_session: AsyncSession):
    """Seed and return an admin user and associated profile in the test database."""
    from app.repositories.repo_user import UserRepository
    from app.repositories.repo_member import MemberRepository
    from app.core.security import get_password_hash
    
    hashed_pw = get_password_hash("987654")
    user = await UserRepository.create(
        db_session,
        email="admin@test.com",
        hashed_password=hashed_pw,
        role="admin"
    )
    await MemberRepository.create_profile(
        db_session,
        user_id=user.id,
        full_name="Admin Test",
        village="SSPV Mandala",
        address="Test Address",
        mobile="9999999999"
    )
    await db_session.commit()
    return user

@pytest_asyncio.fixture(scope="function")
async def admin_token_headers(admin_user):
    """Return authorization Bearer headers for the test admin user."""
    from app.core.security import create_access_token
    token = create_access_token(subject=admin_user.id, role=admin_user.role)
    return {"Authorization": f"Bearer {token}"}

@pytest_asyncio.fixture(scope="function")
async def normal_user(db_session: AsyncSession):
    """Seed and return a normal member user and associated profile in the test database."""
    from app.repositories.repo_user import UserRepository
    from app.repositories.repo_member import MemberRepository
    from app.core.security import get_password_hash
    
    hashed_pw = get_password_hash("memberpassword")
    user = await UserRepository.create(
        db_session,
        email="member@test.com",
        hashed_password=hashed_pw,
        role="member"
    )
    await MemberRepository.create_profile(
        db_session,
        user_id=user.id,
        full_name="Member Test",
        village="Test Village",
        address="Member Address",
        mobile="8888888888"
    )
    await db_session.commit()
    return user

@pytest_asyncio.fixture(scope="function")
async def normal_user_token_headers(normal_user):
    """Return authorization Bearer headers for the test normal member user."""
    from app.core.security import create_access_token
    token = create_access_token(subject=normal_user.id, role=normal_user.role)
    return {"Authorization": f"Bearer {token}"}
