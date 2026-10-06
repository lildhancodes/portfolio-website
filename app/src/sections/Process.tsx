import { Picture } from '../components/Picture'
import styles from './Process.module.css'
import { processTiles, type CardTone } from './process/steps'

const toneClass: Record<CardTone, string> = {
  inverse: styles.toneInverse,
  accent: styles.toneAccent,
  surface: styles.toneSurface,
}

// Rendered photo width: full content width on phone, two of four columns on tablet,
// one of three columns of the 1200px box on desktop.
const photoSizes = '(max-width: 809.98px) calc(86vw - 40px), (max-width: 1399.98px) calc(43vw - 50px), 360px'

/** Framer layer "Design": the five-step process grid. */
export function Process() {
  return (
    <section className={styles.section} aria-labelledby="process-title">
      <div className={styles.intro}>
        <h2 id="process-title" className="t-h2">
          From Raw to Remarkable
        </h2>
        <p className={`t-body ${styles.lead}`}>
          Every project deserves more than just cuts and transitions — it deserves personality. Here’s how I turn raw
          footage into something unforgettable.
        </p>
      </div>
      <div className={styles.grid}>
        {processTiles.map((tile) =>
          tile.kind === 'step' ? (
            <article key={tile.id} data-tile={tile.id} className={`${styles.card} ${toneClass[tile.tone]}`}>
              <p className={`t-h2 ${styles.cardInk}`}>{tile.number}</p>
              <div className={styles.cardText}>
                <h3 className={`t-h3 ${styles.cardInk}`}>{tile.title}</h3>
                <p className={`t-caption ${styles.cardInk}`}>{tile.text}</p>
              </div>
            </article>
          ) : (
            <div key={tile.id} data-tile={tile.id} className={styles.photo}>
              <Picture src={tile.src} alt={tile.alt} sizes={photoSizes} className={styles.photoImg} />
            </div>
          ),
        )}
      </div>
    </section>
  )
}
