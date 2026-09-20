from fastapi import APIRouter, Depends, HTTPException, status
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import shape
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.site import SiteCreate, SiteResponse

router = APIRouter(
    prefix="/projects",
    tags=["Sites"],
)


@router.post(
    "/{project_id}/sites",
    response_model=SiteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_site(
    project_id: int,
    payload: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.scalar(
        select(Project).where(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    try:
        geometry = shape(payload.geometry)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid GeoJSON geometry",
        )

    if geometry.geom_type != "Polygon":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Site geometry must be a Polygon",
        )

    site = Site(
        name=payload.name,
        project_id=project_id,
        geometry=from_shape(geometry, srid=4326),
    )

    db.add(site)
    db.commit()
    db.refresh(site)

    return SiteResponse(
        id=site.id,
        name=site.name,
        project_id=site.project_id,
        geometry=payload.geometry,
    )


@router.get(
    "/{project_id}/sites",
    response_model=list[SiteResponse],
)
def list_sites(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.scalar(
        select(Project).where(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    sites = db.scalars(
        select(Site)
        .where(Site.project_id == project_id)
        .order_by(Site.id)
    ).all()

    return [
        SiteResponse(
            id=site.id,
            name=site.name,
            project_id=site.project_id,
            geometry=to_shape(site.geometry).__geo_interface__,
        )
        for site in sites
    ]