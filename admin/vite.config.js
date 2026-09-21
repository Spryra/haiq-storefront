import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 4202,
    // Do NOT auto-open a browser tab here — the admin panel is restricted,
    // internal-staff tooling. It should only ever be reached by someone who
    // deliberately navigates to it, never popped up automatically just
    // because the dev server started (which is what was happening before).
    open: false,
    proxy: {
      '/v1': {
        target: 'http://localhost:4200',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
