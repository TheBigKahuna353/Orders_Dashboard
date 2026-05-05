import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: 'https://thebigkahuna353.github.io/Orders_Dashboard/',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 2000, // increase chunk size limit to avoid warnings (can be optimized later)
    sourcemap: true,
  }
})
