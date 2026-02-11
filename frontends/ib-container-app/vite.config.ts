import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'ib_container_app',
      remotes: {
        // Remote entry for ib-analytics-app (ensure ib-analytics-app exposes a remoteEntry)
        ib_analytics_app: 'http://localhost:5003/assets/remoteEntry.js'
      },
      exposes: {
        './Auth': './src/auth/index.ts'
      },
      shared: ['react', 'react-dom']
    })
  ],
  server: {
    port: 5000,
    host: true
  }
})
