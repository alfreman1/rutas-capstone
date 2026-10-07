from fastapi import FastAPI
from src.api.routes import optimization

app = FastAPI(title="Motor de Optimización Logística API", version="1.0.0")

app.include_router(optimization.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
