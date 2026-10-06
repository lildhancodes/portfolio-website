import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

// Build-time only: scripts/prerender.mjs bakes this HTML into dist/index.html so the page
// paints before any JS runs, like Framer's server-rendered export did.
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
