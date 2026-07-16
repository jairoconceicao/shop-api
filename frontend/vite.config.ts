import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    manifest: true,
  },
  test: {
    environment: 'jsdom',
    execArgv: ['--no-experimental-webstorage'],
    setupFiles: './src/shared/testing/setup.ts',
    exclude: [...configDefaults.exclude, '**/e2e/**'],
  },
})
