// The two project slideshows, in the Framer page's slide order. `name` is the Framer layer name
// (handy for cross-checking against the export); `title` and `channel` come from YouTube oEmbed.
export type YouTubeVideo = {
  id: string
  name: string
  title: string
  channel: string
}

export type LongFormVideo = YouTubeVideo & {
  /** False when YouTube has no 1280×720 thumbnail for the video (maxresdefault 404s). */
  hasMaxRes: boolean
}

export const longFormVideos: readonly LongFormVideo[] = [
  { id: 'RSRNfhGFyFs', name: 'Showreel', title: 'FDM showreel', channel: 'Lil Dhan', hasMaxRes: true },
  {
    id: 'mNVolZcoCdA',
    name: 'Power Up',
    title: 'They Left Bengaluru to Live in a Jungle | Peace Over Rat Race',
    channel: 'PowerUp Money',
    hasMaxRes: true,
  },
  { id: 'rUALHndSsRk', name: 'Sinth 1', title: 'How A Japanese Player Broke Baseball', channel: 'Lil Dhan', hasMaxRes: true },
  { id: '2aCCselmxfE', name: 'Sinth 2', title: 'How Europe Stole Basketball', channel: 'Lil Dhan', hasMaxRes: true },
  { id: 'gm_fs23q5_M', name: 'Sinth 3', title: 'Why no one wants to host the Super Bowl', channel: 'Lil Dhan', hasMaxRes: true },
  {
    id: 'QtDZAXeunzk',
    name: 'Danny 1',
    title: 'The President of Argentina’s Crypto Scandal Exposed',
    channel: 'DannyXBT',
    hasMaxRes: true,
  },
  {
    id: 'HCJplqP5mRQ',
    name: 'Danny 2',
    title: 'Does Crypto Actually Have a Future Under Donald Trump?',
    channel: 'DannyXBT',
    hasMaxRes: true,
  },
  {
    id: 'rfbX7MK4ZaU',
    name: 'Karnataka',
    title: "BJP's Karnataka Falloff  | A-Club Assignment 16 | Aevytv Cohort 8",
    channel: 'Lil Dhan',
    hasMaxRes: false,
  },
  {
    id: '1z8MN1ezLvk',
    name: 'My Pod',
    title: 'Peg pe Charcha with LAILA | Portfolio Assignment 1 | Aevytv Cohort 8',
    channel: 'Lil Dhan',
    hasMaxRes: true,
  },
  {
    id: 'APqCSYjdbdU',
    name: 'Maus 1',
    title: 'How One Country Broke International Football Forever',
    channel: 'Lil Dhan',
    hasMaxRes: true,
  },
]

export const shortFormVideos: readonly YouTubeVideo[] = [
  { id: 'zXJmGSoOpVA', name: 'Credit card', title: 'DBC Reel 1', channel: 'Lil Dhan' },
  { id: 'Sd49207APb4', name: 'Mega', title: 'Vitamins 2', channel: 'Lil Dhan' },
  { id: 'R2dfEE8uvHY', name: 'Big Fat India Wedding', title: 'Big fat indian Wedding', channel: 'Lil Dhan' },
  {
    id: 'nHeF0RgRZkI',
    name: '100 C',
    title: '6th August 1925 - Assassination of a Red Army general',
    channel: 'The 100 Year Project',
  },
  { id: 'YvaMKHS4dlM', name: '100 D', title: '16th August 1925 - Turkey in Aviation', channel: 'The 100 Year Project' },
  {
    id: 'LsKqvpAAeCY',
    name: '100 B',
    title: '11th August 1925 -Talks to Prevent World War II!',
    channel: 'The 100 Year Project',
  },
  {
    id: 'klbW4ZPZwxI',
    name: '100 A',
    title: '3rd of August - Turning coal into liquid fuel',
    channel: 'The 100 Year Project',
  },
]
