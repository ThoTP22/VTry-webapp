# 🔍 Local SonarQube Analysis Script for Windows PowerShell
# Run SonarQube analysis locally before pushing to GitHub

Write-Host "🚀 Starting Local SonarQube Analysis..." -ForegroundColor Cyan

# Check if sonar-scanner is installed
try {
    $null = Get-Command sonar-scanner -ErrorAction Stop
    Write-Host "✅ SonarQube Scanner found" -ForegroundColor Green
} catch {
    Write-Host "❌ sonar-scanner not found!" -ForegroundColor Red
    Write-Host "📦 Please install SonarQube Scanner:" -ForegroundColor Yellow
    Write-Host "   npm install -g sonarqube-scanner" -ForegroundColor Yellow
    Write-Host "   or download from: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/" -ForegroundColor Yellow
    exit 1
}

# Check if sonar-project.properties exists
if (-not (Test-Path "sonar-project.properties")) {
    Write-Host "❌ sonar-project.properties not found!" -ForegroundColor Red
    Write-Host "📄 Please create sonar-project.properties file" -ForegroundColor Yellow
    exit 1
}

# Check for SONAR_TOKEN environment variable
$sonarToken = $env:SONAR_TOKEN
if (-not $sonarToken) {
    Write-Host "⚠️  SONAR_TOKEN not set" -ForegroundColor Yellow
    Write-Host "🔑 Please set your SonarCloud token:" -ForegroundColor Yellow
    Write-Host "   `$env:SONAR_TOKEN = 'your_sonarcloud_token'" -ForegroundColor Yellow
    
    # Try to load from .env file
    if (Test-Path ".env") {
        Write-Host "📄 Loading environment from .env file..." -ForegroundColor Cyan
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
            }
        }
        $sonarToken = $env:SONAR_TOKEN
        if ($sonarToken) {
            Write-Host "✅ Loaded SONAR_TOKEN from .env file" -ForegroundColor Green
        }
    }
    
    if (-not $sonarToken) {
        Write-Host "❌ SONAR_TOKEN still not found!" -ForegroundColor Red
        exit 1
    }
}

# Install dependencies if not already installed
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan

if ((Test-Path "backend") -and (Test-Path "backend/package.json")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
    Push-Location backend
    try {
        npm ci
        Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Backend dependency installation failed" -ForegroundColor Yellow
    }
    Pop-Location
}

if ((Test-Path "frontend-new") -and (Test-Path "frontend-new/package.json")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
    Push-Location frontend-new
    try {
        npm ci
        Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Frontend dependency installation failed" -ForegroundColor Yellow
    }
    Pop-Location
}

# Run tests with coverage (optional)
Write-Host "🧪 Running tests with coverage..." -ForegroundColor Cyan

if ((Test-Path "backend") -and (Test-Path "backend/package.json")) {
    Write-Host "🧪 Running backend tests..." -ForegroundColor Cyan
    Push-Location backend
    try {
        npm run test -- --coverage --watchAll=false
        Write-Host "✅ Backend tests completed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Backend tests failed or not available" -ForegroundColor Yellow
    }
    Pop-Location
}

if ((Test-Path "frontend-new") -and (Test-Path "frontend-new/package.json")) {
    Write-Host "🧪 Running frontend tests..." -ForegroundColor Cyan
    Push-Location frontend-new
    try {
        npm run test -- --coverage --watchAll=false
        Write-Host "✅ Frontend tests completed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Frontend tests failed or not available" -ForegroundColor Yellow
    }
    Pop-Location
}

# Run SonarQube analysis
Write-Host "🔍 Running SonarQube analysis..." -ForegroundColor Cyan

try {
    sonar-scanner `
        "-Dsonar.host.url=https://sonarcloud.io" `
        "-Dsonar.login=$sonarToken"
    
    Write-Host "✅ SonarQube analysis completed successfully!" -ForegroundColor Green
    Write-Host "📊 Check results at: https://sonarcloud.io/project/overview?id=ThoTP22_VTry-webapp" -ForegroundColor Cyan
} catch {
    Write-Host "❌ SonarQube analysis failed!" -ForegroundColor Red
    Write-Host "📋 Please check the logs above for errors" -ForegroundColor Yellow
    exit 1
}

Write-Host "🎉 Local analysis complete!" -ForegroundColor Green