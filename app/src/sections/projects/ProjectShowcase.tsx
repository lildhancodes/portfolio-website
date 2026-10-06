import { motion, useInView } from 'motion/react'
import { useId, useRef, type ReactNode } from 'react'
import { Slideshow } from '../../components/Slideshow'
import styles from './ProjectShowcase.module.css'

// Framer appear effect shared by both slideshow sections (enter = animation5, exit = animation6,
// transition3): scale up from half size with an overshooting tween, triggered at threshold 0.
const hidden = { opacity: 0, scale: 0.5 }
const shown = { opacity: 1, scale: 1 }
const appear = { type: 'tween', duration: 0.4, delay: 0, ease: [0.75, -0.97, 0.45, 1.9] } as const

type Props = {
  id?: string
  title: string
  variant: 'long' | 'short'
  slides: readonly { key: string; node: ReactNode }[]
}

export function ProjectShowcase({ id, title, variant, slides }: Props) {
  const headingId = useId()
  const shortSectionRef = useRef<HTMLElement>(null)
  const shortSectionVisible = useInView(shortSectionRef, { once: true, amount: 0.1 })

  const contents = (
    <>
      <h2 id={headingId} className={`t-display ${styles.heading}`}>
        {title}
      </h2>
      <div className={styles.stage}>
        <Slideshow slides={slides} label={title} />
      </div>
    </>
  )

  if (variant === 'short') {
    return (
      <section
        ref={shortSectionRef}
        id={id}
        className={`${styles.section} ${styles.short} ${shortSectionVisible ? styles.shortVisible : ''}`}
        aria-labelledby={headingId}
      >
        {contents}
      </section>
    )
  }

  return (
    <motion.section
      id={id}
      className={`${styles.section} ${styles.long}`}
      aria-labelledby={headingId}
      initial={hidden}
      whileInView={shown}
      // plays the first time the section enters view, then stays put
      viewport={{ once: true, amount: 0 }}
      transition={appear}
    >
      {contents}
    </motion.section>
  )
}
