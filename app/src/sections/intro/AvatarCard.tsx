import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useMemo, useState, type RefObject } from 'react'
import back from '../../assets/images/avatar-card-back.jpeg?picture'
import front from '../../assets/images/avatar-card-front.png?picture'
import { HandWaveBadge } from '../../components/HandWaveBadge'
import { Picture } from '../../components/Picture'
import styles from './AvatarCard.module.css'
import { RESTING, useScrollTargets, type TransformTarget } from './useScrollTargets'
import { usePageBreakpoint } from './usePageBreakpoint'

// Scroll targets of the Avatar Wrap: tilt and half-flip while #service scrolls in, finish the
// flip (340° shows the front again) while #about scrolls in. Tablet override shrinks it.
const CARD_TARGETS: Record<'desktop' | 'tablet', { service: TransformTarget; about: TransformTarget }> = {
  desktop: {
    service: { opacity: 1, x: 340, scale: 0.9, rotate: 10, rotateY: 150 },
    about: { opacity: 1, x: 340, scale: 1, rotate: 5, rotateY: 340 },
  },
  tablet: {
    service: { opacity: 1, x: 200, scale: 0.85, rotate: 10, rotateY: 150 },
    about: { opacity: 1, x: 200, scale: 0.9, rotate: 5, rotateY: 340 },
  },
}
// The badge shrinks away while #service scrolls in.
const BADGE_GONE: TransformTarget = { opacity: 0, x: 0, scale: 0, rotate: 0, rotateY: 0 }

// A landscape photo cover-cropped into the portrait card: drawn 2.16× the card's height wide.
const FRONT_SIZES = '(max-width: 809.98px) 545px, (max-width: 1399.98px) 786px, 1028px'

// Optimized appear effect 43x9nz: flips up from rotateX -180 at scale 0.
const APPEAR = { type: 'spring', bounce: 0, duration: 1 } as const

/**
 * The sticky card shared by hero, service and about. Its transform combines the load-time
 * appear with the scroll-target effect the way Framer's withFX did: scales multiply,
 * rotations and offsets add. Phones get neither scroll effect.
 */
export function AvatarCard({
  serviceRef,
  aboutRef,
}: {
  serviceRef: RefObject<HTMLElement | null>
  aboutRef: RefObject<HTMLElement | null>
}) {
  const breakpoint = usePageBreakpoint()
  const scrollEnabled = breakpoint !== 'phone'
  const reduceMotion = useReducedMotion()

  const cardTargets = useMemo(() => {
    const t = CARD_TARGETS[breakpoint === 'tablet' ? 'tablet' : 'desktop']
    return [{ target: RESTING }, { ref: serviceRef, target: t.service }, { ref: aboutRef, target: t.about }]
  }, [breakpoint, serviceRef, aboutRef])
  const badgeTargets = useMemo(() => [{ target: RESTING }, { ref: serviceRef, target: BADGE_GONE }], [serviceRef])

  const card = useScrollTargets({ targets: cardTargets, threshold: 1, enabled: scrollEnabled })
  const badge = useScrollTargets({ targets: badgeTargets, threshold: 1, enabled: scrollEnabled })

  const appearRotateX = useMotionValue(reduceMotion ? 0 : -180)
  const appearScale = useMotionValue(reduceMotion ? 1 : 0)
  // The back photo only exists once the card has flipped in, so the load shows the front alone
  // and the back photo isn't downloaded until then.
  const [appeared, setAppeared] = useState(false)
  useEffect(() => {
    if (reduceMotion) {
      appearRotateX.jump(0)
      appearScale.jump(1)
      return
    }
    let cancelled = false
    const rotation = animate(appearRotateX, 0, APPEAR)
    const scaling = animate(appearScale, 1, { ...APPEAR, restDelta: 0.001 })
    Promise.all([rotation, scaling]).then(() => {
      if (!cancelled) setAppeared(true)
    })
    return () => {
      cancelled = true
      rotation.stop()
      scaling.stop()
    }
  }, [reduceMotion, appearRotateX, appearScale])
  const scale = useTransform(() => appearScale.get() * card.scale.get())

  return (
    <motion.div
      className={styles.wrap}
      style={{
        transformPerspective: 1200,
        x: card.x,
        scale,
        rotate: card.rotate,
        rotateX: appearRotateX,
        rotateY: card.rotateY,
      }}
    >
      <div className={styles.flip}>
        {appeared || reduceMotion ? (
          <Picture
            src={back}
            alt="Portrait of portfolio creator – back view"
            // cover-cropped: drawn at the card's height, 0.8 of that wide
            sizes="(max-width: 809.98px) 202px, (max-width: 1399.98px) 291px, 381px"
            className={`${styles.face} ${styles.back}`}
          />
        ) : (
          // while flipping in on rotateX, the card's reverse side shows the front photo upright
          <Picture src={front} alt="" sizes={FRONT_SIZES} className={`${styles.face} ${styles.appearBack}`} priority />
        )}
        <Picture
          src={front}
          alt="Portrait of portfolio creator – front view"
          sizes={FRONT_SIZES}
          className={`${styles.face} ${styles.front}`}
          priority
        />
      </div>
      <div className={styles.badgeSlot}>
        <motion.div className={styles.badgeMotion} style={{ opacity: badge.opacity, scale: badge.scale }}>
          <HandWaveBadge />
        </motion.div>
      </div>
    </motion.div>
  )
}
