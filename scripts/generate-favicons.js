#!/usr/bin/env node

/**
 * Generate PNG favicons from SVG
 * Uses canvas to render SVG and output PNG files
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// SVG content with amber background
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#D4974A"/>
  <text x="16" y="23" font-family="system-ui" font-size="20" font-weight="bold" fill="#111614" text-anchor="middle">K</text>
</svg>`

// For apple-touch-icon, we need a larger version
const svgContentLarge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="34" fill="#D4974A"/>
  <text x="90" y="130" font-family="system-ui" font-size="112" font-weight="bold" fill="#111614" text-anchor="middle">K</text>
</svg>`

console.log('SVG favicon content ready for manual conversion.')
console.log('\nPlease use one of these methods to generate PNG favicons:')
console.log('\n1. Online tool: https://realfavicongenerator.net/')
console.log('   - Upload the updated docs/public/favicon.svg')
console.log('   - Generate all required sizes')
console.log('\n2. Install sharp package and use Node:')
console.log('   pnpm add -D sharp')
console.log('   Then run this script again')
console.log('\n3. Use macOS Preview:')
console.log('   - Open docs/public/favicon.svg in Preview')
console.log('   - Export as PNG at 32x32, 16x16, and 180x180 sizes')

// Try to use sharp if available
try {
  const sharp = await import('sharp').then(m => m.default)

  const publicDir = join(__dirname, '../docs/public')

  // Generate 32x32
  await sharp(Buffer.from(svgContent))
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon-32x32.png'))

  // Generate 16x16
  await sharp(Buffer.from(svgContent))
    .resize(16, 16)
    .png()
    .toFile(join(publicDir, 'favicon-16x16.png'))

  // Generate apple-touch-icon 180x180
  await sharp(Buffer.from(svgContentLarge))
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'))

  console.log('\n✅ Successfully generated all PNG favicons!')
  console.log('   - favicon-32x32.png')
  console.log('   - favicon-16x16.png')
  console.log('   - apple-touch-icon.png')
} catch (error) {
  console.log('\nSharp not available. Install it with: pnpm add -D sharp')
}
