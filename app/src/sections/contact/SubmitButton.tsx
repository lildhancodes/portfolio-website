import { motion } from 'motion/react'
import spinnerMask from '../../assets/images/spinner-conic.svg'
import styles from './SubmitButton.module.css'

export type FormStatus = 'idle' | 'pending' | 'success' | 'error'

const label: Record<FormStatus, string | null> = {
  idle: 'Submit',
  pending: null,
  success: 'Thank you',
  error: 'Something went wrong',
}

const maskStyle = { maskImage: `url(${spinnerMask})`, WebkitMaskImage: `url(${spinnerMask})` }

/** Framer "Button 2": outlined accent pill whose variants follow the form state. */
export function SubmitButton({ status }: { status: FormStatus }) {
  const text = label[status]
  return (
    <button type="submit" className={styles.button} data-status={status} aria-disabled={status === 'pending'}>
      {text === null ? (
        <span className={styles.spinner} style={maskStyle} role="img" aria-label="Sending">
          <motion.span
            className={styles.conic}
            style={maskStyle}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
          >
            <span className={styles.rounding} />
          </motion.span>
        </span>
      ) : (
        <span className={status === 'idle' ? `t-h4 ${styles.label}` : styles.message}>{text}</span>
      )}
    </button>
  )
}
