import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    emptyOutDir: false, copyPublicDir: false,
    lib: { entry: 'src/sol/widget/loader.tsx', name: 'Sol', formats: ['iife'], fileName: () => 'sol.js' },
  },
});
