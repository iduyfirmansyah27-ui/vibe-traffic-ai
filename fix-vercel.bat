@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Vercel deployment fix...

:: Create fix-vercel-build.cjs
echo Creating fix-vercel-build.cjs...
(
echo const { execSync } = require('child_process');
echo const fs = require('fs');
echo const path = require('path');
echo 
echo console.log('=== Starting Vercel Build Fix ===');
echo 
echo try {
echo   // 1. Fix Vite config
  echo   console.log('Fixing Vite configuration...');
  echo   const viteConfig = `import { defineConfig } from 'vite';
  echo import react from '@vitejs/plugin-react';
  echo import { fileURLToPath } from 'url';
  echo import { dirname, resolve } from 'path';
  echo 
  echo const __filename = fileURLToPath(import.meta.url);
  echo const __dirname = dirname(__filename);
  echo 
  echo export default defineConfig({
  echo   plugins: [react()],
  echo   resolve: {
  echo     alias: {
  echo       '@': resolve(__dirname, './src'),
  echo     },
  echo   },
  echo   build: {
  echo     outDir: 'dist',
  echo     sourcemap: process.env.NODE_ENV !== 'production',
  echo     rollupOptions: {
  echo       output: {
  echo         manualChunks: {
  echo           react: ['react', 'react-dom'],
  echo           vendor: ['lucide-react', 'leaflet'],
  echo         },
  echo       },
  echo     },
  echo   },
  echo   define: {
  echo     'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  echo     'import.meta.env.PROD': process.env.NODE_ENV === 'production' ? 'true' : 'false',
  echo     'import.meta.env.DEV': process.env.NODE_ENV !== 'production' ? 'true' : 'false',
  echo     __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  echo   },
  echo });`;
  echo 
  echo   fs.writeFileSync(path.join(__dirname, 'vite.config.ts'), viteConfig, 'utf8');
  echo 
  echo   // 2. Create/update tsconfig.json
  echo   const tsConfig = {
  echo     compilerOptions: {
  echo       target: "ES2020",
  echo       useDefineForClassFields: true,
  echo       lib: ["ES2020", "DOM", "DOM.Iterable"],
  echo       module: "ESNext",
  echo       skipLibCheck: true,
  echo       moduleResolution: "bundler",
  echo       allowImportingTsExtensions: true,
  echo       resolveJsonModule: true,
  echo       isolatedModules: true,
  echo       noEmit: true,
  echo       jsx: "react-jsx",
  echo       strict: true,
  echo       noUnusedLocals: false,
  echo       noUnusedParameters: false,
  echo       noFallthroughCasesInSwitch: true,
  echo       esModuleInterop: true,
  echo       forceConsistentCasingInFileNames: true,
  echo       types: ["vite/client", "node"],
  echo       baseUrl: ".",
  echo       paths: {
  echo         "@/*": ["./src/*"]
  echo       }
  echo     },
  echo     include: ["src"],
  echo     exclude: ["node_modules", "dist"]
  echo   };
  echo 
  echo   fs.writeFileSync(
  echo     path.join(__dirname, 'tsconfig.json'),
  echo     JSON.stringify(tsConfig, null, 2),
  echo     'utf8'
  echo   );
  echo 
  echo   // 3. Install required dependencies
  echo   console.log('Installing required dependencies...');
  echo   const requiredDeps = [
  echo     'vite@^5.0.0',
  echo     '@vitejs/plugin-react@^4.0.0',
  echo     'react@^18.2.0',
  echo     'react-dom@^18.2.0',
  echo     'typescript@^5.0.0',
  echo     '@types/node@^20.8.0',
  echo     '@types/react@^18.2.0',
  echo     '@types/react-dom@^18.2.0',
  echo     'leaflet@^1.9.4',
  echo     'react-leaflet@^4.2.1',
  echo     '@types/leaflet@^1.9.8'
  echo   ].join(' ');
  echo 
  echo   execSync(`npm install --no-package-lock --no-save ${requiredDeps}`, { stdio: 'inherit' });
  echo 
  echo   // 4. Install all other dependencies
  echo   console.log('Installing all dependencies...');
  echo   execSync('npm install --production=false', { stdio: 'inherit' });
  echo 
  echo   // 5. Create type declaration file
  echo   const srcDir = path.join(__dirname, 'src');
  echo   if (!fs.existsSync(srcDir)) {
  echo     fs.mkdirSync(srcDir, { recursive: true });
  echo   }
  echo 
  echo   const globalTypes = `// Type declarations
  echo declare module '*.module.css';
  echo declare module '*.module.scss';
  echo declare module '*.png';
  echo declare module '*.jpg';
  echo declare module '*.jpeg';
  echo declare module '*.svg';
  echo declare module '*.gif';
  echo declare module 'leaflet';`;
  echo 
  echo   fs.writeFileSync(path.join(srcDir, 'global.d.ts'), globalTypes, 'utf8');
  echo 
  echo   // 6. Build the project
  echo   console.log('Building the project...');
  echo   try {
  echo     execSync('npx tsc && npx vite build', { stdio: 'inherit' });
  echo   } catch (error) {
  echo     console.error('Build failed with tsc && vite build, trying direct Vite build...');
  echo     execSync('npx vite build', { stdio: 'inherit' });
  echo   }
  echo 
  echo   console.log('=== Build completed successfully! ===');
  echo   process.exit(0);
  echo } catch (error) {
  echo   console.error('Build failed:', error);
  echo   process.exit(1);
  echo }
) > fix-vercel-build.cjs

:: Create/update vercel.json
echo Creating/updating vercel.json...
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
echo       "src": "/(.*)",
echo       "dest": "/index.html"
echo     }
echo   ],
echo   "buildCommand": "node fix-vercel-build.cjs",
echo   "outputDirectory": "dist"
echo }
) > vercel.json

:: Update package.json
echo Updating package.json...
if exist package.json (
  powershell -Command "(Get-Content package.json | ConvertFrom-Json) | ForEach-Object { $_.scripts = @{
    'dev' = 'vite';
    'build' = 'tsc && vite build';
    'build:dev' = 'vite build --mode development';
    'lint' = 'eslint .';
    'preview' = 'vite preview';
    'vercel-build' = 'node fix-vercel-build.cjs';
  }} | ConvertTo-Json -Depth 10 | Set-Content -Path package.json"
)

echo ✅ Fix script completed successfully!
echo.
echo Next steps:
echo 1. Run the build command: npm run build
echo 2. Commit the changes: git add . && git commit -m "Fix Vercel deployment"
echo 3. Push to trigger a new deployment: git push origin main
echo.
pause
