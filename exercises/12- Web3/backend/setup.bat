@echo off
echo 🚀 Setting up Faucet DApp Backend...

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your actual values before starting the server!
    echo    - PRIVATE_KEY: Your Ethereum private key
    echo    - JWT_SECRET: A long, random string
) else (
    echo ✅ .env file already exists
)

REM Install dependencies if needed
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your configuration
echo 2. Run 'npm run dev' to start the development server
echo 3. Backend will be available at http://localhost:3001
echo.
echo 📚 API Documentation available in README.md

pause
