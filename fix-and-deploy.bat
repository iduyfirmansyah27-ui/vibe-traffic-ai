@echo off
echo Setting execution policy...
PowerShell -Command "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"

echo Installing required type definitions...
call npm install --save-dev @types/node @types/leaflet @types/leaflet-routing-machine @types/geojson

if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies. Please check your internet connection and try again.
    pause
    exit /b %ERRORLEVEL%
)

echo Building the project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed. Please fix the errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo Build successful! Committing changes...
call git add .
call git commit -m "fix: resolve TypeScript and build issues"
call git push

echo Deployment to Vercel should start automatically.
echo Check your Vercel dashboard for deployment status.
pause
