@echo off
echo Installing required dependencies...

:: Install TypeScript and type definitions
call npm install --save-dev typescript @types/node @vitejs/plugin-react @types/react @types/react-dom

:: Install Vite and React plugin
call npm install --save-dev vite @vitejs/plugin-react

:: Install production dependencies
call npm install react react-dom lucide-react

echo.
echo Dependencies installed successfully!
echo Building the project...

:: Build the project
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Build completed successfully!
    echo You can now deploy to Vercel using 'vercel' or 'vercel --prod'
) else (
    echo.
    echo Build failed. Please check the error messages above.
)

pause
