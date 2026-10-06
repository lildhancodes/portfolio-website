import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type RefObject } from 'react'
import styles from './HandWaveBadge.module.css'

// Framer "Circle Badge Animate": "Hi" holds for 2s, the waving hand for 4s, then it cycles.
const HOLD_MS = { hi: 2000, wave: 4000 } as const
const SLIDE = { type: 'spring', stiffness: 500, damping: 60, mass: 1 } as const

/**
 * Framer "Circle Badge": an accent circle whose inner window slides between "Hi" and a looping
 * Lottie hand wave. Fills its container; size and position come from the caller.
 */
export function HandWaveBadge({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const [waving, setWaving] = useState(false)
  const lottieRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setTimeout(() => setWaving((value) => !value), waving ? HOLD_MS.wave : HOLD_MS.hi)
    return () => window.clearTimeout(id)
  }, [waving, reduceMotion])

  useHandWaveLottie({ containerRef: lottieRef, enabled: !reduceMotion })

  return (
    <div className={className ? `${styles.badge} ${className}` : styles.badge}>
      <div className={styles.window}>
        <motion.div className={styles.track} initial={false} animate={{ y: waving ? '-50%' : '0%' }} transition={SLIDE}>
          <p className={`t-stat ${styles.hi}`}>Hi</p>
          <div ref={lottieRef} className={styles.lottie} aria-hidden="true" />
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Loads lottie_light and the animation JSON on demand (neither is in the main bundle), once the
 * badge comes near the viewport. Plays looped like the original; paused while off screen.
 */
function useHandWaveLottie({
  containerRef,
  enabled,
}: {
  containerRef: RefObject<HTMLDivElement | null>
  enabled: boolean
}) {
  useEffect(() => {
    const container = containerRef.current
    if (!enabled || !container) return
    let cancelled = false
    let animation: { play(): void; pause(): void; destroy(): void } | null = null
    let visible = false
    let started = false

    const load = async () => {
      const [{ default: lottie }, { default: data }] = await Promise.all([
        import('lottie-web/build/player/lottie_light'),
        import('../assets/hand-wave.lottie.json'),
      ])
      if (cancelled) return
      const instance = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: visible,
        // lottie annotates the data it is given; each badge gets its own copy
        animationData: structuredClone(data),
      })
      // the original recoloured the first two paths with theme tokens and hid the outline
      instance.addEventListener('DOMLoaded', () => {
        const paths = container.getElementsByTagName('path')
        paths[0]?.setAttribute('fill', 'var(--color-text-inverse)')
        paths[1]?.setAttribute('fill', 'var(--color-accent)')
        for (const path of paths) path.setAttribute('stroke', 'rgba(255, 255, 255, 0)')
      })
      animation = instance
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (!animation) {
          if (visible && !started) {
            started = true
            void load()
          }
          return
        }
        if (visible) animation.play()
        else animation.pause()
      },
      { rootMargin: '200px' },
    )
    observer.observe(container)
    return () => {
      cancelled = true
      observer.disconnect()
      animation?.destroy()
    }
  }, [containerRef, enabled])
}
