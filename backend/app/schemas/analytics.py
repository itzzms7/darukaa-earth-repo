from datetime import date

from pydantic import BaseModel


class AnalyticsCreate(BaseModel):
    metric: str
    date: date
    value: float


class AnalyticsResponse(BaseModel):
    id: int
    site_id: int
    metric: str
    date: date
    value: float

    model_config = {
        "from_attributes": True,
    }