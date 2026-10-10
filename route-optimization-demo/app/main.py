"""Serve the local interface and solve validated small scenarios."""
import json
import threading
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.data import ROOT, DEPOT, presets, generate_scenario
from app.schema import Scenario, GenerateInput
from app.solver import optimize

app = FastAPI(title="Nexo Route Optimization", version="1.0.0")
app.mount("/static", StaticFiles(directory=ROOT / "frontend"), name="static")
solve_lock = threading.Lock()


@app.get("/")
def home():
    return FileResponse(ROOT / "frontend/index.html")


@app.get("/api/health")
def health():
    return {"status": "ok", "solver": "OR-Tools", "search_seconds": 2}


@app.get("/api/scenarios")
def scenarios():
    return {"depot": DEPOT, "presets": presets()}


@app.post("/api/generate")
def generate(payload: GenerateInput):
    return generate_scenario(payload.seed, payload.order_count).model_dump()


@app.post("/api/optimize")
def solve(payload: Scenario):
    if not solve_lock.acquire(blocking=False):
        raise HTTPException(429, "Hay una búsqueda en curso. Inténtalo nuevamente.")
    try:
        return optimize(payload)
    finally:
        solve_lock.release()


@app.get("/api/benchmark")
def benchmark():
    path = ROOT / "artifacts/benchmark.json"
    if not path.exists():
        raise HTTPException(404, "Ejecuta python -m app.evaluate para crear la evaluación.")
    return json.loads(path.read_text())
