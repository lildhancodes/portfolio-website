// Contact details and outbound links, shared by the nav, about, contact and footer.
// The Framer export's email/phone cards linked to template placeholders
// (designer@example.com, +1 555…); these are the real values the cards displayed.
export const site = {
  name: 'Dhanish Choubisa',
  handle: 'Lil Dhan',
  email: 'dhanish.work.one@gmail.com',
  phoneDisplay: '+91 8000590824',
  phoneHref: 'tel:+918000590824',
  whatsapp: 'https://walink.me/cz4a6z',
  instagram: 'https://www.instagram.com/lil.dhann',
  linkedin: 'https://www.linkedin.com/in/dhanish24sa/',
  resume: 'https://drive.google.com/file/d/1s9-SABoe0igAx2UOmUf94nSUzF1WjBnr/view?usp=drive_link',
} as const

/** Section anchors, same ids as the Framer page so old deep links (/#contact) still work. */
export const sectionIds = {
  hero: 'hero',
  service: 'service',
  about: 'about',
  technicalStack: 'technical-stack',
  longForm: 'long-form-project',
  experience: 'experience',
  contact: 'contact',
} as const
