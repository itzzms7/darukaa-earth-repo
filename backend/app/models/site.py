from geoalchemy2 import Geometry
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Site(Base):
    __tablename__ = "sites"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("darukaa.projects.id"),
        nullable=False,
    )

    geometry = mapped_column(
       Geometry(
          geometry_type="POLYGON",
          srid=4326,
          spatial_index=False,
       ),
       nullable=False,
    )

    project = relationship(
        "Project",
        back_populates="sites",
    )

    analytics = relationship(
        "Analytics",
        back_populates="site",
        cascade="all, delete-orphan",
    )