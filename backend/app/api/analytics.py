from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.analytics import Analytics
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.analytics import AnalyticsCreate, AnalyticsResponse

router = APIRouter(
    prefix="/sites",
    tags=["Analytics"],
)


def get_owned_site(
    site_id: int,
    db: Session,
    current_user: User,
):
    return db.scalar(
        select(Site)
        .join(Project, Site.project_id == Project.id)
        .where(
            Site.id == site_id,
            Project.owner_id == current_user.id,
        )
    )


@router.post(
    "/{site_id}/analytics",
    response_model=AnalyticsResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_analytics(
    site_id: int,
    payload: AnalyticsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site = get_owned_site(site_id, db, current_user)

    if site is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )

    analytics = Analytics(
        site_id=site_id,
        metric=payload.metric,
        date=payload.date,
        value=payload.value,
    )

    db.add(analytics)
    db.commit()
    db.refresh(analytics)

    return analytics


@router.get(
    "/{site_id}/analytics",
    response_model=list[AnalyticsResponse],
)
def list_analytics(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site = get_owned_site(site_id, db, current_user)

    if site is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )

    return db.scalars(
        select(Analytics)
        .where(Analytics.site_id == site_id)
        .order_by(Analytics.date)
    ).all()