"""
scripts/server.py - Servidor Web de Produção do Sangue e Forja Arcana
Serve os arquivos estáticos de dist/ e fornece endpoints de monitoramento (/api/health).
Porta padrão: 8096
"""
import os
import sys
import time
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import uvicorn

ROOT_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT_DIR / "dist"
PUBLIC_DIR = ROOT_DIR / "public"
START_TIME = time.time()
PORT = 8096

app = FastAPI(title="Sangue e Forja Arcana - Production Server")

def get_static_dir():
    if (DIST_DIR / "index.html").exists():
        return DIST_DIR
    if (PUBLIC_DIR / "index.html").exists():
        return PUBLIC_DIR
    return DIST_DIR

@app.get("/api/health")
async def health_check():
    uptime = int(time.time() - START_TIME)
    dist_ready = (DIST_DIR / "index.html").exists()
    public_ready = (PUBLIC_DIR / "index.html").exists()
    return JSONResponse({
        "status": "online",
        "game": "Sangue e Forja Arcana",
        "genre": "ARPG-Survivors / Bullet Heaven",
        "port": PORT,
        "dist_ready": dist_ready,
        "public_ready": public_ready,
        "uptime_seconds": uptime,
        "domain": "https://sangueeforjaarcana.kinomuse.com.br"
    })

# Rota principal para fallback do SPA / Jogo HTML5
@app.get("/")
async def serve_index():
    static_dir = get_static_dir()
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return JSONResponse({
        "status": "building",
        "message": "Sangue e Forja Arcana está em compilação. Execute build_projeto.bat para compilar os ativos."
    })

# Monta diretório estático
serve_dir = get_static_dir()
if serve_dir.exists():
    app.mount("/", StaticFiles(directory=str(serve_dir), html=True), name="static")

def run():
    uvicorn.run(app, host="127.0.0.1", port=PORT, log_level="warning", access_log=False)

if __name__ == "__main__":
    run()
