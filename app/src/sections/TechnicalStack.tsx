import { useEffect, useRef, useState } from 'react'
import { sectionIds } from '../content/site'
import styles from './TechnicalStack.module.css'

const tools = [
  { name: 'After Effects', mark: 'Ae', tone: 'afterEffects' },
  { name: 'Premiere Pro', mark: 'Pr', tone: 'premiere' },
  { name: 'Photoshop', mark: 'Ps', tone: 'photoshop' },
  { name: 'Illustrator', mark: 'Ai', tone: 'illustrator' },
  { name: 'Audition', mark: 'Au', tone: 'audition' },
  { name: 'Figma', mark: 'figma', tone: 'figma' },
  { name: 'Generative AI Workflow', mark: 'sparkle', tone: 'generative' },
] as const

function AppMark({ mark, tone, id }: { mark: string; tone: string; id: string }) {
  return (
    <svg className={`${styles.mark} ${styles[tone]}`} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`tile-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity=".22" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".04" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="13" fill={`url(#tile-${id})`} stroke="currentColor" strokeOpacity=".72" strokeWidth="2" />
      {mark === 'figma' ? <FigmaMark /> : mark === 'sparkle' ? <SparkleMark /> : (
        <text x="32" y="41" textAnchor="middle" className={styles.letterMark}>{mark}</text>
      )}
    </svg>
  )
}

function FigmaMark() {
  return (
    <g transform="translate(19 13) scale(.72)">
      <path fill="#f24e1e" d="M18 0H9a9 9 0 0 0 0 18h9z" />
      <path fill="#ff7262" d="M18 0h9a9 9 0 0 1 0 18h-9z" />
      <path fill="#a259ff" d="M9 18a9 9 0 0 0 0 18h9V18z" />
      <circle cx="27" cy="27" r="9" fill="#1abcfe" />
      <path fill="#0acf83" d="M9 36a9 9 0 0 0 0 18h9V36z" />
    </g>
  )
}

function SparkleMark() {
  return (
    <g fill="currentColor">
      <path d="m32 11 5.1 15.9L53 32l-15.9 5.1L32 53l-5.1-15.9L11 32l15.9-5.1z" />
      <path d="m49 8 1.8 5.2L56 15l-5.2 1.8L49 22l-1.8-5.2L42 15l5.2-1.8z" />
    </g>
  )
}

export function TechnicalStack() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || reducedMotion) return

    const frontTiles = Array.from(stage.querySelectorAll<HTMLElement>('[data-wave-visual="front"]'))
    const backTiles = Array.from(stage.querySelectorAll<HTMLElement>('[data-wave-visual="back"]'))
    const controls = Array.from(stage.querySelectorAll<HTMLElement>('[data-wave-control]'))
    let frame = 0
    let lastTime = 0
    let progress = 0
    let width = 0
    let height = 0
    let headingHalfWidth = 0
    let headingHalfHeight = 0
    const title = stage.querySelector<HTMLElement>('#technical-stack-title')
    const resize = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === stage) {
          width = entry.contentRect.width
          height = entry.contentRect.height
        } else if (entry.target === title) {
          headingHalfWidth = entry.contentRect.width / 2
          headingHalfHeight = entry.contentRect.height / 2
        }
      }
    })
    resize.observe(stage)
    if (title) resize.observe(title)

    const animate = (time: number) => {
      if (lastTime) progress = (progress + (time - lastTime) / 24000) % 1
      lastTime = time
      const centerY = height / 2
      const tileSize = width < 810 ? 44 : width < 1400 ? 54 : 62
      const waveHeight = Math.min(height * 0.22, width < 600 ? 48 : 64)
      const edgePad = width >= 1400 ? 0 : Math.min(width * 0.05, width < 600 ? 18 : 28)
      const travel = Math.max(1, width - tileSize - edgePad * 2)

      controls.forEach((control, index) => {
        const u = (progress + index / controls.length) % 1
        const localX = edgePad + u * travel
        const waveY = Math.sin(u * Math.PI * 4) * waveHeight
        const tileCenterX = localX + tileSize / 2
        const headingReach = headingHalfWidth + tileSize / 2
        const horizontalProximity = Math.max(0, 1 - Math.abs(tileCenterX - width / 2) / headingReach)
        const verticalReach = headingHalfHeight + tileSize / 2
        const verticalProximity = Math.max(0, 1 - Math.abs(waveY) / verticalReach)
        const smooth = (value: number) => value * value * (3 - 2 * value)
        const crossingStrength = smooth(horizontalProximity) * smooth(verticalProximity)
        // CSS y grows downward, so a visually rising pass has a negative sine derivative.
        const isRising = Math.cos(u * Math.PI * 4) < 0
        const localY = centerY + waveY - tileSize / 2
        const opacity = String(Math.max(0, Math.min(1, u / 0.035, (1 - u) / 0.035)))
        const isInFront = crossingStrength > 0.015 && isRising
        const place = (item: HTMLElement) => {
          item.style.left = `${localX}px`
          item.style.top = `${localY}px`
          item.style.opacity = opacity
        }
        place(control)
        place(frontTiles[index])
        place(backTiles[index])
        frontTiles[index].style.visibility = isInFront ? 'visible' : 'hidden'
        backTiles[index].style.visibility = isInFront ? 'hidden' : 'visible'
      })
      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
    }
  }, [reducedMotion])

  return (
    <section id={sectionIds.technicalStack} className={styles.section} aria-labelledby="technical-stack-title">
      <div ref={stageRef} className={styles.stage} data-static={reducedMotion}>
        <h2 id="technical-stack-title" className={`t-h2 ${styles.title}`}>TECHNICAL SKILL</h2>
        <div className={styles.track}>
          <div className={`${styles.layer} ${styles.backLayer}`} aria-hidden="true">
            {tools.map(({ name, mark, tone }) => (
              <div key={name} className={styles.item} data-wave-visual="back">
                <div className={`${styles.tile} ${highlighted === name || selected === name ? styles.highlightedTile : ''}`}>
                  <AppMark mark={mark} tone={tone} id={`${tone}-back`} />
                </div>
              </div>
            ))}
          </div>
          <div className={`${styles.layer} ${styles.frontLayer}`} aria-hidden="true">
            {tools.map(({ name, mark, tone }) => (
              <div key={name} className={styles.item} data-wave-visual="front">
                <div className={`${styles.tile} ${highlighted === name || selected === name ? styles.highlightedTile : ''}`}>
                  <AppMark mark={mark} tone={tone} id={`${tone}-front`} />
                </div>
              </div>
            ))}
          </div>
          <ul className={styles.controls} aria-label="Software used">
            {tools.map(({ name }) => (
              <li key={name} className={styles.controlItem} data-wave-control="">
                <button
                  type="button"
                  className={styles.hitTarget}
                  aria-label={name}
                  aria-pressed={selected === name}
                  onClick={() => setSelected(selected === name ? null : name)}
                  onMouseEnter={() => setHighlighted(name)}
                  onMouseLeave={() => setHighlighted((current) => current === name ? null : current)}
                  onFocus={() => setHighlighted(name)}
                  onBlur={() => setHighlighted((current) => current === name ? null : current)}
                >
                  <span className={styles.label}>{name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
