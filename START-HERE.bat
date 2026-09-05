@echo off
title Sri Annamayya Cars - Launcher
echo ============================================
echo   Starting Sri Annamayya Cars
echo ============================================
echo.

REM 1) MongoDB database server
echo Starting MongoDB...
start "MongoDB" cmd /k ""C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "C:\data\db""
timeout /t 4 /nobreak >nul

REM 2) Backend API
echo Starting Backend API (port 5000)...
start "Annamayya Cars - Backend" cmd /k "cd /d "%~dp0be" && npm start"
timeout /t 3 /nobreak >nul

REM 3) Frontend website
echo Starting Website (port 3000)...
start "Annamayya Cars - Website" cmd /k "cd /d "%~dp0fe" && npm run dev"
timeout /t 4 /nobreak >nul

REM 4) Admin app (separate)
echo Starting Admin app (port 4000)...
start "Annamayya Cars - Admin" cmd /k "cd /d "%~dp0admin" && npm run dev"
timeout /t 6 /nobreak >nul

echo.
echo ============================================
echo   Website : http://localhost:3000
echo   Admin   : http://localhost:4000   (owner only)
echo ============================================
echo Opening both in your browser...
start http://localhost:3000
start http://localhost:4000
echo.
echo You can close THIS window. Keep the other 4 windows open while using the site.
pause
