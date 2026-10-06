import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useRef, type Ref } from 'react'
import { sectionIds, site } from '../../content/site'
import styles from './About.module.css'

const STATS = [
  { end: 2, suffix: '', label: 'Year of Experience' },
  { end: 120, suffix: '+', label: 'Completed Projects' },
  { end: 3, suffix: 'M+', label: 'Views' },
] as const

export function About({ ref }: { ref: Ref<HTMLElement> }) {
  return (
    <section id={sectionIds.about} ref={ref} className={styles.about}>
      <div className={styles.container}>
        <div className={styles.aboutWrap}>
          <div className={styles.textWrap}>
            <h2 className="t-h2">About me</h2>
            <p className={`t-body ${styles.bio}`}>
              I’m <strong>Dhanish Choubisa</strong> — I started editing when everything else felt like noise. Now I cut,
              grade, and design sound to turn raw clips into stories that slap.
            </p>
          </div>

          <div className={styles.stats}>
            {STATS.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <Counter end={stat.end} suffix={stat.suffix} />
                <p className={`t-label ${styles.statLabel}`}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div className={styles.contacts}>
            <a className={styles.contact} href={site.phoneHref}>
              <span className={`t-label ${styles.contactLabel}`}>Call Today :</span>
              <span className={`t-body ${styles.phone}`}>{site.phoneDisplay}</span>
            </a>
            <a className={styles.contact} href={`mailto:${site.email}`}>
              <span className={`t-label ${styles.contactLabel}`}>Email :</span>
              <span className={`t-body ${styles.email}`}>{site.email}</span>
            </a>
          </div>

          <div className={styles.socials}>
            <a className={styles.social} href={site.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg viewBox="0 0 256 256" aria-hidden="true">
                <path d="M152.58,145.23l23,11.48A24,24,0,0,1,152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155ZM232,128A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-40,24a8,8,0,0,0-4.42-7.16l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88A40,40,0,0,0,192,152Z" />
              </svg>
            </a>
            <a className={styles.social} href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 256 256" aria-hidden="true">
                <path d="M176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24ZM128,176a48,48,0,1,1,48-48A48.05,48.05,0,0,1,128,176Zm60-96a12,12,0,1,1,12-12A12,12,0,0,1,188,80Zm-28,48a32,32,0,1,1-32-32A32,32,0,0,1,160,128Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// Framer "Animated Number Counter": counts up whenever the number scrolls into view and resets
// when it leaves (trigger layerInView, replay on).
const COUNT = { type: 'spring', bounce: 0, duration: 1 } as const
const formatCount = (value: number) => value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

function Counter({ end, suffix }: { end: number; suffix: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const inView = useInView(ref, { amount: 'some' })
  const reduceMotion = useReducedMotion()
  const count = useMotionValue(0)
  const text = useTransform(count, (value) => `${formatCount(value)}${suffix}`)

  useEffect(() => {
    if (!inView) {
      count.jump(0)
      return
    }
    if (reduceMotion) {
      count.jump(end)
      return
    }
    const controls = animate(count, end, COUNT)
    return () => controls.stop()
  }, [inView, end, reduceMotion, count])

  // The invisible final value sizes the box so the width never jitters while counting;
  // it is also what assistive tech reads.
  return (
    <h3 ref={ref} className={styles.number}>
      <span className={styles.numberSizer}>
        {formatCount(end)}
        {suffix}
      </span>
      <motion.span className={styles.numberValue} aria-hidden="true">
        {text}
      </motion.span>
    </h3>
  )
}
