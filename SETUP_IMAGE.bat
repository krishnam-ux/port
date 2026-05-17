@echo off
REM =================================================================
REM Portfolio Image Setup Helper
REM This script helps you add portrait.jpg to your portfolio
REM =================================================================

echo.
echo ===== PORTFOLIO IMAGE SETUP HELPER =====
echo.
echo This script will:
echo - Show you the assets folder
echo - Help you add your portrait image
echo.

REM Get the portfolio path
set "PORTFOLIO_PATH=c:\Users\krish\Documents\My\portfolio"
set "ASSETS_PATH=%PORTFOLIO_PATH%\assets"

REM Check if assets folder exists
if not exist "%ASSETS_PATH%" (
    echo Creating assets folder...
    mkdir "%ASSETS_PATH%"
    echo ✓ Assets folder created!
)

echo.
echo STEP 1: Opening Assets Folder
echo Path: %ASSETS_PATH%
echo.
start explorer "%ASSETS_PATH%"

echo.
echo STEP 2: Now do ONE of these:
echo.
echo Option A - Drag & Drop:
echo   1. Find your portrait image file
echo   2. Drag it into the File Explorer window that just opened
echo   3. Rename the file to: portrait.jpg
echo   4. Done!
echo.
echo Option B - Copy & Paste:
echo   1. Find your portrait image file
echo   2. Right-click → Copy
echo   3. Go to the File Explorer window
echo   4. Right-click → Paste
echo   5. Rename to: portrait.jpg
echo.
echo.
echo STEP 3: Refresh your portfolio in browser
echo   Press: Ctrl+F5 (to clear cache)
echo   Your image should now appear with purple glow!
echo.
echo.
pause
