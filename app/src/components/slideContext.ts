import { createContext, useContext } from 'react'

export const SlideInteractive = createContext(true)

/** False while the slide this renders in is outside the slideshow's visible window (it is aria-hidden then). */
export function useSlideInteractive() {
  return useContext(SlideInteractive)
}
