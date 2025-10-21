/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'peerpigeon': path.resolve(__dirname, 'src/shims/peerpigeon-browser.ts')
    }
  },
  optimizeDeps: {
    exclude: ['peerpigeon']
  },
  server: {
    host: '0.0.0.0',
    hmr: true
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'PigeonNest',
      fileName: (format) => `pigeon-nest.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'peerpigeon'],
      output: {
        globals: {
          vue: 'Vue',
          peerpigeon: 'PeerPigeon'
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom'
  }
})
