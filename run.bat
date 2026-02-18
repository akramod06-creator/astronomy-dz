@echo off
setlocal
cd /d "%~dp0"

if /I "%~1"=="server" goto :server_mode

set "ENTRY=%~dp0index.html"
set "ENTRY_URL=file:///%ENTRY:\=/%"

echo Opening Astronomy DZ without local server...
echo.
echo Security note:
echo This mode uses browser flags to allow local ES Modules.
echo It launches in a separate local profile folder.
echo.

set "BROWSER="
for %%B in (
  "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
  "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
  "%LocalAppData%\Google\Chrome\Application\chrome.exe"
  "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
  "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
  "%LocalAppData%\Microsoft\Edge\Application\msedge.exe"
) do (
  if exist %%~B (
    set "BROWSER=%%~B"
    goto :launch_file_mode
  )
)

echo Chrome/Edge executable was not found.
echo Opening index.html with default browser.
start "" "%ENTRY%"
goto :eof

:launch_file_mode
set "PROFILE_DIR=%TEMP%\astronomy-dz-filemode"
if not exist "%PROFILE_DIR%" mkdir "%PROFILE_DIR%" >nul 2>nul
start "" "%BROWSER%" --user-data-dir="%PROFILE_DIR%" --allow-file-access-from-files --disable-web-security "%ENTRY_URL%"
goto :eof

:server_mode
echo Starting Astronomy DZ local app...

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 "%~dp0run-local.py"
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  python "%~dp0run-local.py"
  goto :eof
)

echo Python was not found. Install Python 3, then run this file again.
pause
