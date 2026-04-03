@echo off
echo ========================================
echo  Prisma Migration Setup
echo ========================================
echo.

cd /d D:\MedGen.AI\apps\web

echo Step 1: Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo.

echo Step 2: Creating Migration...
call npx prisma migrate dev --name add_appointments
if %errorlevel% neq 0 (
    echo ERROR: Migration failed
    pause
    exit /b 1
)
echo.

echo ========================================
echo  SUCCESS! Migration completed
echo ========================================
echo.
echo Next steps:
echo 1. Start your dev server: npm run dev
echo 2. Test the appointment booking feature
echo.
echo For production deployment, run:
echo   npx prisma migrate deploy
echo.
pause
