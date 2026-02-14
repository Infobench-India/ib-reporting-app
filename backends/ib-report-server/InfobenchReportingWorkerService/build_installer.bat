@echo off
cd /d "%~dp0"
echo Cleaning old publish output...
if exist PublishOutput rd /s /q PublishOutput
echo Building and Publishing the application...
dotnet publish "InfobenchReportingWorkerService.csproj" -c Release -r win-x64 --self-contained true -o PublishOutput

if %errorlevel% neq 0 (
    echo Publish failed!
    pause
    exit /b %errorlevel%
)

echo.
echo Compiling Installer with Inno Setup...
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" "intaller.iss"

if %errorlevel% neq 0 (
    echo Installer compilation failed!
    pause
    exit /b %errorlevel%
)

echo.
echo Installer created successfully in Output directory.
pause
