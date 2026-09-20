from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase


metadata = MetaData(schema="darukaa")


class Base(DeclarativeBase):
    metadata = metadata