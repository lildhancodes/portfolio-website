import { transform, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, type RefObject } from 'react'

export type TransformTarget = {
  opacity: number
  x: number
  scale: number
  rotate: number
  rotateY: number
}

type Key = keyof TransformTarget
const KEYS: readonly Key[] = ['opacity', 'x', 'scale', 'rotate', 'rotateY']

/** A target without a ref is the resting state before the first ref'd element arrives. */
export type ScrollTarget = { ref?: RefObject<HTMLElement | null>; target: TransformTarget }

export const RESTING: TransformTarget = { opacity: 1, x: 0, scale: 1, rotate: 0, rotateY: 0 }

// __framer__spring on every scroll-target effect in this section
const SPRING = { stiffness: 500, damping: 60, mass: 1, restDelta: 0.001 }

function documentTop(element: HTMLElement) {
  let top = 0
  let node: Element | null = element
  while (node instanceof HTMLElement && node !== document.documentElement) {
    top += node.offsetTop
    node = node.offsetParent
  }
  return top
}

/**
 * Framer's onScrollTarget ranges: target i is reached while target i's element scrolls from
 * "top meets viewport bottom" (threshold 1 = one viewport height earlier than its top) to
 * "fully in view", clipped so consecutive ranges never overlap.
 */
function buildRanges({ targets, thresholdPx }: { targets: readonly ScrollTarget[]; thresholdPx: number }) {
  const input: number[] = []
  const output: Record<Key, number[]> = { opacity: [], x: [], scale: [], rotate: [], rotateY: [] }
  const starts: number[] = []
  for (let index = targets.length - 1; index >= 0; index--) {
    const element = targets[index].ref?.current
    if (!element) continue
    const start = documentTop(element) - 1 - thresholdPx
    const next = starts.at(-1)
    const end = Math.max(start + element.clientHeight, 0)
    starts.push(start)
    input.unshift(Math.max(start, 0), next === undefined ? end : Math.min(end, Math.max(next - 1, 0)))
    for (const key of KEYS) output[key].unshift(targets[index - 1]?.target[key] ?? 0, targets[index].target[key])
  }
  return { input, output }
}

/**
 * Port of Framer's scroll-target transform effect (`__framer__transformTrigger: onScrollTarget`):
 * values interpolate between targets as each target's element scrolls into view, then a spring
 * smooths them. Reduced motion keeps only opacity, like Framer.
 */
export function useScrollTargets({
  targets,
  threshold,
  enabled,
}: {
  targets: readonly ScrollTarget[]
  threshold: number
  enabled: boolean
}): Record<Key, MotionValue<number>> {
  const reduceMotion = useReducedMotion()
  const resting = targets[0].target
  const opacity = useMotionValue(resting.opacity)
  const x = useMotionValue(resting.x)
  const scale = useMotionValue(resting.scale)
  const rotate = useMotionValue(resting.rotate)
  const rotateY = useMotionValue(resting.rotateY)
  const raw: Record<Key, MotionValue<number>> = useMemo(
    () => ({ opacity, x, scale, rotate, rotateY }),
    [opacity, x, scale, rotate, rotateY],
  )

  const update = useCallback(() => {
    if (!enabled) return
    const { input, output } = buildRanges({ targets, thresholdPx: threshold * window.innerHeight })
    if (input.length === 0) return
    for (const key of KEYS) {
      if (reduceMotion && key !== 'opacity') continue
      raw[key].set(transform(window.scrollY, input, output[key]))
    }
  }, [raw, enabled, targets, threshold, reduceMotion])

  // a breakpoint switch (or reduced motion) starts again from the resting state
  useLayoutEffect(() => {
    for (const key of KEYS) raw[key].set(resting[key])
  }, [raw, resting, enabled, reduceMotion])

  useLayoutEffect(update, [update])

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', update)
  useEffect(() => {
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  return {
    opacity: useSpring(opacity, SPRING),
    x: useSpring(x, SPRING),
    scale: useSpring(scale, SPRING),
    rotate: useSpring(rotate, SPRING),
    rotateY: useSpring(rotateY, SPRING),
  }
}
