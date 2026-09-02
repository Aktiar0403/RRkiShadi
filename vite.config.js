import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // two entries: the 3D walk (index.html) and the static edition (static.html → /static)
      input: { main: 'index.html', static: 'static.html' },
    },
  },
})
