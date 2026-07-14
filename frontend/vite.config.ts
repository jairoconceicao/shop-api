import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    topLevelAwait({
      // Promise export name for each chunk
      promiseExportName: '__tla',
      // Promise import name for each chunk
      promiseImportName: i => `__tla_${i}`})    
    ],
  test: {
    environment: 'jsdom',
    execArgv: ['--no-experimental-webstorage'],
    setupFiles: './src/shared/testing/setup.ts',
    exclude: [...configDefaults.exclude, '**/e2e/**'],
  },
})
