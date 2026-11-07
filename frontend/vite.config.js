import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    port:3000,
    // Fail loudly instead of silently moving to another port: GitHub login redirects
    // back to CLIENT_BASE_URL (http://localhost:3000), so the port must not change.
    strictPort:true,
    proxy:{
      "/api":{
        target:"http://localhost:5000"
      }
    }
  }
})
