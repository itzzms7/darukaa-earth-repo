from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("darukaa.users.id"),
        nullable=False,
    )

    owner = relationship(
        "User",
        back_populates="projects",
    )

    sites = relationship(
        "Site",
        back_populates="project",
        cascade="all, delete-orphan",
    )