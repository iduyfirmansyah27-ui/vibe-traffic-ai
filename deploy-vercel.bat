@echo off
echo Setting up Vite React TypeScript project for Vercel deployment...
echo.

:: Install required dependencies
echo Step 1: Installing required dependencies...
call npm install -D @vitejs/plugin-react @types/node

if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies. Please check your internet connection and try again.
    pause
    exit /b %ERRORLEVEL%
)

:: Create vercel.json
echo.
echo Step 2: Creating vercel.json configuration...
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
