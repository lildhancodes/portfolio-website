import { useMediaQuery } from '../../layout/useMediaQuery'

export type PageBreakpoint = 'desktop' | 'tablet' | 'phone'

/** The Home page's own breakpoints (desktop ≥1400, tablet 810–1399.98, phone ≤809.98). */
export function usePageBreakpoint(): PageBreakpoint {
  const desktop = useMediaQuery('(min-width: 1400px)')
  const phone = useMediaQuery('(max-width: 809.98px)')
  if (desktop) return 'desktop'
  return phone ? 'phone' : 'tablet'
}
