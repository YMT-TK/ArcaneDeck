import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

const external = [
  'better-sqlite3',
  'electron',
  '@prisma/client',
  'prisma',
  '.prisma/client',
  '.prisma/client/default'
]

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = env.VITE_APP_ENV === 'development'

  return {
    plugins: [
      react(),
      electron([
        {
          entry: 'electron/main.ts',
          onstart(options) {
            options.startup()
          },
          vite: {
            build: {
              outDir: 'dist-electron',
              minify: !isDev,
              sourcemap: isDev,
              rollupOptions: {
                external: external,
                output: {
                  compact: !isDev
                }
              }
            }
          }
        },
        {
          entry: 'electron/preload.ts',
          onstart(options) {
            options.reload()
          },
          vite: {
            build: {
              outDir: 'dist-electron',
              minify: !isDev,
              sourcemap: isDev,
              rollupOptions: {
                output: {
                  compact: !isDev
                }
              }
            }
          }
        }
      ]),
      renderer()
    ],
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils')
      }
    },
    server: {
      port: 5173,
      strictPort: true
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: !isDev ? 'terser' : false,
      sourcemap: isDev,
      rollupOptions: {
        external: ['electron', 'better-sqlite3'],
        output: {
          compact: !isDev
        }
      }
    },
    define: {
      'process.env.VITE_DEV_SERVER_URL': JSON.stringify('http://localhost:5173')
    }
  }
})
