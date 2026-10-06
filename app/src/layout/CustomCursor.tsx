import { animate, motion, useMotionValue, useSpring, useTransform, type Transition } from 'motion/react'
import { useEffect, useState } from 'react'
import imgB from '../assets/images/bguhyrxnjkhvzpp3ua8tpmyj7k.png?w=195;390&format=avif;webp;png&as=picture'
import imgR from '../assets/images/rpxwdsxrtmbhmctcb414zgg2qy.jpeg?w=195;390&format=avif;webp;jpg&as=picture'
import imgO from '../assets/images/ov53jg8laoafuct0li7vwgmoqq.jpeg?w=195;390&format=avif;webp;jpg&as=picture'
import img9 from '../assets/images/9hduiixx5esq1wrepvo4qcnkm.jpeg?w=195;390&format=avif;webp;jpg&as=picture'
import imgW from '../assets/images/wocth6bhmtlrgpz7c8doo3xdy.jpeg?w=195;390&format=avif;webp;jpg&as=picture'
import imgPk from '../assets/images/pkuxayndzxhirorag0vcqmumwu.jpeg?w=195;390&format=avif;webp;jpg&as=picture'
import imgPa from '../assets/images/pac9cf9r5wcykthuk5k2dwruxl4.jpg?w=195;390&format=avif;webp;jpg&as=picture'
import imgQ from '../assets/images/qxztmqjbjm7pyc9d3uzjwfed8.jpg?w=195;390&format=avif;webp;jpg&as=picture'
import { Picture } from '../components/Picture'
import s from './CustomCursor.module.css'
import { TEMPLATE_DESKTOP, useMediaQuery } from './useMediaQuery'

/**
 * Framer "Custom Cursor": a dot that trails the pointer 20px down-right, on desktop
 * (≥1200px) devices that can hover. The native cursor stays visible, as in the original.
 *
 * Pick a variant for a region with `data-cursor` (nearest ancestor wins):
 *   "blend"                   — the dot with mix-blend-mode: color-burn (footer, Contact)
 *   "service-1" … "service-4" — the tilted 195×114 image card for each service row
 *   "none"                    — hide it (overlays)
 * Anything else gets the default accent dot.
 */
type Kind = 'default' | 'blend' | 'service-1' | 'service-2' | 'service-3' | 'service-4' | 'none'

const KINDS: ReadonlySet<string> = new Set<Kind>(['blend', 'service-1', 'service-2', 'service-3', 'service-4', 'none'])
function isKind(value: string): value is Kind {
  return KINDS.has(value)
}

const FOLLOW: Transition = { type: 'spring', damping: 60, stiffness: 500, mass: 1 }
const OFFSET = 20
const VARIANT_CHANGE: Transition = { type: 'spring', bounce: 0.2, duration: 0.4 }
const FADE: Transition = { type: 'tween', duration: 0.2 }

const CARD_W = 195
const CARD_H = 114
// Each service variant lays out its own four-image strip and shows slot n; switching
// variants slides the strip.
const SERVICE_STRIPS = {
  'service-1': [imgB, imgR, imgO, img9],
  'service-2': [imgW, imgPk, imgO, img9],
  'service-3': [imgW, imgR, imgPa, img9],
  'service-4': [imgW, imgR, imgO, imgQ],
} as const
const SERVICE_SLOT = { 'service-1': 0, 'service-2': 1, 'service-3': 2, 'service-4': 3 } as const

export function CustomCursor() {
  const enabled = useMediaQuery(`(any-hover: hover) and ${TEMPLATE_DESKTOP}`)
  return enabled ? <Follower /> : null
}

function readKind(x: number, y: number): Kind {
  const value = document.elementFromPoint(x, y)?.closest('[data-cursor]')?.getAttribute('data-cursor')
  return value && isKind(value) ? value : 'default'
}

function Follower() {
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const opacity = useMotionValue(0)
  const x = useTransform(useSpring(pointerX, FOLLOW), (v) => v + OFFSET)
  const y = useTransform(useSpring(pointerY, FOLLOW), (v) => v + OFFSET)
  const [kind, setKind] = useState<Kind>('default')

  useEffect(() => {
    let clientX = 0
    let clientY = 0
    let seen = false
    let frame = 0
    const resolve = () => {
      frame = 0
      setKind(readKind(clientX, clientY))
    }
    // the region under a still pointer changes while the page scrolls or reflows (an accordion opening)
    const schedule = () => {
      if (seen && !frame) frame = requestAnimationFrame(resolve)
    }
    function onMove(event: PointerEvent) {
      if (event.pointerType === 'touch') return
      seen = true
      clientX = event.clientX
      clientY = event.clientY
      pointerX.set(clientX)
      pointerY.set(clientY)
      animate(opacity, 1, FADE)
      schedule()
    }
    const hide = () => animate(opacity, 0, FADE)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    const reflow = new ResizeObserver(schedule)
    reflow.observe(document.body)
    document.documentElement.addEventListener('mouseleave', hide)
    window.addEventListener('blur', hide)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', schedule)
      reflow.disconnect()
      document.documentElement.removeEventListener('mouseleave', hide)
      window.removeEventListener('blur', hide)
    }
  }, [pointerX, pointerY, opacity])

  if (kind === 'none') return null
  const service = kind === 'default' || kind === 'blend' ? null : kind

  return (
    <motion.div
      aria-hidden="true"
      className={s.cursor}
      data-kind={service ? 'service' : kind}
      style={{ x, y, opacity }}
      // placement "right", alignment "center": the card's left edge sits at the pointer, centred vertically
      transformTemplate={(_, generated) => `translate(0%, -50%) ${generated}`}
      initial={false}
      animate={
        service
          ? { width: CARD_W, height: CARD_H, borderRadius: 10, rotate: 8 }
          : { width: 16, height: 16, borderRadius: 99, rotate: 0 }
      }
      transition={VARIANT_CHANGE}
    >
      {service && (
        <motion.div
          className={s.strip}
          style={{ x: '-50%' }}
          initial={false}
          animate={{ y: -CARD_H * SERVICE_SLOT[service] }}
          transition={VARIANT_CHANGE}
        >
          {SERVICE_STRIPS[service].map((src, i) => (
            <Picture key={i} src={src} alt="" sizes={`${CARD_W}px`} className={s.image} />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
