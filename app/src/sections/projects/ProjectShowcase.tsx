import { useInView } from 'motion/react'
import { useId, useRef, type ReactNode } from 'react'
import { Slideshow } from '../../components/Slideshow'
import styles from './ProjectShowcase.module.css'

type Props = {
  id?: string
  title: string
  variant: 'long' | 'short'
  slides: readonly { key: string; node: ReactNode }[]
}

export function ProjectShowcase({ id, title, variant, slides }: Props) {
  const headingId = useId()
  const sectionRef = useRef<HTMLElement>(null)
  const sectionVisible = useInView(sectionRef, { once: true, amount: 0.1 })

  const contents = (
    <>
      <h2 id={headingId} className={`t-display ${styles.heading}`}>
        {title}
      </h2>
      <div className={styles.stage}>
        <Slideshow slides={slides} label={title} effect={variant === 'long' ? 'depth' : 'depth-short'} />
      </div>
    </>
  )

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`${styles.section} ${variant === 'long' ? styles.long : styles.short} ${sectionVisible ? styles.visible : ''}`}
      aria-labelledby={headingId}
    >
      {contents}
    </section>
  )
}
