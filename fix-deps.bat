@echo off
echo Installing required dependencies...

:: Install development dependencies
call npm install -D @vitejs/plugin-react @types/node @types/react @types/react-dom

:: Install production dependencies
call npm install

echo.
echo Creating type declaration file...
echo. > src/vite-env.d.ts

echo.
echo Fixing TypeScript configuration...

:: Update tsconfig.app.json
(
echo {
echo   "extends": "./tsconfig.json",
echo   "compilerOptions": {
echo     "composite": true,
echo     "outDir": "./dist",
echo     "types": ["vite/client"],
echo     "jsx": "react-jsx",
echo     "module": "ESNext",
echo     "moduleResolution": "bundler",
echo     "resolveJsonModule": true,
echo     "isolatedModules": true,
echo     "noEmit": true,
echo     "jsxImportSource": "react"
echo   },
echo   "include": ["src"],
echo   "exclude": ["node_modules", "dist"]
echo }
) > tsconfig.app.json

echo.
echo Creating Vite environment type declarations...
(
echo '/// <reference types="vite/client" />'
echo ''
echo 'interface ImportMetaEnv {'
echo '  readonly VITE_APP_TITLE: string;'
echo '  // more env variables...'
echo '}'
echo ''
echo 'interface ImportMeta {'
echo '  readonly env: ImportMetaEnv;'
echo '}'
) > src/vite-env.d.ts

echo.
echo Fixing package.json scripts...

:: Update package.json scripts
(
echo {
  "name": "vite_react_shadcn_ts",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
) > package.json

echo.
echo Running type checking...
call npx tsc --noEmit

echo.
echo Setup completed! You can now run:
echo - npm run dev    # Start development server
echo - npm run build  # Build for production
echo - npm run preview  # Preview production build

pause
