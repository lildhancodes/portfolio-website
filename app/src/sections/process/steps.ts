import type { Picture } from 'imagetools-core'
import feedbackImg from '../../assets/images/process-feedback.jpeg?picture'
import researchImg from '../../assets/images/process-research.jpeg?picture'
import testingImg from '../../assets/images/process-testing.jpeg?picture'

/** Card color schemes, named after what they show in the default dark theme. */
export type CardTone = 'inverse' | 'accent' | 'surface'

export type ProcessTile =
  | { kind: 'step'; id: string; number: string; title: string; text: string; tone: CardTone }
  | { kind: 'photo'; id: string; src: Picture; alt: string }

// Grid order is the DOM order; per-breakpoint spans live in Process.module.css, keyed by id (data-tile).
export const processTiles: readonly ProcessTile[] = [
  {
    kind: 'step',
    id: 'discovery',
    number: '01.',
    title: 'DISCOVERY & VISION',
    text: 'First, I get to know your brand, audience, and goals. Think of it as the “first date” with your project — where I figure out its quirks, strengths, and how to make it shine.',
    tone: 'inverse',
  },
  { kind: 'photo', id: 'research', src: researchImg, alt: 'Research & Strategy' },
  {
    kind: 'step',
    id: 'storyboard',
    number: '02.',
    title: 'STORYBOARD & IDEAS',
    text: 'This is where I connect the dots. I sketch out concepts, experiment with pacing, and imagine how visuals and sound will play together. Basically, I’m making sure your video has a heartbeat before it even starts breathing.',
    tone: 'accent',
  },
  { kind: 'photo', id: 'feedback', src: feedbackImg, alt: 'Feedback & Refinement' },
  {
    kind: 'step',
    id: 'editing',
    number: '03.',
    title: 'EDITING & SOUND DESIGN',
    text: 'Now the real fun begins. Clean cuts, smooth pacing, and immersive sound design (because 60% of a great video is audio). This is where “boring footage” officially files for a name change.',
    tone: 'surface',
  },
  {
    kind: 'step',
    id: 'color',
    number: '04.',
    title: 'COLOR & MOTION MAGIC',
    text: 'Here’s the glow-up stage. Cinematic color grading, crisp motion graphics, and those subtle touches that make people go: “Wait, who edited this?!”',
    tone: 'accent',
  },
  {
    kind: 'step',
    id: 'delivery',
    number: '05.',
    title: 'FEEDBACK & DELIVERY',
    text: 'I polish, refine, and tweak until it feels just right. Then I deliver a video that’s ready to impress — whether it’s on a giant screen or someone’s phone at 2 AM.',
    tone: 'inverse',
  },
  { kind: 'photo', id: 'testing', src: testingImg, alt: 'Testing & Optimization' },
]
