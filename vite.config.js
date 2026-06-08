import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset paths relative so the build works both locally
// and when served from a GitHub Pages project subpath.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5193, host: true },
})
