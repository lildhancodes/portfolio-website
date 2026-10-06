import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Fonts that render above the fold. Their hashed URLs are only known after bundling,
// so this plugin injects the <link rel="preload"> tags once the bundle exists.
const CRITICAL_FONTS = [
  'antonio-latin', // hero heading
  'v2q8jttts7mcdmsehnxaibqd0', // Inter 300 latin, hero copy + nav
]

function preloadCriticalFonts(): Plugin {
  return {
    name: 'preload-critical-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {})
        return CRITICAL_FONTS.map((name) => {
          const file = files.find((f) => f.includes(name) && f.endsWith('.woff2'))
          if (!file) throw new Error(`critical font ${name} missing from bundle`)
          return {
            tag: 'link',
            attrs: { rel: 'preload', href: `/${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
            injectTo: 'head-prepend' as const,
          }
        })
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), preloadCriticalFonts()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
})
