import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
    cors: true,
    allowedHosts: true
  },
  plugins: [react({ jsxRuntime: 'automatic' })],
})
