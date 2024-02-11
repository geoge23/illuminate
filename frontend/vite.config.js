import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  //change compiled output to /public
  build: {
    outDir: '../backend/public',
  },
})
