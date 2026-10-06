import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  wrap,
  type AnimationPlaybackControls,
  type MotionValue,
  type MotionStyle,
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

// Shared horizontal video reel. Long-form slides use a viewport-centered 3D arc; short-form slides
// retain the existing reel behavior. Dragging stays locked to the horizontal axis.
const GAP = 30
const EFFECT_SCALE = 0.5
const SPRING = { type: 'spring', stiffness: 200, damping: 40, mass: 1, delay: 0 } as const
const SWIPE_VELOCITY = 200
const REEL_ANGLE = (45 * Math.PI) / 180
const CARD_TILT = (60 * Math.PI) / 180
const MAX_REEL_TURNS = 2.5
const MAX_DEPTH_TURNS = 12.5
// Framer renders the slides four times so the wrapped track always has neighbours on both sides.
const COPIES = 4

type Size = {
  /** Track (ul) width: the slideshow width minus its side padding. */
  parent: number
  item: number
  /** Length of one copy of the slides, gaps included. */
  copy: number
}

type Slide = { key: string; node: ReactNode }
type DepthCardTransform = {
  x: number
  z: number
  rotateY: number
  scale: number
  blur: number
  opacity: number
  zIndex: number
}

type Props = {
  slides: readonly Slide[]
  label: string
  /** Use the Framer-style depth deck for the widescreen portfolio videos. */
  effect?: 'reel' | 'depth' | 'depth-short'
}

export function Slideshow({ slides, label, effect = 'reel' }: Props) {
  const depthMode = effect !== 'reel'
  const portraitMode = effect === 'depth-short'
  const count = slides.length
  const trackRef = useRef<HTMLUListElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size | null>(null)
  const [index, setIndex] = useState(count)
  const indexRef = useRef(index)
  const [dragging, setDragging] = useState(false)
  const dragged = useRef(false)
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wheelActive = useRef(false)

  const rawX = useMotionValue(0)
  const x = useTransform(rawX, (v) => {
    if (!size) return 0
    const wrapped = wrap(-size.copy * 2, -size.copy, v)
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
    }
    setSize((prev) =>
      prev && prev.parent === next.parent && prev.item === next.item && prev.copy === next.copy
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
    if (size) rawX.jump(centeredTarget(indexRef.current, size))
  }, [size, rawX])

  const target = size ? centeredTarget(index, size) : 0
  const animation = useRef<AnimationPlaybackControls | null>(null)
  useEffect(() => {
    if (!size || dragging || rawX.get() === target) return
    // Not stopped on re-run: a new animate() on the same value takes over its velocity.
    animation.current = animate(rawX, target, SPRING)
  }, [size, dragging, target, rawX])
  useEffect(() => () => animation.current?.stop(), [])

  // A Mac trackpad's horizontal swipe arrives as a wheel event rather than a pointer drag.
  // Consume only clearly horizontal motion; vertical gestures remain native page scrolling.
  useEffect(() => {
    const root = rootRef.current
    if (!root || !depthMode || !size) return

    const onWheel = (event: WheelEvent) => {
      const horizontal = event.deltaX
      if (Math.abs(horizontal) < 1 || Math.abs(horizontal) <= Math.abs(event.deltaY) * 1.15) return

      event.preventDefault()
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? size.parent
          : 1
      if (!wheelActive.current) {
        wheelActive.current = true
        animation.current?.stop()
        setDragging(true)
      }
      rawX.set(rawX.get() - horizontal * unit)

      if (wheelTimer.current) clearTimeout(wheelTimer.current)
      wheelTimer.current = setTimeout(() => {
        const distance = rawX.get() - centeredTarget(indexRef.current, size)
        const steps = Math.round(-distance / (size.item + GAP))
        wheelActive.current = false
        setDragging(false)
        if (steps !== 0) setIndex((currentIndex) => currentIndex + steps)
      }, 120)
    }

    root.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      root.removeEventListener('wheel', onWheel)
      if (wheelTimer.current) clearTimeout(wheelTimer.current)
      wheelActive.current = false
    }
  }, [depthMode, rawX, size])

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
  const dots = (
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
  )
  const rendered: ReactNode[] = []
  for (let copy = 0; copy < COPIES; copy++) {
    slides.forEach((slide, i) => {
      rendered.push(
        <SlideItem key={`${copy}-${slide.key}`} x={x} size={size} counter={copy * count + i} depthMode={depthMode} portraitMode={portraitMode}>
          {slide.node}
        </SlideItem>,
      )
    })
  }

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-effect={effect}
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
      <div className={`${styles.controls} ${depthMode ? styles.depthControls : ''} ${portraitMode ? styles.portraitControls : ''}`} role="group" aria-label="Slideshow pagination controls">
        {depthMode ? (
          <>
            <ArrowButton direction="previous" onClick={() => go(-1)} />
            {dots}
            <ArrowButton direction="next" onClick={() => go(1)} />
          </>
        ) : (
          <>
            <div className={styles.arrows}>
              <ArrowButton direction="previous" onClick={() => go(-1)} />
              <ArrowButton direction="next" onClick={() => go(1)} />
            </div>
            {dots}
          </>
        )}
      </div>
    </div>
  )
}

