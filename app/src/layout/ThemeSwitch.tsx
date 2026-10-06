import { motion, type Transition } from 'motion/react'
import { useTheme } from '../hooks/useTheme'
import s from './ThemeSwitch.module.css'

// Framer theme switch at switchSize 40: 40×20 track, 15px knob inset 2.5px. The knob slid
// with motion's default tween for `left` (0.3s); x is the transform equivalent.
const KNOB_TRAVEL = 40 - 15 - 2 * 2.5
const SLIDE: Transition = { type: 'tween', duration: 0.3, ease: [0.25, 0.1, 0.35, 1] }

export function ThemeSwitch() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <div className={s.dock}>
      <button type="button" className={s.track} aria-label="Dark mode" aria-pressed={dark} onClick={toggle}>
        <motion.span className={s.knob} initial={false} animate={{ x: dark ? 0 : KNOB_TRAVEL }} transition={SLIDE} />
      </button>
    </div>
  )
}
