@echo off
REM Batch script to run the complete deployment
REM This script sets up environment variables and runs the master deployment

echo 🚀 Setting up Evolution Todo AI Chatbot Kubernetes Deployment

REM Set environment variables
set GROQ_API_KEY=your_groq_api_key_here
set GROQ_DEFAULT_MODEL=openai/gpt-oss-20b
set DATABASE_URL=your_neon_postgres_connection_string_here
set BETTER_AUTH_SECRET=your_better_auth_secret_here

echo ✅ Environment variables set

REM Check if git bash is available and run the script
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git not found. Please install Git for Windows.
    echo Run this from Git Bash: bash master-deploy.sh
    pause
    exit /b 1
)

echo 🔍 Running master deployment script...
bash master-deploy.sh

echo 🎉 Deployment process completed!
pause