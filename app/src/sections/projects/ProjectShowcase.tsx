import { motion } from 'motion/react'
import { useId, type ReactNode } from 'react'
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
  return (
    <motion.section
      id={id}
      className={`${styles.section} ${variant === 'long' ? styles.long : styles.short}`}
      aria-labelledby={headingId}
      initial={hidden}
      whileInView={shown}
      // plays the first time the section enters view, then stays put
      viewport={{ once: true, amount: 0 }}
      transition={appear}
    >
      <h2 id={headingId} className={`t-display ${styles.heading}`}>
        {title}
      </h2>
      <div className={styles.stage}>
        <Slideshow slides={slides} label={title} />
      </div>
    </motion.section>
  )
}
