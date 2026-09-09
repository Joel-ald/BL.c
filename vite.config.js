import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/BL.c/' : '/',
  plugins: [react()],
  build: {
    // Three.js is intentional here: it powers the live 3D birthday sign.
    chunkSizeWarningLimit: 850,
  },
})
