# Security Verification Script for MedGen.AI
# Run this before pushing to GitHub

Write-Host ""
Write-Host "MedGen.AI - GitHub Security Verification" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$issues = 0

# Check 1: .env files
Write-Host "Checking for .env files..." -ForegroundColor Yellow
$envFiles = git ls-files | Select-String -Pattern "\.env$" | Where-Object { $_ -notmatch "\.env\.example" }
if ($envFiles) {
    Write-Host "  [ERROR] .env files found in repository!" -ForegroundColor Red
    $envFiles | ForEach-Object { Write-Host "     - $_" -ForegroundColor Red }
    $issues++
} else {
    Write-Host "  [OK] No .env files" -ForegroundColor Green
}

# Check 2: node_modules
Write-Host ""
Write-Host "Checking for node_modules..." -ForegroundColor Yellow
$nodeModules = git ls-files | Select-String -Pattern "node_modules"
if ($nodeModules) {
    Write-Host "  [ERROR] node_modules found in repository!" -ForegroundColor Red
    $issues++
} else {
    Write-Host "  [OK] No node_modules directory" -ForegroundColor Green
}

# Check 3: venv/virtualenv
Write-Host ""
Write-Host "Checking for Python virtual environments..." -ForegroundColor Yellow
$venvFiles = git ls-files | Select-String -Pattern "venv/|\.venv/|ENV/"
if ($venvFiles) {
    Write-Host "  [ERROR] Virtual environment found in repository!" -ForegroundColor Red
    $issues++
} else {
    Write-Host "  [OK] No virtual environment directories" -ForegroundColor Green
}

# Check 4: __pycache__
Write-Host ""
Write-Host "Checking for Python cache..." -ForegroundColor Yellow
$pycache = git ls-files | Select-String -Pattern "__pycache__"
if ($pycache) {
    Write-Host "  [ERROR] __pycache__ found in repository!" -ForegroundColor Red
    $issues++
} else {
    Write-Host "  [OK] No __pycache__ directories" -ForegroundColor Green
}

# Check 5: Build artifacts
Write-Host ""
Write-Host "Checking for build artifacts..." -ForegroundColor Yellow
$buildFiles = git ls-files | Select-String -Pattern "\.next/|/build/|/dist/"
if ($buildFiles) {
    Write-Host "  [ERROR] Build artifacts found in repository!" -ForegroundColor Red
    $issues++
} else {
    Write-Host "  [OK] No build artifacts" -ForegroundColor Green
}

# Check 6: .gitignore exists
Write-Host ""
Write-Host "Checking for .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    Write-Host "  [OK] .gitignore file exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] .gitignore file missing!" -ForegroundColor Red
    $issues++
}

# Summary
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
if ($issues -eq 0) {
    Write-Host "SUCCESS! Your repository is secure and ready to push!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Create repository on GitHub" -ForegroundColor White
    Write-Host "  2. git remote add origin https://github.com/YOUR_USERNAME/medgen-ai.git" -ForegroundColor White
    Write-Host "  3. git push -u origin master" -ForegroundColor White
} else {
    Write-Host "ATTENTION: $issues critical issue(s) found!" -ForegroundColor Red
    Write-Host "Please fix the errors above before pushing." -ForegroundColor Red
}

Write-Host ""
Write-Host "See PUSH_TO_GITHUB.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
