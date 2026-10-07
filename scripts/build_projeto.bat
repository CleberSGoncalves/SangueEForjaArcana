@echo off
setlocal

echo ============================================================
echo   SANGUE E FORJA ARCANA - BUILD DE PRODUCAO
echo ============================================================
echo.

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%.."
set "PROJECT_ROOT=%CD%"

echo [*] Diretorio do Projeto: %PROJECT_ROOT%
echo [*] Executando npm run build...
echo.

call npm.cmd run build
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao executar npm run build!
    popd
    exit /b 1
)

echo.
echo [*] Validando arquivos gerados...

if not exist "dist\index.html" (
    echo [ERRO] dist\index.html nao encontrado!
    popd
    exit /b 1
) else (
    echo [OK] dist\index.html gerado com sucesso.
)

if not exist "public\index.html" (
    echo [ERRO] public\index.html nao encontrado!
    popd
    exit /b 1
) else (
    echo [OK] public\index.html gerado com sucesso.
)

if not exist "public\assets" (
    echo [ERRO] public\assets nao encontrado!
    popd
    exit /b 1
) else (
    echo [OK] public\assets gerado com sucesso.
)

echo.
echo ============================================================
echo [SUCESSO] Build concluido e sincronizado com public/!
echo ============================================================
popd
exit /b 0
