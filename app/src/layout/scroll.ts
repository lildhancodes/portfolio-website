import type Lenis from 'lenis'

// One Lenis instance for the page, owned by <SmoothScroll />. Null for reduced-motion
// visitors, who get native scrolling.
let lenis: Lenis | null = null
const locks = new Set<string>()

export function setLenis(instance: Lenis | null) {
  lenis = instance
  syncScrollLock()
}

/**
 * Scroll to a section by id, honouring its `scroll-margin-top` like the Framer Smooth Scroll
 * component did. An unknown id (or the hero) scrolls to the top. Returns false when the
 * browser should handle the navigation itself.
 */
export function scrollToAnchor({ id }: { id: string }): boolean {
  const target = id === '' ? null : document.getElementById(id)
  if (!lenis) {
    if (target) target.scrollIntoView()
    else window.scrollTo({ top: 0 })
    return true
  }
  if (!target) {
    lenis.scrollTo(0)
    return true
  }
  const margin = Number.parseInt(getComputedStyle(target).scrollMarginTop, 10) || 0
  lenis.scrollTo(target, { offset: -margin })
  return true
}

/**
 * Port of Framer University's "Stop Scroll": while any lock is held the body can't scroll
 * and Lenis is stopped. Other code that sets `overflow: hidden` on <html> also stops Lenis
 * (SmoothScroll watches for it, as the original did).
 */
export function setScrollLock({ reason, locked }: { reason: string; locked: boolean }) {
  if (locked) locks.add(reason)
  else locks.delete(reason)
  document.body.style.overflow = locks.size > 0 ? 'hidden' : ''
  syncScrollLock()
}

export function syncScrollLock() {
  if (!lenis) return
  const htmlHidden = document.documentElement.style.overflow === 'hidden'
  if (locks.size > 0 || htmlHidden) lenis.stop()
  else lenis.start()
}
