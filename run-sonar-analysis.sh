#!/bin/bash

# 🔍 Local SonarQube Analysis Script
# Run SonarQube analysis locally before pushing to GitHub

echo "🚀 Starting Local SonarQube Analysis..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'  
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if sonar-scanner is installed
if ! command -v sonar-scanner &> /dev/null; then
    echo -e "${RED}❌ sonar-scanner not found!${NC}"
    echo "📦 Please install SonarQube Scanner:"
    echo "   npm install -g sonarqube-scanner"
    echo "   or download from: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/"
    exit 1
fi

# Check if sonar-project.properties exists
if [ ! -f "sonar-project.properties" ]; then
    echo -e "${RED}❌ sonar-project.properties not found!${NC}"
    echo "📄 Please create sonar-project.properties file"
    exit 1
fi

# Check for environment variables
if [ -z "$SONAR_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  SONAR_TOKEN not set${NC}"
    echo "🔑 Please set your SonarCloud token:"
    echo "   export SONAR_TOKEN=your_sonarcloud_token"
    echo "   or create .env file with SONAR_TOKEN=your_token"
    
    # Try to load from .env file
    if [ -f ".env" ]; then
        export $(cat .env | xargs)
        echo -e "${GREEN}✅ Loaded environment from .env file${NC}"
    else
        exit 1
    fi
fi

# Install dependencies if not already installed
echo "📦 Installing dependencies..."

if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm ci && cd ..
fi

if [ -d "frontend-new" ] && [ -f "frontend-new/package.json" ]; then
    echo "📦 Installing frontend dependencies..."  
    cd frontend-new && npm ci && cd ..
fi

# Run tests with coverage (optional)
echo "🧪 Running tests with coverage..."

if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    echo "🧪 Running backend tests..."
    cd backend
    if npm run test -- --coverage --watchAll=false 2>/dev/null; then
        echo -e "${GREEN}✅ Backend tests completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend tests failed or not available${NC}"
    fi
    cd ..
fi

if [ -d "frontend-new" ] && [ -f "frontend-new/package.json" ]; then
    echo "🧪 Running frontend tests..."
    cd frontend-new
    if npm run test -- --coverage --watchAll=false 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend tests completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend tests failed or not available${NC}"
    fi
    cd ..
fi

# Run SonarQube analysis
echo "🔍 Running SonarQube analysis..."
sonar-scanner \
    -Dsonar.host.url=https://sonarcloud.io \
    -Dsonar.login=$SONAR_TOKEN

# Check exit code
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SonarQube analysis completed successfully!${NC}"
    echo "📊 Check results at: https://sonarcloud.io/project/overview?id=ThoTP22_VTry-webapp"
else
    echo -e "${RED}❌ SonarQube analysis failed!${NC}"
    echo "📋 Please check the logs above for errors"
    exit 1
fi

echo "🎉 Local analysis complete!"