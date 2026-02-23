@echo off
setlocal enabledelayedexpansion

REM Save the root directory
set "ROOT_DIR=%CD%"

:: Path to Inno Setup Compiler
set ISCC="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"

:: Compile each installer script
echo Compiling %ROOT_DIR%\deploy\backends\ib-auth-service\installer.iss...
%ISCC% "%ROOT_DIR%\deploy\backends\ib-auth-service\installer.iss"

echo Compiling %ROOT_DIR%\deploy\backends\ib-sql-report-server\installer.iss...
%ISCC% "%ROOT_DIR%\deploy\backends\ib-sql-report-server\installer.iss"

echo Compiling %ROOT_DIR%\deploy\frontends\ib-container-ui\ui.iss...
%ISCC% "%ROOT_DIR%\deploy\frontends\ib-container-ui\ui.iss"

echo Compiling %ROOT_DIR%\deploy\frontends\ib-analytics-ui\ui.iss...
%ISCC% "%ROOT_DIR%\deploy\frontends\ib-analytics-ui\ui.iss"

echo.
echo ✅ All installers compiled successfully!
echo Setup files are in: %ROOT_DIR%\deploy\installers
pause
