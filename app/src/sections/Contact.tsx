import { useState, type FormEvent } from 'react'
import avatar from '../assets/images/contact-avatar.png?picture'
import { HandWaveBadge } from '../components/HandWaveBadge'
import { Picture } from '../components/Picture'
import { sectionIds } from '../content/site'
import styles from './Contact.module.css'
import { SubmitButton, type FormStatus } from './contact/SubmitButton'
import { submitContact } from './contact/submitContact'

const statusMessage: Record<FormStatus, string> = {
  idle: '',
  pending: 'Sending your message…',
  success: 'Thank you, your message was sent.',
  error: 'Something went wrong. Please try again.',
}

function field(form: FormData, name: string): string {
  const value = form.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

export function Contact() {
  const [status, setStatus] = useState<FormStatus>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'pending') return
    const form = new FormData(event.currentTarget)
    setStatus('pending')
    // a bot filled the hidden field: look successful, send nothing
    if (field(form, 'website') !== '') {
      setStatus('success')
      return
    }
    try {
      await submitContact({ name: field(form, 'name'), email: field(form, 'email'), message: field(form, 'message') })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  // Like Framer's form, editing after a result returns the button to its default state.
  function handleChange() {
    if (status === 'success' || status === 'error') setStatus('idle')
  }

  return (
    <section id={sectionIds.contact} className={styles.section} aria-labelledby="contact-title">
      <div className={styles.container}>
        <div className={styles.avatarColumn}>
          <div className={styles.avatarWrap}>
            <Picture
              src={avatar}
              alt="Portrait of portfolio creator"
              sizes="(max-width: 809.98px) 180px, (max-width: 1399.98px) 260px, 340px"
              className={styles.avatar}
            />
            <div className={styles.badge}>
              <HandWaveBadge className={styles.badgeFill} />
            </div>
          </div>
        </div>

        <div className={styles.contactColumn}>
          <h2 id="contact-title" className="t-h2">
            Let's work together
          </h2>
          <p className={`t-body ${styles.lead}`}>
            Let’s craft brilliance together—whether it’s your next big job or a wild creative project, drop your pitch
            and let’s make it happen!
          </p>
          <form className={styles.form} onSubmit={handleSubmit} onChange={handleChange}>
            <div className={styles.row}>
              <label className={styles.field}>
                <span className={`t-caption ${styles.label}`}>Name</span>
                <input className={styles.input} name="name" type="text" placeholder="Jane Smith" autoComplete="name" required />
              </label>
              <label className={styles.field}>
                <span className={`t-caption ${styles.label}`}>Email</span>
                <input
                  className={styles.input}
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  autoComplete="email"
                  required
                />
              </label>
            </div>
            <label className={styles.field}>
              <span className={`t-caption ${styles.label}`}>How Can I Help You</span>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                name="message"
                placeholder="Hello, I'd like to enquire about..."
                required
              />
            </label>
            <input className={styles.trap} name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <SubmitButton status={status} />
            <p className="visually-hidden" role="status">
              {statusMessage[status]}
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
