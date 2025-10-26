import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Vercel environment variables
const isProduction = import.meta.env.PROD;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
// Vite plugins configuration
const plugins = [
  react({
    // Enable SWC for faster builds
    jsxImportSource: 'react',
    tsDecorators: true,
  }),
  svgr({
    // SVGR options: https://react-svgr.com/docs/options/
    svgrOptions: {
      icon: true,
      svgProps: {
        className: 'svg-icon',
      },
    },
  }),
  splitVendorChunkPlugin(),
];

export default defineConfig({
  plugins,
  base: isProduction ? '/' : '/',
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src')
      },
      // Add other aliases here if needed
    ],
    // Improve module resolution
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    // Enable HMR (Hot Module Replacement)
    hmr: {
      overlay: true,
    },
    // Enable CORS for development
    cors: true,
    // Proxy API requests if needed
    proxy: {
      // Example:
      // '/api': {
      //   target: 'http://your-api-url',
      //   changeOrigin: true,
      //   secure: false,
      // },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    minify: isProduction ? 'terser' : false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group dependencies into chunks
            const module = id.split('node_modules/').pop().split('/')[0];
            if (module.includes('react') || module.includes('react-dom')) {
              return 'vendor-react';
            }
            if (module.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            return 'vendor-other';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
      },
    },
    // Enable brotli compression for better performance
    brotliSize: true,
    // Enable gzip compression for better performance
    reportCompressedSize: true,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Enable source maps in production for better error tracking
    sourcemap: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
    headers: {
      'Cache-Control': 'public, max-age=600',
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      // Add other frequently used dependencies here
    ],
    esbuildOptions: {
      target: 'es2020',
      // Add global names to exclude from bundling
      define: {
        global: 'globalThis',
      },
    },
    // Enable dependency pre-bundling
    force: true,
  },
  // Improve CSS handling
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    preprocessorOptions: {
      scss: {
        // Add global SCSS variables/mixins if needed
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
  // Environment variables
  define: {
    'process.env': {},
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  }
});
