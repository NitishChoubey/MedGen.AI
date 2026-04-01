@echo off
REM Create patient dashboard directory structure
cd /d D:\MedGen.AI\apps\web\app

echo Creating directories...

mkdir patient\dashboard 2>nul
mkdir patient\profile 2>nul
mkdir patient\medical-records 2>nul
mkdir patient\upload 2>nul
mkdir patient\analyses 2>nul
mkdir patient\appointments 2>nul
mkdir patient\settings 2>nul
mkdir api\patient 2>nul

echo.
echo Directory structure created!
echo.
echo === Verification ===
echo.
echo Patient Dashboard Directories:
dir /b patient

echo.
echo API Directories:
dir /b api

echo.
echo Full structure:
tree patient /f
echo.
tree api /f
