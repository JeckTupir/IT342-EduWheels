import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [react()],

  // base: process.env.VITE_BASE_PATH || "/IT342-EduWheels",
})
