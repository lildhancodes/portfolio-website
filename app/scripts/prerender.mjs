// Runs after `vite build` + `vite build --ssr`: renders the app to HTML and injects it into dist/index.html.
import { readFile, rm, writeFile } from 'node:fs/promises'

const ssrDir = new URL('../dist-ssr/', import.meta.url)
const indexFile = new URL('../dist/index.html', import.meta.url)

const { render } = await import(new URL('entry-server.js', ssrDir).href)
const template = await readFile(indexFile, 'utf8')
const placeholder = '<div id="root"></div>'
if (!template.includes(placeholder)) throw new Error('dist/index.html has no empty #root to fill')

await writeFile(indexFile, template.replace(placeholder, `<div id="root">${render()}</div>`))
await rm(ssrDir, { recursive: true })
console.log('prerendered dist/index.html')
