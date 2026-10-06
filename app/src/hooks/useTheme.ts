import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

// Same key the Framer theme switch used, so a returning visitor keeps their choice.
const STORAGE_KEY = 'currentToggleState'
const listeners = new Set<() => void>()

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The theme lives on <html data-theme>; index.html sets it before first paint. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'dark' as const)
  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // storage blocked (private mode): the theme still applies for this visit
    }
    listeners.forEach((l) => l())
  }, [])
  return { theme, setTheme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') }
}
