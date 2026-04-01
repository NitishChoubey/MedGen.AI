@echo off
echo ================================
echo Patient Dashboard Installation
echo ================================
echo.

cd /d "%~dp0apps\web"

echo Installing lucide-react...
call npm install lucide-react

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================
    echo Installation Complete! ✓
    echo ================================
    echo.
    echo Next steps:
    echo 1. Run: npm run dev
    echo 2. Open: http://localhost:3000
    echo 3. Sign up as a patient
    echo 4. Access: http://localhost:3000/patient/dashboard
    echo.
    echo See PATIENT_DASHBOARD_COMPLETE.md for full documentation
    echo.
) else (
    echo.
    echo ================================
    echo Installation Failed!
    echo ================================
    echo Please run manually: npm install lucide-react
    echo.
)

pause
