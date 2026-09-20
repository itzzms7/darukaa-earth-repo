from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.db.session import engine
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.sites import router as sites_router
from app.api.analytics import router as analytics_router


app = FastAPI(
    title="Darukaa.Earth API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://darukaa-proj-link.vercel.app",
        "https://darukaa-proj-darkmode.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(sites_router)
app.include_router(analytics_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "darukaa-earth-api",
    }
    
@app.get("/health/db")
def database_health_check():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "database": result.scalar(),
        }