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
      directories: ['/frontend/islands/']
    }),
    shopify({ versionNumbers: true }),
    importMaps({
      bareModules: {
        defaultGroup: '@theme',
        groups: {}
      },
      modulePreload: true
    }),
    cleanup(),
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
