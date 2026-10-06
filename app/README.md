# Lil Dhan portfolio

React rebuild of the Framer site exported in `../` (the export is kept as the visual reference).

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check, client build, prerender → dist/
npm run preview  # serve dist/
```

## Layout

- `src/App.tsx` — page composition: layout shell around the sections, in Framer's order.
- `src/layout/` — nav, theme switch, custom cursor, Lenis smooth scroll, footer.
- `src/sections/` — `Intro` (hero, services, about, and the sticky flipping avatar card), long/short form
  project slideshows, process grid, contact form.
- `src/components/` — `Picture`, `Slideshow`, `YouTubeEmbed` (click-to-load), `HandWaveBadge` (lazy Lottie).
- `src/content/` — contact details, links and the video list.
- `src/styles/` — color tokens (light/dark), typography classes mapped from Framer's text presets.

## Notes

- Breakpoints follow Framer: the page switches at 810/1400px, the nav and text styles at 810/1200px.
- Images: `import x from './photo.jpg?picture'` gives AVIF/WebP srcsets, rendered with `<Picture>`.
- The build prerenders the page into `dist/index.html` (`scripts/prerender.mjs`); the client hydrates it.
- Theme defaults to dark and is stored under the same localStorage key the Framer site used.
- The contact form posts to Framer's form endpoint (`src/sections/contact/submitContact.ts`).
- Vercel: project root `app`, build `npm run build`, output `dist`. `vercel.json` only sets cache headers.
