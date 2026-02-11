import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Asegura que process.env.API_KEY se reemplace correctamente en el bundle final
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});