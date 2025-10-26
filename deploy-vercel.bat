@echo off
setlocal enabledelayedexpansion

echo [1/6] 🚀 Starting Vercel deployment process...

:: Check for Node.js and npm
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ and try again.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install Node.js 16+ which includes npm.
    pause
    exit /b 1
)

:: Install Vercel CLI if not installed
echo [2/6] 🔍 Checking for Vercel CLI...
vercel --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing Vercel CLI...
    call npm install -g vercel@latest
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install Vercel CLI
        pause
        exit /b 1
    )
)

:: Install project dependencies
echo [3/6] 🔧 Installing project dependencies...
call npm install --production=false
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install project dependencies
    pause
    exit /b 1
)
(
echo {
echo   "version": 2,
echo   "builds": [
echo     {
echo       "src": "package.json",
echo       "use": "@vercel/static-build",
echo       "config": {
echo         "distDir": "dist"
echo       }
echo     }
echo   ],
echo   "routes": [
echo     {
echo       "src": "/.*",
echo       "dest": "/index.html"
echo     }
echo   ]
echo }
) > vercel.json

:: Build the project
echo.
echo Step 3: Building the project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed. Please check the error messages above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Deployment setup completed successfully!
echo You can now deploy to Vercel using: vercel --prod
pause
