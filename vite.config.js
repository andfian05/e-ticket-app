import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      "/api": {
        target:
          "https://script.google.com/macros/s/AKfycby9vhuJng1H8pnUeK-J1t7t6AD1h2i5oIy8rZDVYullNKLBtF3ZFEUX54hQoamaV9n8/exec",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
