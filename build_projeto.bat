@echo off
chcp 65001 >nul
cd /d "%~dp0"
call "scripts\build_projeto.bat"
if %ERRORLEVEL% NEQ 0 (
    echo [X] Falha no build.
    if "%1"=="" pause
    exit /b %ERRORLEVEL%
)
if "%1"=="" pause
