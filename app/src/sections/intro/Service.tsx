import { motion } from 'motion/react'
import { useId, useState, type Ref } from 'react'
import { sectionIds } from '../../content/site'
import styles from './Service.module.css'
import { usePageBreakpoint } from './usePageBreakpoint'

const SERVICES = [
  {
    title: '1. Video Editing',
    bullets: [
      'Edits with rhythm, flow, and zero dead air',
      'Every cut pushes the story forward, not just the timeline',
      'Transitions that feel smooth, not slapped on',
      'Smart use of new tools when they actually add value',
    ],
  },
  {
    title: '2. Sound Design',
    bullets: [
      'Designing soundscapes that pull viewers in',
      'Clearing out hisses, hums, and all the junk nobody wants to hear',
      'Balancing dialogue, music, and effects so nothing fights',
      'Video is 60% audio, 40% visual — that’s why sound leads the way',
    ],
  },
  {
    title: '3. Color Grading',
    bullets: [
      'Transforming flat shots into frames that breathe',
      'Matching tones so every scene feels seamless',
      'Using color to set mood — bold, warm, or razor-clean',
      'No orange faces, no washed-out vibes — just consistent style',
    ],
  },
  {
    title: '4. Motion graphic',
    bullets: [
      'Titles, graphics, and transitions that feel alive',
      'Motion that enhances the story instead of hijacking it',
      'Turning explainers into smooth, stylish flows',
      'Snappy animations built to keep attention locked',
    ],
  },
] as const

// Framer layout transition of the accordion variants
const SPRING = { type: 'spring', stiffness: 500, damping: 60, mass: 1 } as const

export function Service({ ref }: { ref: Ref<HTMLElement> }) {
  return (
    <section id={sectionIds.service} ref={ref} className={styles.service}>
      <div className={styles.container}>
        <div className={styles.column}>
          <div className={styles.textWrap}>
            <h2 className="t-h2">what I can do for you</h2>
            <p className={`t-body ${styles.lead}`}>
              I turn silence into soundscapes, flat shots into color, and motion into stories you can’t skip.
            </p>
          </div>
          <ServiceAccordions />
        </div>
      </div>
    </section>
  )
}

/** Framer "Service Accordion Wrap": at most one service open at a time. */
function ServiceAccordions() {
  const [open, setOpen] = useState<number | null>(null)
  // only the desktop variant wires the hover image cursors (CustomCursor reads data-cursor)
  const withCursor = usePageBreakpoint() === 'desktop'
  return (
    <div className={styles.accordions}>
      {SERVICES.map((service, index) => (
        <ServiceAccordion
          key={service.title}
          title={service.title}
          bullets={service.bullets}
          open={open === index}
          cursor={withCursor ? `service-${index + 1}` : undefined}
          onToggle={() => setOpen((current) => (current === index ? null : index))}
        />
      ))}
    </div>
  )
}

function ServiceAccordion({
  title,
  bullets,
  open,
  cursor,
  onToggle,
}: {
  title: string
  bullets: readonly string[]
  open: boolean
  cursor: string | undefined
  onToggle: () => void
}) {
  const panelId = useId()
  return (
    // the whole card toggles, like Framer's onTap; the button carries keyboard and AT semantics
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <motion.div
      className={styles.accordion}
      data-open={open}
      onClick={onToggle}
      initial={false}
      animate={{ paddingBottom: open ? 20 : 0 }}
      transition={SPRING}
    >
      <h3 className={styles.heading}>
        <button
          type="button"
          className={styles.top}
          aria-expanded={open}
          aria-controls={panelId}
          data-cursor={cursor}
        >
          <span className={`t-h3 ${styles.title}`}>{title}</span>
          <motion.svg
            className={styles.chevron}
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.5"
            aria-hidden="true"
            initial={false}
            animate={{ rotate: open ? 0 : 180 }}
            transition={SPRING}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </button>
      </h3>
      <motion.ul
        id={panelId}
        className={styles.bottom}
        aria-hidden={!open}
        initial={false}
        animate={{ height: open ? 'auto' : 1 }}
        transition={SPRING}
      >
        {bullets.map((bullet) => (
          <li key={bullet} className={styles.bullet}>
            <svg className={styles.check} viewBox="0 0 24 24" fill="none" strokeWidth="1.5" aria-hidden="true">
              <path d="M7 12.5l3 3 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className={`t-body ${styles.bulletText}`}>{bullet}</p>
          </li>
        ))}
      </motion.ul>
    </motion.div>
  )
}
