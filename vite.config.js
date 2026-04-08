// @ts-check

import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import shopifyThemeIslands from 'vite-plugin-shopify-theme-islands'
import importMaps from 'vite-plugin-shopify-import-maps'
import tailwindcss from '@tailwindcss/vite'
import cleanup from '@driver-digital/vite-plugin-shopify-clean'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    shopifyThemeIslands({
      directories: ['/theme/frontend/islands/']
    }),
    shopify({
      versionNumbers: true,
      themeRoot: './theme',
      sourceCodeDir: 'theme/frontend'
    }),
    importMaps({
      themeRoot: './theme',
      bareModules: {
        defaultGroup: '@theme',
        groups: {}
      },
      modulePreload: true
    }),
    cleanup({ themeRoot: './theme' }),
    tailwindcss()
  ],
  build: {
    minify: false,
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
})
