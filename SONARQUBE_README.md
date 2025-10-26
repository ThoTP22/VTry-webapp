# 🔍 SonarQube CI/CD Integration

Tự động scan code quality mỗi lần push với SonarQube Cloud.

## 🚀 Quick Setup

### 1. Cài đặt SonarCloud Token
```bash
# GitHub Repository → Settings → Secrets and variables → Actions
# Add new secret: SONAR_TOKEN = your_sonarcloud_token
```

### 2. Push Code để Trigger Analysis
```bash
git add .
git commit -m "feat: add SonarQube CI/CD"
git push origin main
```

### 3. Kiểm tra Results
- **GitHub Actions**: Repository → Actions tab
- **SonarCloud**: [Project Dashboard](https://sonarcloud.io/project/overview?id=ThoTP22_VTry-webapp)

## 📁 Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/sonarcloud.yml` | GitHub Actions workflow |
| `sonar-project.properties` | SonarQube configuration |
| `run-sonar-analysis.sh` | Local analysis (Linux/Mac) |
| `run-sonar-analysis.ps1` | Local analysis (Windows) |
| `SONARCLOUD_SETUP.md` | Detailed setup guide |

## 🔧 Local Analysis

### Windows (PowerShell):
```powershell
# Set token
$env:SONAR_TOKEN = "your_sonarcloud_token"

# Run analysis
.\run-sonar-analysis.ps1
```

### Linux/Mac (Bash):
```bash
# Set token
export SONAR_TOKEN=your_sonarcloud_token

# Run analysis  
chmod +x run-sonar-analysis.sh
./run-sonar-analysis.sh
```

## 📊 Quality Metrics

Workflow sẽ phân tích:
- ✅ **Code Quality** (bugs, code smells)
- 🔒 **Security** (vulnerabilities, hotspots)  
- 📈 **Coverage** (test coverage reports)
- 🔄 **Duplications** (code duplicates)
- 📏 **Complexity** (cognitive complexity)

## 🎯 Next Steps

1. **Xem detailed setup**: `SONARCLOUD_SETUP.md`
2. **Configure Quality Gate** trên SonarCloud dashboard
3. **Add branch protection rules** để block merge nếu quality gate fail
4. **Fix code issues** được phát hiện trong analysis

---

**📖 Detailed Guide**: See `SONARCLOUD_SETUP.md` for complete instructions.