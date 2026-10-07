from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.api.routes import optimization

app = FastAPI(
    title="AI Engine API - LogiRoute",
    description="Motor de inteligencia artificial para clustering y VRP.",
    version="1.0.0"
)

# Simulamos la autenticación de servidor a servidor (NestJS -> FastAPI)
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # En producción esto se valida contra una variable de entorno o JWT real
    if credentials.credentials != "secret_key_for_ai":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials

@app.get("/health")
def health_check():
    return {"status": "ok", "engine": "FastAPI + OR-Tools"}

# Montar los routers
app.include_router(
    optimization.router,
    prefix="/api/v1/optimize",
    dependencies=[Depends(verify_token)]
)
