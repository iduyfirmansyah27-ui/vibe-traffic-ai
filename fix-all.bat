@echo off
setlocal enabledelayedexpansion

echo [1/8] 🚀 Starting comprehensive fix process...

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

:: Clean up previous installations
echo [2/8] 🧹 Cleaning up...
if exist node_modules rmdir /s /q node_modules
if exist .vercel rmdir /s /q .vercel

:: Create/update tsconfig.json
echo [3/8] ⚙️  Creating tsconfig.json...
(
echo {
echo   "compilerOptions": {
echo     "target": "ES2020",
echo     "useDefineForClassFields": true,
echo     "lib": ["ES2020", "DOM", "DOM.Iterable"],
echo     "module": "ESNext",
echo     "skipLibCheck": true,
echo     "moduleResolution": "bundler",
echo     "allowImportingTsExtensions": true,
echo     "resolveJsonModule": true,
echo     "isolatedModules": true,
echo     "noEmit": true,
echo     "jsx": "react-jsx",
echo     "strict": true,
echo     "noUnusedLocals": true,
echo     "noUnusedParameters": true,
echo     "noFallthroughCasesInSwitch": true,
echo     "esModuleInterop": true,
echo     "forceConsistentCasingInFileNames": true,
echo     "types": ["vite/client", "node"],
echo     "baseUrl": ".",
echo     "paths": {
echo       "@/*": ["./src/*"]
echo     }
echo   },
echo   "include": ["src"],
echo   "exclude": ["node_modules", "dist"]
echo }
) > tsconfig.json

:: Create/update vite.config.ts
echo [4/8] ⚙️  Creating vite.config.ts...
(
echo import { defineConfig } from 'vite'
echo import react from '@vitejs/plugin-react'
echo import path from 'path'
echo 
echo export default defineConfig({
echo   plugins: [react()],
echo   resolve: {
echo     alias: {
echo       '@': path.resolve(__dirname, './src'),
echo     },
echo   },
echo   build: {
echo     outDir: 'dist',
echo     sourcemap: true
echo   },
echo   define: {
echo     'process.env': process.env
echo   }
echo })
) > vite.config.ts

:: Update package.json
echo [5/8] 📝 Updating package.json...
(
echo {
echo   "name": "vite-react-app",
echo   "private": true,
echo   "version": "0.0.0",
echo   "type": "module",
echo   "scripts": {
echo     "dev": "vite",
echo     "build": "tsc && vite build",
echo     "preview": "vite preview",
echo     "vercel-build": "vite build"
echo   },
echo   "dependencies": {
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0",
echo     "leaflet": "^1.9.4",
echo     "react-leaflet": "^4.2.1"
echo   },
echo   "devDependencies": {
echo     "@types/node": "^20.8.0",
echo     "@types/react": "^18.2.0",
echo     "@types/react-dom": "^18.2.0",
echo     "@vitejs/plugin-react": "^4.0.0",
echo     "typescript": "^5.0.0",
echo     "vite": "^5.0.0",
echo     "@types/leaflet": "^1.9.8"
echo   }
echo }
) > package.json

:: Install dependencies
echo [6/8] 📦 Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

:: Fix common TypeScript errors
echo [7/8] 🔧 Fixing common TypeScript errors...

:: Create src directory if it doesn't exist
if not exist src mkdir src

:: Fix React imports in components
for /r src %%f in (*.tsx) do (
    echo Fixing React import in %%~nxf
    powershell -Command "(Get-Content '%%f' -Raw) -replace 'import React[^;]*;', 'import React from ''react'';' | Set-Content '%%f' -NoNewline"
)

:: Add missing type declarations
if not exist src/globals.d.ts (
    echo // Type definitions for modules without types
    echo declare module '*.module.css';
    echo declare module '*.module.scss';
    echo declare module '*.png';
    echo declare module '*.jpg';
    echo declare module '*.jpeg';
    echo declare module '*.svg';
    echo declare module '*.gif';
) > src/globals.d.ts

:: Build the project
echo [8/8] 🔨 Building the project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ✅ All fixes applied successfully!
echo.
echo Next steps:
echo 1. Commit the changes: git add . && git commit -m "Fix TypeScript and build issues"
echo 2. Push to your repository: git push origin main
echo 3. The deployment to Vercel should now work automatically
echo.
pause
