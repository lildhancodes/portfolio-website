import { MotionConfig, motion, type Transition } from 'motion/react'
import { useEffect, useReducer, useState } from 'react'
import avatar from '../assets/images/avatar-thumb.jpeg?w=80;120&format=avif;webp;jpg&as=picture'
import { Picture } from '../components/Picture'
import { sectionIds, site } from '../content/site'
import s from './Nav.module.css'
import { setScrollLock } from './scroll'
import { TEMPLATE_DESKTOP, useHydrated, useMediaQuery } from './useMediaQuery'

/**
 * Framer "Nav" variants. Desktop (≥1200px) is open at rest and collapses to the
 * "Available for work" pill while scrolling down; tablet/phone is a pill with a menu toggle.
 */
type Variant = 'desktopOpen' | 'desktopClosed' | 'mobileClosed' | 'mobileOpen'
/** Framer "Avatar Status" variants: Only Avatar / Desktop / Available / Phone / Available. */
type AvatarMode = 'avatar' | 'desktop' | 'phone'

const NAV_SPRING: Transition = { type: 'spring', damping: 60, stiffness: 500, mass: 1 }
const AVATAR_SPRING: Transition = { type: 'spring', bounce: 0.2, duration: 0.4 }
// The avatar snaps into its "Available" layouts; only returning to "Only Avatar" springs.
const AVATAR_INSTANT: Transition = { duration: 0 }
const LINK_FLIP: Transition = { type: 'spring', bounce: 0, duration: 0.4 }
// "Available" holds 1s, then "Available Glow" grows the ring to 40px and fades it over 0.7s,
// holds until 1s has passed, then snaps back.
const GLOW_SCALE = 40 / 6
const GLOW: Transition = {
  duration: 2,
  times: [0, 0.5, 0.85, 1],
  ease: ['linear', [0.12, 0.23, 0.5, 1], 'linear'],
  repeat: Infinity,
}
// Framer's scroll-direction trigger ignores movements under 4px.
const SCROLL_DIRECTION_THRESHOLD = 4

const MENU_ID = 'site-nav-menu'
const SCROLL_LOCK = 'nav-menu'

type DesktopState = { closedByScroll: boolean; forcedOpen: boolean }
type DesktopAction = { type: 'scroll'; closed: boolean } | { type: 'open' }

function desktopReducer(state: DesktopState, action: DesktopAction): DesktopState {
  if (action.type === 'open') return state.forcedOpen ? state : { ...state, forcedOpen: true }
  // a new scroll direction always wins over a click-to-open, like Framer's variant prop reset
  return state.closedByScroll === action.closed ? state : { closedByScroll: action.closed, forcedOpen: false }
}

/** Framer `__framer__scrollDirection: { direction: 'down', target: 'Desktop / Closed' }`. */
function useDesktopCollapse(enabled: boolean) {
  const [state, dispatch] = useReducer(desktopReducer, { closedByScroll: false, forcedOpen: false })

  useEffect(() => {
    if (!enabled) return
    let previous: number | undefined
    let direction: 'up' | 'down' | undefined
    let directionStart = 0
    function onScroll() {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (y > max || y < 0) return // overscroll bounce
      const next = y < (previous ?? 0) ? 'up' : 'down'
      previous = y
      if (next !== direction) {
        direction = next
        directionStart = y
        return
      }
      if (Math.abs(y - directionStart) < SCROLL_DIRECTION_THRESHOLD) return
      dispatch({ type: 'scroll', closed: next === 'down' })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      dispatch({ type: 'scroll', closed: false })
    }
  }, [enabled])

  return { closed: state.closedByScroll && !state.forcedOpen, open: () => dispatch({ type: 'open' }) }
}

export function Nav() {
  const isDesktop = useMediaQuery(TEMPLATE_DESKTOP)
  // The breakpoint is unknown when the HTML is prerendered, so the static HTML carries both
  // variants and CSS shows the right one until React hydrates and takes over.
  if (!useHydrated()) {
    return (
      <>
        <div className={s.prerenderDesktop}>
          <NavBar isDesktop />
        </div>
        <div className={s.prerenderMobile}>
          <NavBar isDesktop={false} />
        </div>
      </>
    )
  }
  return <NavBar isDesktop={isDesktop} />
}

