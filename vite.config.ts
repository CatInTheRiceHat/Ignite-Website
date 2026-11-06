import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  // Prebundle the shared React runtime before the lazy course route is visited.
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
