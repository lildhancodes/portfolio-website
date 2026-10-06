import Lenis from 'lenis'
import { useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { scrollToAnchor, setLenis, syncScrollLock } from './scroll'

/**
 * Framer University "Smooth Scroll" (Lenis 1.1.9, intensity 10 → duration 1s). Lenis 1.1.9
 * eased wheel scrolls over `duration` with its expo-out curve; 1.3 only does that when
 * `duration` is set, so the same curve is passed explicitly.
 */
const LENIS_OPTIONS = {
  duration: 1,
  easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  lerp: 0.1,
  smoothWheel: true,
  syncTouch: false,
  autoRaf: true,
} as const

export function SmoothScroll() {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    const lenis = new Lenis(LENIS_OPTIONS)
    setLenis(lenis)
    // the original reset to the top on load; a deep link (/#contact) keeps its target
    if (!window.location.hash) lenis.scrollTo(0, { immediate: true })
    return () => {
      setLenis(null)
      lenis.destroy()
    }
  }, [reduceMotion])

  // Same-page hash links scroll through Lenis (the original bound every a[href*="#"]).
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
      if (!(event.target instanceof Element)) return
      const anchor = event.target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank') return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return
      if (scrollToAnchor({ id: decodeURIComponent(url.hash.slice(1)) })) event.preventDefault()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Anything that hides <html>'s overflow (modals in other sections) pauses Lenis too.
  useEffect(() => {
    const observer = new MutationObserver(syncScrollLock)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
    return () => observer.disconnect()
  }, [])

  return null
}
