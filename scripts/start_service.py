"""
scripts/start_service.py - Serviço Principal em Segundo Plano do Sangue e Forja Arcana.
Executa de forma headless (sem janelas ou popups):
1. Servidor Web FastAPI (Porta 8096)
2. Cloudflare Tunnel Supervisor (https://sangueeforjaarcana.kinomuse.com.br)
3. Logs em logs/service_output.log
4. PID em logs/service.pid
"""
import os
import sys
import time
import signal
import threading
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
os.chdir(ROOT_DIR)

LOGS_DIR = ROOT_DIR / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)
PID_FILE = LOGS_DIR / "service.pid"
CONFIG_YML = Path.home() / ".cloudflared" / "sangueeforjaarcana_config.yml"
TUNNEL_ID = "c346fce7-ad63-4729-85cd-02c2c68c2d2b"
PORT = 8096
DOMAIN_NAME = "sangueeforjaarcana.kinomuse.com.br"
SUBPROCESS_FLAGS = getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)

_service_out = open(LOGS_DIR / "service_output.log", "a", encoding="utf-8", buffering=1)
sys.stdout = _service_out
sys.stderr = _service_out
if sys.stdin is None or getattr(sys.stdin, "closed", False):
    sys.stdin = open(os.devnull, "r", encoding="utf-8")

def get_cloudflared_binary() -> str:
    candidates = [
        Path.home() / ".cloudflared" / "cloudflared.exe",
        Path(r"e:\desenvolvimento\SmartSheetStudio\cloudflared.exe"),
        Path(r"e:\desenvolvimento\Bot_Videos_TIKTOK\cloudflared.exe")
    ]
    for c in candidates:
        if c.exists():
            return str(c)
    return "cloudflared"

_tunnel_proc = None

def get_running_project_tunnels():
    pids = []
    try:
        import psutil
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            pname = (proc.info.get('name') or '').lower()
            if "cloudflared" in pname:
                cmd = " ".join(proc.info.get('cmdline') or []).lower()
                if "sangueeforjaarcana_config.yml" in cmd or TUNNEL_ID in cmd or "sangueeforjaarcana" in cmd:
                    pids.append(proc.info['pid'])
    except Exception:
        pass
    return pids

def ensure_tunnel_running():
    global _tunnel_proc
    existing = get_running_project_tunnels()
    if len(existing) >= 1:
        return

    if _tunnel_proc is None or _tunnel_proc.poll() is not None:
        bin_path = get_cloudflared_binary()
        cmd = [bin_path, "tunnel", "--protocol", "http2", "--config", str(CONFIG_YML), "run"]
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Iniciando Cloudflare Tunnel: {' '.join(cmd)}")
        try:
            _tunnel_proc = subprocess.Popen(
                cmd,
                stdout=_service_out,
                stderr=_service_out,
                creationflags=SUBPROCESS_FLAGS
            )
        except Exception as e:
            print(f"[ERRO TUNNEL] {e}")

should_exit = False

def tunnel_supervisor_thread():
    time.sleep(2)
    while not should_exit:
        try:
            ensure_tunnel_running()
        except Exception as e:
            print(f"[SUPERVISOR ERRO] {e}")
        time.sleep(5)

def free_port(port: int):
    try:
        out = subprocess.check_output(f'netstat -ano | findstr ":{port}"', shell=True, text=True, creationflags=SUBPROCESS_FLAGS)
        current_pid = os.getpid()
        for line in out.splitlines():
            parts = line.strip().split()
            if len(parts) >= 5 and "LISTENING" in parts:
                pid = int(parts[-1])
                if pid != current_pid and pid > 0:
                    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Liberando porta {port} ocupada pelo PID {pid}...")
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True, creationflags=SUBPROCESS_FLAGS)
    except Exception:
        pass

def cleanup_and_exit(signum=None, frame=None):
    global should_exit, _tunnel_proc
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Encerrando serviço Sangue e Forja Arcana...")
    should_exit = True
    if _tunnel_proc and _tunnel_proc.poll() is None:
        try:
            _tunnel_proc.terminate()
            _tunnel_proc.wait(timeout=3)
        except Exception:
            try:
                _tunnel_proc.kill()
            except Exception:
                pass

    for pid in get_running_project_tunnels():
        try:
            subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True, creationflags=SUBPROCESS_FLAGS)
        except Exception:
            pass

    if PID_FILE.exists():
        try:
            PID_FILE.unlink()
        except Exception:
            pass
    sys.exit(0)

def main():
    signal.signal(signal.SIGINT, cleanup_and_exit)
    signal.signal(signal.SIGTERM, cleanup_and_exit)

    PID_FILE.write_text(str(os.getpid()), encoding="utf-8")
    print(f"==================================================================")
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] SERVIÇO SANGUE E FORJA ARCANA INICIADO")
    print(f"PID: {os.getpid()} | Porta Local: {PORT} | Domínio: https://{DOMAIN_NAME}")
    print(f"==================================================================")

    # 1. Libera porta caso resíduo anterior
    free_port(PORT)

    # 2. Inicia supervisor do Cloudflare Tunnel
    t_sup = threading.Thread(target=tunnel_supervisor_thread, daemon=True)
    t_sup.start()

    # 3. Executa servidor Web FastAPI
    from scripts.server import run as run_server
    try:
        run_server()
    except Exception as e:
        print(f"[ERRO FATAL WEBSERVER] {e}")
    finally:
        cleanup_and_exit()

if __name__ == "__main__":
    main()
