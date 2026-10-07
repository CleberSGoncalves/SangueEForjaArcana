"""
scripts/service_manager.py - Gerenciador de Serviço Windows do Sangue e Forja Arcana
Permite gerenciar o jogo como serviço autônomo do Windows (via Task Scheduler / pythonw).

Uso:
  python scripts/service_manager.py install    # Registra a tarefa agendada no Windows
  python scripts/service_manager.py uninstall  # Remove a tarefa agendada
  python scripts/service_manager.py start      # Inicia via Tarefa Agendada / background desacoplado
  python scripts/service_manager.py stop       # Para o serviço e libera a porta 8096
  python scripts/service_manager.py restart    # Reinicia o serviço
  python scripts/service_manager.py status     # Consulta status detalhado, PID, porta e saúde HTTP
"""
import os
import sys
import time
import subprocess
import urllib.request
import json
from pathlib import Path
from typing import Optional

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ROOT_DIR = Path(__file__).resolve().parent.parent
LOGS_DIR = ROOT_DIR / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

PID_FILE = LOGS_DIR / "service.pid"
TASK_NAME = "SangueEForjaArcana_Service"
PORT = 8096
DOMAIN_NAME = "sangueeforjaarcana.kinomuse.com.br"
SUBPROCESS_FLAGS = getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)

def find_pythonw() -> str:
    pw = Path(sys.executable).parent / "pythonw.exe"
    if pw.exists():
        return str(pw)
    return sys.executable

def get_running_service_pid() -> Optional[int]:
    if PID_FILE.exists():
        try:
            pid = int(PID_FILE.read_text(encoding="utf-8").strip())
            res = subprocess.run(f'tasklist /FI "PID eq {pid}" /NH', shell=True, capture_output=True, text=True, creationflags=SUBPROCESS_FLAGS)
            if str(pid) in res.stdout:
                return pid
        except Exception:
            pass

    try:
        out = subprocess.check_output(f'netstat -ano | findstr ":{PORT}"', shell=True, text=True, creationflags=SUBPROCESS_FLAGS)
        for line in out.splitlines():
            parts = line.strip().split()
            if len(parts) >= 5 and "LISTENING" in parts:
                pid = int(parts[-1])
                if pid > 0:
                    return pid
    except Exception:
        pass

    return None

def check_http_health(timeout: float = 3.0) -> dict:
    url = f"http://127.0.0.1:{PORT}/api/health"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SangueEForjaArcana-ServiceManager/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status == 200:
                return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return {"status": "offline", "error": str(e)}
    return {"status": "offline"}

def install_task() -> bool:
    print(f"[*] Registrando tarefa agendada '{TASK_NAME}' no Windows Task Scheduler...")
    pythonw = find_pythonw()
    start_script = ROOT_DIR / "scripts" / "start_service.py"

    cmd = (
        f'schtasks /Create /TN "{TASK_NAME}" '
        f'/TR "\"{pythonw}\" \"{start_script}\"" '
        f'/SC ONLOGON /RL HIGHEST /F'
    )
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, creationflags=SUBPROCESS_FLAGS)
    if res.returncode == 0:
        print(f"[✓] Tarefa '{TASK_NAME}' criada com sucesso!")
        return True
    else:
        print(f"[✗] Erro ao criar tarefa: {res.stderr or res.stdout}")
        return False

def uninstall_task() -> bool:
    print(f"[*] Removendo tarefa agendada '{TASK_NAME}'...")
    cmd = f'schtasks /Delete /TN "{TASK_NAME}" /F'
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, creationflags=SUBPROCESS_FLAGS)
    if res.returncode == 0:
        print(f"[✓] Tarefa '{TASK_NAME}' removida com sucesso!")
        return True
    else:
        print(f"[!] Tarefa não encontrada ou já removida.")
        return False

def start_service():
    print(f"[*] Iniciando serviço '{TASK_NAME}'...")
    pid = get_running_service_pid()
    if pid:
        print(f"[!] Serviço já está em execução (PID: {pid}).")
        status_service()
        return

    # Tenta rodar via schtasks primeiro
    res = subprocess.run(f'schtasks /Run /TN "{TASK_NAME}"', shell=True, capture_output=True, text=True, creationflags=SUBPROCESS_FLAGS)
    if res.returncode != 0:
        # Se a tarefa ainda não existir, instala primeiro e roda
        print(f"[*] Instalando tarefa agendada primeiro...")
        if install_task():
            subprocess.run(f'schtasks /Run /TN "{TASK_NAME}"', shell=True, capture_output=True, text=True, creationflags=SUBPROCESS_FLAGS)

    # Aguarda inicialização
    for i in range(10):
        time.sleep(1)
        health = check_http_health(timeout=1.0)
        if health.get("status") == "online":
            print(f"[✓] Serviço iniciado e respondendo em http://127.0.0.1:{PORT}")
            print(f"[✓] Domínio Público: https://{DOMAIN_NAME}")
            return

    print("[!] O serviço foi disparado. Verifique os logs em logs/service_output.log")

def stop_service():
    print(f"[*] Parando serviço '{TASK_NAME}'...")
    subprocess.run(f'schtasks /End /TN "{TASK_NAME}"', shell=True, capture_output=True, creationflags=SUBPROCESS_FLAGS)

    pid = get_running_service_pid()
    if pid:
        print(f"[*] Finalizando processo PID {pid}...")
        subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True, creationflags=SUBPROCESS_FLAGS)

    if PID_FILE.exists():
        try:
            PID_FILE.unlink()
        except Exception:
            pass

    # Mata cloudflared específico deste túnel
    try:
        import psutil
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            pname = (proc.info.get('name') or '').lower()
            if "cloudflared" in pname:
                cmd = " ".join(proc.info.get('cmdline') or []).lower()
                if "sangueeforjaarcana" in cmd or "c346fce7" in cmd:
                    subprocess.run(f"taskkill /F /PID {proc.info['pid']}", shell=True, capture_output=True, creationflags=SUBPROCESS_FLAGS)
    except Exception:
        pass

    print("[✓] Serviço parado com sucesso.")

def restart_service():
    print(f"[*] Reiniciando serviço '{TASK_NAME}'...")
    stop_service()
    time.sleep(2)
    start_service()

def status_service():
    print("=" * 60)
    print(f"STATUS DO SERVIÇO: {TASK_NAME}")
    print("=" * 60)
    pid = get_running_service_pid()
    if pid:
        print(f"• Processo: ONLINE (PID: {pid})")
    else:
        print("• Processo: OFFLINE")

    health = check_http_health(timeout=2.0)
    if health.get("status") == "online":
        print(f"• Servidor HTTP: ONLINE (Porta {PORT})")
        print(f"• Uptime: {health.get('uptime_seconds', 0)}s")
        print(f"• Domínio Público: https://{DOMAIN_NAME}")
    else:
        print(f"• Servidor HTTP: INACESSÍVEL / OFFLINE ({health.get('error', 'Sem resposta')})")
    print("=" * 60)

if __name__ == "__main__":
    action = sys.argv[1].lower() if len(sys.argv) > 1 else "status"
    if action == "install":
        install_task()
    elif action == "uninstall":
        uninstall_task()
    elif action == "start":
        start_service()
    elif action == "stop":
        stop_service()
    elif action == "restart":
        restart_service()
    elif action == "status":
        status_service()
    else:
        print("Ação desconhecida. Use: install | uninstall | start | stop | restart | status")
