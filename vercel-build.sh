#!/bin/bash

# Exit on error
set -e

echo "=== Starting Vercel Build ==="

# Install dependencies
echo "Installing dependencies..."
npm install

# Create a clean vite.config.js
echo "Creating vite.config.js..."
cat > vite.config.js << 'EOL'
import { defineConfig } from 'vite';
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
    'import.meta.env.PROD': process.env.NODE_ENV === 'production',
    'import.meta.env.DEV': process.env.NODE_ENV !== 'production',
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
});
EOL

# Build the project
echo "Building the project..."
NODE_ENV=production npm run build

echo "=== Build completed successfully! ==="
