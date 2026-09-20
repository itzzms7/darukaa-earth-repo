from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = (
        "postgresql+psycopg://darukaa:darukaa_dev_password"
        "@localhost:5432/darukaa"
    )

    database_schema: str = "darukaa"
    jwt_secret: str = "dev-only-change-this-secret"
    jwt_expire_minutes: int = 60
    class Config:
        env_file = ".env"


settings = Settings()
