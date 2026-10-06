import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const container = document.getElementById('root')
if (!container) throw new Error('index.html is missing #root')

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Production HTML is prerendered (scripts/prerender.mjs); the dev server serves an empty root.
if (container.hasChildNodes()) hydrateRoot(container, app)
else createRoot(container).render(app)
