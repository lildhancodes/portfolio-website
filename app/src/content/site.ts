// Contact details and outbound links, shared by the nav, about, contact and footer.
// The Framer export's email/phone cards linked to template placeholders
// (designer@example.com, +1 555…); these are the real values the cards displayed.
export const site = {
  name: 'Dhanish Choubisa',
  handle: 'Lil Dhan',
  email: 'dhanish.work.one@gmail.com',
  phoneDisplay: '+91 8000590824',
  phoneHref: 'tel:+918000590824',
  whatsapp: 'https://wa.link/ytk87y',
  instagram: 'https://www.instagram.com/lil.dhann',
  resume: 'https://drive.google.com/file/d/1Pnz8YP5D95kw2RqP0JBK4eiztb_5Unsp/view?usp=drive_link',
} as const

/** Section anchors, same ids as the Framer page so old deep links (/#contact) still work. */
export const sectionIds = {
  hero: 'hero',
  service: 'service',
  about: 'about',
  longForm: 'long-form-project',
  contact: 'contact',
} as const
