from typing import Any

from pydantic import BaseModel


class SiteCreate(BaseModel):
    name: str
    geometry: dict[str, Any]


class SiteResponse(BaseModel):
    id: int
    name: str
    project_id: int
    geometry: dict[str, Any]