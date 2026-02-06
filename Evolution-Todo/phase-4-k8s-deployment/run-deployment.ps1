# PowerShell script to run the complete deployment
# This script sets up environment variables and runs the master deployment

Write-Host "🚀 Setting up Evolution Todo AI Chatbot Kubernetes Deployment" -ForegroundColor Green

# Set environment variables
$env:GROQ_API_KEY="your_groq_api_key_here"
$env:GROQ_DEFAULT_MODEL="openai/gpt-oss-20b"
$env:DATABASE_URL="your_neon_postgres_connection_string_here"
$env:BETTER_AUTH_SECRET="your_better_auth_secret_here"

Write-Host "✅ Environment variables set" -ForegroundColor Green

# Check if git bash is available
$gitBashPath = "C:\Program Files\Git\bin\bash.exe"
if (Test-Path $gitBashPath) {
    Write-Host "🔍 Git Bash found, executing master deployment script..." -ForegroundColor Yellow

    # Execute the bash script using git bash
    & $gitBashPath -c "cd '$PWD' && bash master-deploy.sh"
}
else {
    Write-Host "❌ Git Bash not found. Please install Git for Windows." -ForegroundColor Red
    Write-Host "Alternatively, run: bash master-deploy.sh from a Git Bash terminal" -ForegroundColor Yellow
    exit 1
}

Write-Host "🎉 Deployment process completed!" -ForegroundColor Green