@echo off
REM Faucet DApp Development Scripts for Windows

if "%1"=="setup" goto setup
if "%1"=="dev" goto dev
if "%1"=="backend-dev" goto backend-dev
if "%1"=="frontend-dev" goto frontend-dev
if "%1"=="clean" goto clean

echo Available commands:
echo   setup        - Install dependencies
echo   dev          - Start both frontend and backend
echo   backend-dev  - Start only backend
echo   frontend-dev - Start only frontend
echo   clean        - Clean node_modules
goto end

:setup
echo Installing dependencies...
npm install
cd backend
npm install
cd ..
echo Setup complete! Don't forget to:
echo 1. Copy .env.example to .env (both frontend and backend)
echo 2. Fill in your environment variables
echo 3. Run 'dev.bat dev' to start both frontend and backend
goto end

:dev
echo Starting both frontend and backend...
echo Frontend will be at http://localhost:5173
echo Backend will be at http://localhost:3001
start cmd /c "cd backend && npm run dev"
timeout /t 2 /nobreak >nul
npm run dev
goto end

:backend-dev
cd backend
npm run dev
goto end

:frontend-dev
npm run dev
goto end

:clean
echo Cleaning node_modules...
rmdir /s /q node_modules 2>nul
rmdir /s /q backend\node_modules 2>nul
echo Clean complete!
goto end

:end
