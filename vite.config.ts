import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['three', 'cannon-es', 'howler', '@supabase/supabase-js'],
  },
  server: {
    port: 5173,
    host: true,
  },
});
