const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Starting Vercel Build (CommonJS) ===');

// Fix Vite config
console.log('Fixing Vite configuration...');
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
const fixedViteConfig = `import { defineConfig } from 'vite';
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
  server: {
    port: 3000,
    open: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'import.meta.env.PROD': process.env.NODE_ENV === 'production' ? 'true' : 'false',
    'import.meta.env.DEV': process.env.NODE_ENV !== 'production' ? 'true' : 'false',
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
});`;

try {
  // Write the fixed Vite config
  fs.writeFileSync(viteConfigPath, fixedViteConfig, 'utf8');
  
  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install --production=false', { stdio: 'inherit' });

  // Build the project
  console.log('Building the project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('=== Build completed successfully! ===');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
