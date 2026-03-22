import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  root: '.',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
