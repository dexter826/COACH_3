@echo off
cd /d "%~dp0"

echo [1/3] Kiem tra thu vien...
if not exist "node_modules\" (
    echo Dang cai dat thu vien (npm install)...
    call npm install
) else (
    echo Thu vien da duoc cai dat.
)

echo.
echo [2/3] Kiem tra file cau hinh...
if not exist ".env" (
    echo Tao file .env tu .env.example...
    copy .env.example .env
    echo VUI LONG DIEN OPENROUTER_API_KEY VAO FILE .env
) else (
    echo File .env da ton tai.
)

echo.
echo [3/3] Khoi dong server...
start http://localhost:3000
node server.js

pause
