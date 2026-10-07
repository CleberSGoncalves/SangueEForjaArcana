@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo [*] Compilando Sangue e Forja Arcana via Vite...
npm run build
echo [✓] Build concluido!
pause
