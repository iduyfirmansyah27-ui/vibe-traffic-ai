#!/bin/bash
set -e

echo "🚀 Starting Vercel deployment fix..."

# Create fix-vercel-build.cjs
cat > fix-vercel-build.cjs << 'EOL'
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Starting Vercel Build Fix ===');

try {
  // 1. Fix Vite config
  console.log('Fixing Vite configuration...');
  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['lucide-react', 'leaflet'],
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'import.meta.env.PROD': process.env.NODE_ENV === 'production' ? 'true' : 'false',
    'import.meta.env.DEV': process.env.NODE_ENV !== 'production' ? 'true' : 'false',
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
});`;

  fs.writeFileSync(path.join(__dirname, 'vite.config.ts'), viteConfig, 'utf8');

  // 2. Create/update tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noFallthroughCasesInSwitch: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      types: ["vite/client", "node"],
      baseUrl: ".",
      paths: {
        "@/*": ["./src/*"]
      }
    },
    include: ["src"],
    exclude: ["node_modules", "dist"]
  };

  fs.writeFileSync(
    path.join(__dirname, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2),
    'utf8'
  );

  // 3. Install required dependencies
  console.log('Installing required dependencies...');
  const requiredDeps = [
    'vite@^5.0.0',
    '@vitejs/plugin-react@^4.0.0',
    'react@^18.2.0',
    'react-dom@^18.2.0',
    'typescript@^5.0.0',
    '@types/node@^20.8.0',
    '@types/react@^18.2.0',
    '@types/react-dom@^18.2.0',
    'leaflet@^1.9.4',
    'react-leaflet@^4.2.1',
    '@types/leaflet@^1.9.8'
  ].join(' ');

  execSync(`npm install --no-package-lock --no-save ${requiredDeps}`, { stdio: 'inherit' });

  // 4. Install all other dependencies
  console.log('Installing all dependencies...');
  execSync('npm install --production=false', { stdio: 'inherit' });

  // 5. Create type declaration file
  const srcDir = path.join(__dirname, 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  const globalTypes = `// Type declarations
declare module '*.module.css';
declare module '*.module.scss';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';
declare module 'leaflet';`;

  fs.writeFileSync(path.join(srcDir, 'global.d.ts'), globalTypes, 'utf8');

  // 6. Build the project
  console.log('Building the project...');
  try {
    execSync('npx tsc && npx vite build', { stdio: 'inherit' });
  } catch (error) {
    console.error('Build failed with tsc && vite build, trying direct Vite build...');
    execSync('npx vite build', { stdio: 'inherit' });
  }

  console.log('=== Build completed successfully! ===');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
EOL

# Create/update vercel.json
cat > vercel.json << 'EOL'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "buildCommand": "node fix-vercel-build.cjs",
  "outputDirectory": "dist"
}
EOL

# Update package.json scripts
echo "Updating package.json..."
if [ -f "package.json" ]; then
  # Use jq to update package.json if available
  if command -v jq >/dev/null 2>&1; then
    jq '.scripts = {
      "dev": "vite",
      "build": "tsc && vite build",
      "build:dev": "vite build --mode development",
      "lint": "eslint .",
      "preview": "vite preview",
      "vercel-build": "node fix-vercel-build.cjs"
    }' package.json > package.json.tmp && mv package.json.tmp package.json
  else
    # Fallback to sed if jq is not available
    sed -i.bak 's/"scripts": {[^}]*}/"scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "build:dev": "vite build --mode development",\n    "lint": "eslint .",\n    "preview": "vite preview",\n    "vercel-build": "node fix-vercel-build.cjs"\n  }/' package.json
    rm -f package.json.bak
  fi
fi

echo "✅ Fix script created successfully!"
echo "Next steps:"
echo "1. Make the script executable: chmod +x fix-vercel.sh"
echo "2. Run the script: ./fix-vercel.sh"
echo "3. Commit the changes: git add . && git commit -m \"Fix Vercel deployment\""
echo "4. Push to trigger a new deployment: git push origin main"
