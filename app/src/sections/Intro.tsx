import { useRef } from 'react'
import { About } from './intro/About'
import { AvatarCard } from './intro/AvatarCard'
import { Hero } from './intro/Hero'
import styles from './intro/Intro.module.css'
import { Service } from './intro/Service'

/**
 * Hero, service and about scroll over one sticky avatar card (Framer "OutterWraper"). The card
 * reads the service and about sections' positions to drive its scroll-linked flip.
 */
export function Intro() {
  const serviceRef = useRef<HTMLElement>(null)
  const aboutRef = useRef<HTMLElement>(null)
  return (
    <div className={styles.intro}>
      <div className={styles.stickyWrap}>
        <div className={styles.stickyContainer}>
          <AvatarCard serviceRef={serviceRef} aboutRef={aboutRef} />
        </div>
      </div>
      <div className={styles.content}>
        <Hero />
        <Service ref={serviceRef} />
        <About ref={aboutRef} />
      </div>
    </div>
  )
}