function NavBar({ isDesktop }: { isDesktop: boolean }) {
  const desktop = useDesktopCollapse(isDesktop)
  const [menuOpen, setMenuOpen] = useState(false)

  const variant: Variant = isDesktop
    ? desktop.closed
      ? 'desktopClosed'
      : 'desktopOpen'
    : menuOpen
      ? 'mobileOpen'
      : 'mobileClosed'
  const mobileMenuOpen = variant === 'mobileOpen'

  useEffect(() => {
    if (!mobileMenuOpen) return
    setScrollLock({ reason: SCROLL_LOCK, locked: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      setScrollLock({ reason: SCROLL_LOCK, locked: false })
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileMenuOpen])

  const closeMenu = mobileMenuOpen ? () => setMenuOpen(false) : undefined
  const avatarMode: AvatarMode = variant === 'desktopClosed' ? 'desktop' : variant === 'mobileClosed' ? 'phone' : 'avatar'

  return (
    <MotionConfig transition={NAV_SPRING}>
      <motion.div className={s.anchor} layoutRoot>
        <motion.nav
          layout
          layoutDependency={variant}
          aria-label="Main"
          className={`${s.nav} ${s[variant]}`}
          style={{ borderRadius: 28 }}
        >
          <motion.div layout layoutDependency={variant} className={s.head}>
            <motion.div layout layoutDependency={variant} className={s.avatarSlot}>
              <AvatarStatus
                mode={avatarMode}
                onAvailableClick={variant === 'desktopClosed' ? desktop.open : undefined}
              />
            </motion.div>
            {!isDesktop && (
              <motion.button
                layout
                layoutDependency={variant}
                type="button"
                className={s.toggle}
                style={{ borderRadius: 99 }}
                aria-expanded={mobileMenuOpen}
                aria-controls={mobileMenuOpen ? MENU_ID : undefined}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <motion.span
                  layout
                  layoutDependency={variant}
                  className={`${s.line} ${s.lineTop}`}
                  initial={false}
                  animate={{ rotate: mobileMenuOpen ? 45 : 0 }}
                />
                <motion.span
                  layout
                  layoutDependency={variant}
                  className={`${s.line} ${s.lineBottom}`}
                  initial={false}
                  animate={{ rotate: mobileMenuOpen ? -45 : 0 }}
                />
              </motion.button>
            )}
          </motion.div>

          {variant !== 'mobileClosed' && (
            <motion.div
              id={MENU_ID}
              layout
              layoutDependency={variant}
              className={s.menu}
              initial={false}
              animate={{ opacity: variant === 'desktopClosed' ? 0 : 1 }}
              style={{ originX: 0 }}
              // keyboard users tabbing into the collapsed links get the open nav back
              onFocus={variant === 'desktopClosed' ? desktop.open : undefined}
            >
              <motion.ul layout layoutDependency={variant} className={s.links}>
                <li>
                  <NavLink href={`#${sectionIds.hero}`} label="Home" flip={isDesktop} onClick={closeMenu} />
                </li>
                <li>
                  <NavLink href={`#${sectionIds.longForm}`} label="Projects" flip={isDesktop} onClick={closeMenu} />
                </li>
                <li>
                  <NavLink href={site.resume} label="Resume" flip={isDesktop} onClick={closeMenu} external />
                </li>
              </motion.ul>
              <motion.div layout layoutDependency={variant} className={s.contactSlot}>
                <ContactButton onClick={closeMenu} />
              </motion.div>
            </motion.div>
          )}
        </motion.nav>
      </motion.div>
    </MotionConfig>
  )
}

function AvatarStatus({ mode, onAvailableClick }: { mode: AvatarMode; onAvailableClick?: () => void }) {
  return (
    <MotionConfig transition={mode === 'avatar' ? AVATAR_SPRING : AVATAR_INSTANT}>
      <motion.div layout layoutDependency={mode} className={s.avatarStatus}>
        <motion.div layout layoutDependency={mode} className={s.avatar} style={{ borderRadius: 99 }}>
          <Picture src={avatar} alt="Portfolio Creator Avatar" sizes="40px" />
        </motion.div>
        {mode !== 'avatar' && (
          <motion.div layout layoutDependency={mode} className={s.status}>
            <NavLink
              href={`#${sectionIds.contact}`}
              label="Available for work"
              flip={mode === 'desktop'}
              onClick={onAvailableClick}
            />
            <span className={s.dot} />
            <motion.span
              className={s.glow}
              aria-hidden="true"
              style={{ x: '-50%', y: '-50%' }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: [1, 1, GLOW_SCALE, GLOW_SCALE], opacity: [0.5, 0.5, 0, 0] }}
              transition={GLOW}
            />
          </motion.div>
        )}
      </motion.div>
    </MotionConfig>
  )
}

type NavLinkProps = {
  href: string
  label: string
  /** Desktop links roll over to an accent copy on hover; tablet/phone links don't. */
  flip: boolean
  onClick?: () => void
  external?: boolean
}

function NavLink({ href, label, flip, onClick, external = false }: NavLinkProps) {
  return (
    <motion.a
      href={href}
      className={s.link}
      data-flip={flip || undefined}
      initial={false}
      animate="rest"
      whileHover={flip ? 'hover' : undefined}
      onClick={onClick}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      <motion.span
        className={s.roll}
        variants={{ rest: { rotateX: 0 }, hover: { rotateX: -90 } }}
        transition={LINK_FLIP}
        style={{ originY: 0, transformPerspective: 1200 }}
      >
        <span className={`t-muted ${s.linkText}`}>{label}</span>
        {flip && (
          <span className={`t-muted ${s.linkText} ${s.linkBack}`} aria-hidden="true">
            {label}
          </span>
        )}
      </motion.span>
    </motion.a>
  )
}

/** Framer "Secondary Button": a 20px accent dot below the corner grows to fill on hover. */
function ContactButton({ onClick }: { onClick?: () => void }) {
  return (
    <motion.a
      href={`#${sectionIds.contact}`}
      className={s.contact}
      data-cursor="blend"
      initial={false}
      animate="rest"
      whileHover="hover"
      onClick={onClick}
    >
      <motion.span className={s.contactFill} variants={{ rest: { scale: 1 / 9 }, hover: { scale: 1 } }} />
      <span className={`t-muted ${s.contactText}`}>Contact</span>
    </motion.a>
  )
}
