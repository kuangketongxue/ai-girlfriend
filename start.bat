@echo off
echo.
echo ========================================
echo   小暖 — AI女友 一键启动
echo ========================================
echo.

:: 启动服务器
echo [1/2] 启动服务器...
start /B node "%~dp0server.js"

:: 等待服务器启动
timeout /t 3 /nobreak >nul

:: 验证服务器
curl -s http://localhost:3000/ >nul 2>&1
if %errorlevel%==0 (
    echo [OK] 服务器已启动 http://localhost:3000
) else (
    echo [ERROR] 服务器启动失败
    pause
    exit /b 1
)

:: 启动隧道
echo [2/2] 启动公网隧道...
echo.
echo ========================================
echo   请复制下面的地址填到微信ClawBot：
echo ========================================
echo.
npx --yes localtunnel --port 3000
