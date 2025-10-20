import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
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
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom'
  }
})
