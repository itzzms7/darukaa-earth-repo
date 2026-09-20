from datetime import date

from sqlalchemy import Date, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Analytics(Base):
    __tablename__ = "analytics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    site_id: Mapped[int] = mapped_column(
        ForeignKey("darukaa.sites.id"),
        nullable=False,
    )

    metric: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    site = relationship(
        "Site",
        back_populates="analytics",
    )