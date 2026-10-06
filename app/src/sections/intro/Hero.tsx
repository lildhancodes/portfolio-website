import { motion } from 'motion/react'
import { sectionIds } from '../../content/site'
import styles from './Hero.module.css'

// Optimized appear effects bmwyn / 14gfby1: each half slides in toward the centre.
const APPEAR = { type: 'spring', bounce: 0, duration: 1, delay: 0.3 } as const
const SETTLED = { opacity: 1, x: 0 }

export function Hero() {
  return (
    <section id={sectionIds.hero} className={styles.hero}>
      <div className={styles.container}>
        <motion.div className={styles.left} initial={{ opacity: 0.001, x: 150 }} animate={SETTLED} transition={APPEAR}>
          <div className={styles.headingWrap}>
            <div className={styles.nameWrap}>
              <p className={`t-h3 ${styles.name}`}>Dhanish Choubisa</p>
            </div>
            <h1 className={`t-display ${styles.word}`}>
              Visual<span className="visually-hidden"> alchemist</span>
            </h1>
          </div>
        </motion.div>
        <motion.div className={styles.right} initial={{ opacity: 0.001, x: -150 }} animate={SETTLED} transition={APPEAR}>
          <div className={styles.rightWrap}>
            <p className={`t-display ${styles.word}`} aria-hidden="true">
              alchemist
            </p>
            <div className={styles.introWrap}>
              <p className={`t-body ${styles.intro}`}>
                I am India-based video-editor, sound designer, color-grader and motion graphic artist.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
