@echo off
echo Setting up Vibe Traffic AI for Vercel deployment...
echo.

echo Step 1: Installing Node.js dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install Node.js dependencies.
    pause
    exit /b 1
)

echo.
echo Step 2: Installing TypeScript and type definitions...
call npm install --save-dev typescript @types/node @types/react @types/react-dom

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install TypeScript and type definitions.
    pause
    exit /b 1
)

echo.
echo Step 3: Installing Vite and React plugins...
call npm install --save-dev @vitejs/plugin-react vite-plugin-svgr

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install Vite and React plugins.
    pause
    exit /b 1
)

echo.
echo Step 4: Installing production dependencies...
call npm install react react-dom lucide-react

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install production dependencies.
    pause
    exit /b 1
)

echo.
echo Step 5: Building the project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to build the project.
    pause
    exit /b 1
)

echo.
echo Setup completed successfully!
echo You can now deploy to Vercel using 'vercel' or 'vercel --prod'
pause
