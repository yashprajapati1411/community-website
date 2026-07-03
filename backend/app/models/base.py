from datetime import datetime
from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# SQLAlchemy Declarative Base mapping catalog
class Base(DeclarativeBase):
    pass

# Mixin to inject automatic created_at & updated_at columns
class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

# Mixin to support soft deletes by tracking deleted_at timestamps
class SoftDeleteMixin:
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
