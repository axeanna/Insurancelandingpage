@echo off
title SEO / AEO / GEO Dashboard - annaprudential.com
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js is not installed or not on PATH.
  echo   Install it from https://nodejs.org and run this again.
  echo.
  pause
  exit /b 1
)

echo.
echo   Starting the dashboard... your browser will open automatically.
echo   Keep this window open while you use it. Close it to stop.
echo.
node seo-tool\server.mjs
pause
