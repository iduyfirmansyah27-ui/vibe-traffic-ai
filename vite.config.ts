import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
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
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.PROD': isProduction,
      'import.meta.env.DEV': !isProduction,
      __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
    },
  };
});
