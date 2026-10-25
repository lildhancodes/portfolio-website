import { sectionIds } from '../content/site'
import fitasticLogo from '../assets/images/experience/fitastic-digital-media.jpeg'
import duTodayLogo from '../assets/images/experience/du-today.jpeg'
import muzzleFlashLogo from '../assets/images/experience/muzzleflash-digital.jpeg'
import styles from './Experience.module.css'

const experiences = [
  {
    employer: 'MuzzleFlash Digital',
    logo: muzzleFlashLogo,
    location: 'Gurugram',
    dates: 'Nov 2025–Sep 2026',
    role: 'Senior Video Editor',
    companySide: 'right',
    responsibilities: [
      'Owned the end-to-end content pipeline for four B2B clients, shaping their YouTube and LinkedIn visual identity through publishing.',
      'Edited long-form videos, podcasts, explainers, reels, and branded content using storytelling, motion graphics, sound design, and color grading.',
      'Coordinated freelance editors, thumbnail designers, and writers through revisions, client approvals, quality control, and publishing deadlines.',
      'Contributed hands-on editing and edit reviews across the wider client portfolio.',
    ],
  },
  {
    employer: 'Fitastic Digital Media',
    logo: fitasticLogo,
    location: 'Pune',
    dates: 'Jan 2025–Nov 2025',
    role: 'Video Editor',
    companySide: 'left',
    responsibilities: [
      'Edited short- and long-form content, adapting pacing, storytelling, and visual treatment to different formats.',
      'Applied sound design, color grading, and motion graphics.',
    ],
  },
  {
    employer: 'Du.Today',
    logo: duTodayLogo,
    location: 'Delhi',
    dates: 'Feb 2024–Jun 2024',
    role: 'Video Editor',
    companySide: 'right',
    responsibilities: [
      'Edited digital content focused on narrative flow, pacing, and audience engagement.',
      'Refined visuals, sound, and graphics during post-production.',
    ],
  },
] as const

export function Experience() {
  return (
    <section id={sectionIds.experience} className={styles.section} aria-labelledby="experience-title">
      <header className={styles.header}>
        <p className={`t-label ${styles.eyebrow}`}>Career</p>
        <h2 id="experience-title" className="t-h2">Experience</h2>
      </header>
      <ol className={styles.timeline}>
        {experiences.map((experience) => (
          <li key={experience.employer} className={styles.entry} data-company-side={experience.companySide}>
            <div className={`${styles.column} ${styles.company}`}>
              <div className={styles.companyIdentity}>
                <img className={styles.logo} src={experience.logo} alt="" aria-hidden="true" />
                <h3>{experience.employer}</h3>
              </div>
              <p>{experience.location}</p>
              <p className={styles.dates}>{experience.dates}</p>
            </div>
            <span className={styles.node} aria-hidden="true" />
            <div className={`${styles.column} ${styles.role}`}>
              <h3>{experience.role}</h3>
              <ul>
                {experience.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
