export type ContactData = {
  name: string
  email: string
  message: string
}

/*
 * Backend: the Framer Forms endpoint the original site posted to. This reproduces the request
 * Framer's FormContainer sends (framer.dgx0rgcw.mjs, `nf()`): multipart FormData, a SHA-256
 * proof of work, the site id, and the field list. Swap this function to change backends.
 */
const FORM_URL = 'https://api.framer.com/forms/v1/forms/6d8451c9-a38b-41df-99cc-41e4a86d9b64/submit'
const FRAMER_SITE_ID = '397cb335d2a09726f47373c2ef3e7d112b05476ac2faa437db5061c85e47c43e'

// Proof-of-work parameters from Framer's runtime: sha256('framer' + secret) must start with '000'.
const POW_SALT = 'framer'
const POW_PREFIX = '000'
const POW_TOKEN_LENGTH = 30
const POW_MAX_MS = 10_000
const TOKEN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

// Framer renders 11 honeypot inputs and reports them as metadata fields; a human leaves all empty.
const HONEYPOT_FIELD_COUNT = 11
const HONEYPOT_VERSION = '3'
const moduleLoadedAt = Date.now()

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

function randomToken(length: number): string {
  const values = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(values, (v) => TOKEN_CHARS.charAt(v % TOKEN_CHARS.length)).join('')
}

async function proofOfWork(): Promise<string> {
  const start = performance.now()
  while (performance.now() - start < POW_MAX_MS) {
    const secret = `${Date.now()}:${randomToken(POW_TOKEN_LENGTH)}`
    if ((await sha256Hex(POW_SALT + secret)).startsWith(POW_PREFIX)) return secret
  }
  throw new Error('Failed to calculate proof of work')
}

export async function submitContact(data: ContactData): Promise<void> {
  const body = new FormData()
  body.append('Name', data.name)
  body.append('Email', data.email)
  body.append('How Can I Help You', data.message)
  body.append('__framer_0', '[]')
  body.append('__framer_1', String(HONEYPOT_FIELD_COUNT))
  body.append('__framer_2', '0')
  body.append('__framer_3', HONEYPOT_VERSION)
  body.append('__framer_4', FRAMER_SITE_ID)
  body.append('__framer_5', ((Date.now() - moduleLoadedAt) / 1000).toFixed(2))

  const response = await fetch(FORM_URL, {
    method: 'POST',
    body,
    headers: {
      'Framer-Site-Id': FRAMER_SITE_ID,
      'Framer-POW': await proofOfWork(),
      'Framer-Form-Fields': Array.from(new Set(body.keys()), encodeURIComponent).join(','),
    },
  })
  if (!response.ok) throw new Error(`Contact form submission failed (${response.status})`)
}
