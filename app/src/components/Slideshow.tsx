import {
  animate,
  mix,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  wrap,
  type AnimationPlaybackControls,
  type MotionValue,
  type PanInfo,
} from 'motion/react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { SlideInteractive } from './slideContext'
import styles from './Slideshow.module.css'

// Port of Framer's Slideshow component, reduced to the options the two project slideshows use:
// direction left, draggable, no autoplay, center alignment, itemAmount via the --slideshow-items
// CSS variable (it changes per breakpoint), and these effect / transition values.
const GAP = 30
const EFFECT_OPACITY = 0.5
const EFFECT_SCALE = 0.5
const EFFECT_ROTATE = 15
const SPRING = { type: 'spring', stiffness: 200, damping: 40, mass: 1, delay: 0 } as const
const SWIPE_VELOCITY = 200
// Framer renders the slides four times so the wrapped track always has neighbours on both sides.
const COPIES = 4

type Size = {
  /** Track (ul) width: the slideshow width minus its side padding. */
  parent: number
  item: number
  /** Length of one copy of the slides, gaps included. */
  copy: number
  viewport: number
}

type Slide = { key: string; node: ReactNode }

type Props = {
  slides: readonly Slide[]
  label: string
}

export function Slideshow({ slides, label }: Props) {
  const count = slides.length
  const trackRef = useRef<HTMLUListElement>(null)
  const [size, setSize] = useState<Size | null>(null)
  const [index, setIndex] = useState(count)
  const indexRef = useRef(index)
  const [dragging, setDragging] = useState(false)
  const dragged = useRef(false)

  const rawX = useMotionValue(0)
  const x = useTransform(rawX, (v) => {
    if (!size) return 0
    const wrapped = wrap(-size.copy, -size.copy * 2, v)
    return Number.isNaN(wrapped) ? 0 : wrapped
  })

  const measure = useCallback(() => {
    const track = trackRef.current
    const first = track?.firstElementChild
    const last = track?.children[count - 1]
    if (!track || !(first instanceof HTMLElement) || !(last instanceof HTMLElement)) return
    const next: Size = {
      parent: track.offsetWidth,
      item: first.offsetWidth,
      copy: last.offsetLeft + last.offsetWidth - first.offsetLeft + GAP,
      viewport: Math.max(document.documentElement.clientWidth, window.innerWidth, track.offsetWidth),
    }
    setSize((prev) =>
      prev && prev.parent === next.parent && prev.item === next.item && prev.copy === next.copy && prev.viewport === next.viewport
        ? prev
        : next,
    )
  }, [count])

  useLayoutEffect(() => {
    measure()
    const track = trackRef.current
    const first = track?.firstElementChild
    if (!track || !first) return
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    observer.observe(first)
    return () => observer.disconnect()
  }, [measure])

  useLayoutEffect(() => {
    indexRef.current = index
  }, [index])

  // A new size (first measure, resize, itemAmount change at a breakpoint) jumps straight to the
  // current slide, like Framer's resize handling.
  useLayoutEffect(() => {
    if (size) rawX.jump(-indexRef.current * (size.item + GAP))
  }, [size, rawX])

  const target = size ? -index * (size.item + GAP) : 0
  const animation = useRef<AnimationPlaybackControls | null>(null)
  useEffect(() => {
    if (!size || dragging || rawX.get() === target) return
    // Not stopped on re-run: a new animate() on the same value takes over its velocity.
    animation.current = animate(rawX, target, SPRING)
  }, [size, dragging, target, rawX])
  useEffect(() => () => animation.current?.stop(), [])

  const go = (delta: number) => setIndex((i) => i + delta)

  const onDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    setDragging(false)
    if (!size) return
    const steps = Math.round(Math.abs(offset.x) / size.item)
    const atLeastOne = steps === 0 ? 1 : steps
    if (velocity.x > SWIPE_VELOCITY) go(-atLeastOne)
    else if (velocity.x < -SWIPE_VELOCITY) go(atLeastOne)
    else if (offset.x < -size.item / 2) go(steps)
    else if (offset.x > size.item / 2) go(-steps)
  }

  // A drag that ends over a slide must not count as a click on it (e.g. start a video).
  const onPointerDownCapture = () => {
    dragged.current = false
  }
  const onClickCapture = (event: MouseEvent) => {
    if (!dragged.current) return
    event.preventDefault()
    event.stopPropagation()
  }

  const current = wrap(0, count, index)
  const rendered: ReactNode[] = []
  for (let copy = 0; copy < COPIES; copy++) {
    slides.forEach((slide, i) => {
      rendered.push(
        <SlideItem key={`${copy}-${slide.key}`} x={x} size={size} counter={copy * count + i}>
          {slide.node}
        </SlideItem>,
      )
    })
  }

  return (
    <div
      className={styles.root}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      style={{ opacity: size ? 1 : 0.001 }}
    >
      <div className={styles.viewport}>
        <motion.ul
          ref={trackRef}
          className={styles.track}
          style={{ x }}
          drag="x"
          _dragX={rawX}
          dragDirectionLock
          dragMomentum={false}
          onDragStart={() => {
            dragged.current = true
            setDragging(true)
          }}
          onDragEnd={onDragEnd}
          onPointerDownCapture={onPointerDownCapture}
          onClickCapture={onClickCapture}
        >
          {rendered}
        </motion.ul>
      </div>
      <div className={styles.controls} role="group" aria-label="Slideshow pagination controls">
        <div className={styles.arrows}>
          <ArrowButton direction="previous" onClick={() => go(-1)} />
          <ArrowButton direction="next" onClick={() => go(1)} />
        </div>
        <div className={styles.dots}>
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              className={styles.dotButton}
              aria-label={`Scroll to page ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
              onClick={() => go(i - current)}
            >
              <motion.span
                className={styles.dot}
                initial={false}
                animate={{ opacity: i === current ? 1 : 0.5 }}
                transition={{ duration: 0.3 }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

type SlideItemProps = {
  x: MotionValue<number>
  size: Size | null
  /** Position across all copies, which fixes where the slide sits on the track. */
  counter: number
  children: ReactNode
}

function SlideItem({ x, size, counter, children }: SlideItemProps) {
  const item = size?.item ?? 0
  const parent = size?.parent ?? 0
  const viewport = size?.viewport ?? 0
  const offset = (item + GAP) * counter
  // Track positions where this slide enters, fills, and leaves the visible window.
  const range = [-item, 0, parent - item + GAP, parent].map((v) => v - offset)

  const rotateY = useTransform(x, range, [-EFFECT_ROTATE, 0, 0, EFFECT_ROTATE])
  const opacity = useTransform(x, range, [EFFECT_OPACITY, 1, 1, EFFECT_OPACITY])
  const scale = useTransform(x, range, [EFFECT_SCALE, 1, 1, EFFECT_SCALE])
  // Off-window slides shrink towards the current slide's edge.
  const originX = useTransform(x, range, [1, 1, 0, 0])
  const visibility = useTransform(
    x,
    [range[0] - viewport, mix(range[1], range[2], 0.5), range[3] + viewport],
    ['hidden', 'visible', 'hidden'],
  )
  const inWindow = useTransform(x, (v) => v >= range[1] && v <= range[2])
  const [interactive, setInteractive] = useState(() => inWindow.get())
  useMotionValueEvent(inWindow, 'change', setInteractive)

  return (
    <motion.li
      className={styles.slide}
      aria-hidden={!interactive}
      style={{ opacity, scale, originX, rotateY, visibility }}
    >
      <SlideInteractive value={interactive}>{children}</SlideInteractive>
    </motion.li>
  )
}

function ArrowButton({ direction, onClick }: { direction: 'previous' | 'next'; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      className={styles.arrow}
      aria-label={direction === 'previous' ? 'Previous' : 'Next'}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.15 }}
    >
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path
          fill="none"
          stroke="#fff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={direction === 'previous' ? 'M22.5 12.5 15 20l7.5 7.5' : 'M17.5 12.5 25 20l-7.5 7.5'}
        />
      </svg>
    </motion.button>
  )
}
