@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM OPEN ASSETS FOLDER & COPY IMAGE
REM ============================================================

set "PORTFOLIO_PATH=c:\Users\krish\Documents\My\portfolio"
set "ASSETS_PATH=%PORTFOLIO_PATH%\assets"

REM Create assets folder if it doesn't exist
if not exist "%ASSETS_PATH%" mkdir "%ASSETS_PATH%"

REM Open the assets folder
explorer "%ASSETS_PATH%"

echo.
echo ============================================================
echo PORTFOLIO IMAGE SETUP - QUICK GUIDE
echo ============================================================
echo.
echo The Assets Folder has opened in File Explorer
echo.
echo WHAT TO DO NOW:
echo ============================================================
echo 1. Find your portrait image file on your computer
echo 2. DRAG IT into the File Explorer window that just opened
echo    (OR Copy-Paste it there)
echo 3. RIGHT-CLICK the image → RENAME
echo 4. Change name to exactly: portrait.jpg
echo 5. Go back to your browser
echo 6. Press: Ctrl+F5 (to refresh with no cache)
echo 7. Your portrait will appear with PURPLE GLOW! ✨
echo.
echo ============================================================
echo THAT'S IT! Your portfolio will be complete! 💜
echo ============================================================
echo.
pause
