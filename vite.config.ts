import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import RubyPlugin from 'vite-plugin-ruby'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [RubyPlugin(), react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./app/javascript', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
  },
})
