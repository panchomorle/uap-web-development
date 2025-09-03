import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  css: {
    postcss: {}
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    globals: true,
    css: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})