type SlideItemProps = {
  x: MotionValue<number>
  size: Size | null
  depthMode: boolean
  portraitMode: boolean
  /** Position across all copies, which fixes where the slide sits on the track. */
  counter: number
  children: ReactNode
}

function SlideItem({ x, size, counter, depthMode, portraitMode, children }: SlideItemProps) {
  const item = size?.item ?? 0
  const parent = size?.parent ?? 0
  const offset = (item + GAP) * counter
  const pitch = item + GAP
  const progress = useTransform(x, (v) => {
    if (!size) return 0
    return (offset + v + item / 2 - parent / 2) / pitch
  })
  const depthState = useTransform(progress, (p) => getCardTransform(p, item, parent, portraitMode))
  // Motion uses degrees. A left card's right edge and a right card's left edge turn toward center.
  const depthRotateY = useTransform(depthState, (state) => state.rotateY)
  const reelRotateY = useTransform(progress, (p) => -Math.max(-1.48, Math.min(1.48, p * CARD_TILT)))
  const rotateY = depthMode ? depthRotateY : reelRotateY
  const depthOpacity = useTransform(depthState, (state) => state.opacity)
  const reelOpacity = useTransform(progress, (p) => Math.max(0.08, 1 - Math.abs(p) * 0.38))
  const opacity = depthMode ? depthOpacity : reelOpacity
  const depthScaleValue = useTransform(depthState, (state) => state.scale)
  const reelScale = useTransform(progress, (p) => Math.max(EFFECT_SCALE, 1 - Math.abs(p) * 0.16))
  const scale = depthMode ? depthScaleValue : reelScale
  // Use matching X/Y scales explicitly so cards keep their original aspect ratio.
  const scaleX = useTransform(scale, (value) => value)
  const scaleY = useTransform(scale, (value) => value)
  const depthX = useTransform(depthState, (state) => state.x)
  const reelX = useTransform(progress, (p) => {
    if (!size) return 0
    const angle = p * REEL_ANGLE
    const radius = pitch * 1.15
    return radius * Math.sin(angle) - p * pitch
  })
  const curveX = depthMode ? depthX : reelX
  const depthZValue = useTransform(depthState, (state) => state.z)
  const reelZ = useTransform(progress, (p) => {
    if (!size) return 0
    const angle = p * REEL_ANGLE
    const radius = pitch * 1.15
    return radius * (Math.cos(angle) - 1)
  })
  const depth = depthMode ? depthZValue : reelZ
  const blur = useTransform(depthState, (state) => depthMode ? `${state.blur}px` : '0px')
  const zIndex = useTransform(depthState, (state) => depthMode ? state.zIndex : 0)
  const maxTurns = depthMode ? MAX_DEPTH_TURNS : MAX_REEL_TURNS
  const visibility = useTransform(progress, (p) => (Math.abs(p) <= maxTurns ? 'visible' : 'hidden'))
  const inWindow = useTransform(progress, (p) => Math.abs(p) <= maxTurns)
  const [interactive, setInteractive] = useState(() => inWindow.get())
  useMotionValueEvent(inWindow, 'change', setInteractive)

  return (
    <motion.li
      className={depthMode ? `${styles.slide} ${styles.depthSlide}` : styles.slide}
      aria-hidden={!interactive}
      style={{ x: curveX, z: depth, opacity, scaleX, scaleY, rotateY, '--card-blur': blur, zIndex, visibility, transformOrigin: 'center center' } as MotionStyle}
    >
      <SlideInteractive value={interactive}>{children}</SlideInteractive>
    </motion.li>
  )
}

