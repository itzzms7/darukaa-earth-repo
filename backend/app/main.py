from fastapi import FastAPI

app = FastAPI(
    title="Darukaa.Earth API",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "darukaa-earth-api",
    }