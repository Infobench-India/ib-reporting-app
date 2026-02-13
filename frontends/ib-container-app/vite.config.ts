import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'ib_container_app',
      remotes: {
        // Remote entry for ib-analytics-app
        ib_analytics_app: 'http://192.168.2.20:5003/assets/analytics_web_app.js'
      },
      exposes: {
        './Auth': './src/auth/index.ts'
      },
      shared: [
        'react',
        'react-dom',
        'react-redux',
        'react-router-dom',
        '@react-pdf-viewer/core',
        '@react-pdf-viewer/default-layout',
        'recharts'
      ]
    })
  ],
  server: {
    port: 5000,
    host: true
  }
})