function centeredTarget(index: number, size: Size) {
  return (size.parent - size.item) / 2 - index * (size.item + GAP)
}

function getCardTransform(relativeIndex: number, cardWidth: number, viewportWidth: number, portraitMode = false): DepthCardTransform {
  const distance = Math.abs(relativeIndex)
  const scale = interpolate(distance, [0, 1, 2, 3, 4, 5, 6], [1.25, 0.92, 0.81, 0.71, 0.62, 0.54, 0.47])
  const rotation = interpolate(distance, [0, 1, 2, 3, 4], [0, 15, 25, 29, 30])
  const spacingCardWidth = portraitMode
    ? cardWidth
    : viewportWidth > 809
    ? Math.min(500, Math.max(400, viewportWidth * 0.3))
    : cardWidth
  const horizontalStep = portraitMode
    ? viewportWidth <= 600
      ? Math.min(cardWidth * 1.25, viewportWidth * 0.9)
      : cardWidth * 1.35
    : viewportWidth <= 600
      ? Math.min(cardWidth * 0.95, viewportWidth * 0.84)
      : spacingCardWidth * 0.54
  // Blur follows each card's live screen position, not its place in the video list.
  // p moves continuously during drag, so easing from the viewport centre to either edge
  // gives the whole deck a smooth horizontal depth-of-field gradient.
  const cardCenterX = relativeIndex * horizontalStep
  // Spread the ramp across more of the visible deck so successive side cards
  // keep distinct blur levels instead of reaching the maximum together.
  const edgeProgress = Math.min(1, Math.abs(cardCenterX) / Math.max(1, viewportWidth * 0.75))
  const easedEdgeProgress = edgeProgress * edgeProgress * (3 - 2 * edgeProgress)
  const blur = 42 * easedEdgeProgress

  return {
    x: relativeIndex * (horizontalStep - cardWidth - GAP),
    // Keep depth continuous through the center. A one-frame jump to positive Z
    // enlarged the card only after it arrived, instead of during the slide.
    z: -Math.min(240, distance * 48),
    rotateY: -Math.sign(relativeIndex) * rotation,
    scale,
    blur,
    opacity: 1,
    // A wide z-index range makes the active card reliably paint above every
    // neighbour, including while fractional drag positions are being animated.
    zIndex: Math.round(100_000 - distance * 1_000),
  }
}

function interpolate(value: number, stops: number[], values: number[]) {
  const last = stops.length - 1
  if (value <= stops[0]) return values[0]
  if (value >= stops[last]) return values[last]
  const lower = Math.floor(value)
  const progress = (value - stops[lower]) / (stops[lower + 1] - stops[lower])
  return values[lower] + (values[lower + 1] - values[lower]) * progress
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
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={direction === 'previous' ? 'M22.5 12.5 15 20l7.5 7.5' : 'M17.5 12.5 25 20l-7.5 7.5'}
        />
      </svg>
    </motion.button>
  )
}
