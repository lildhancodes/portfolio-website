import { MotionConfig } from 'motion/react'
import { CustomCursor } from './layout/CustomCursor'
import { Footer } from './layout/Footer'
import { Nav } from './layout/Nav'
import { SmoothScroll } from './layout/SmoothScroll'
import { ThemeSwitch } from './layout/ThemeSwitch'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Intro } from './sections/Intro'
import { LongFormProjects } from './sections/LongFormProjects'
import { Process } from './sections/Process'
import { ShortFormProjects } from './sections/ShortFormProjects'
import { TechnicalStack } from './sections/TechnicalStack'

// Page order mirrors the Framer "Home" page: the layout template (nav, theme dock, cursor,
// footer) wraps the page content. Intro = hero + services + about, which share the sticky
// flipping avatar card.
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <CustomCursor />
      <Nav />
      <main>
        <Intro />
        <TechnicalStack />
        <LongFormProjects />
        <ShortFormProjects />
        <Experience />
        <Process />
        <Contact />
      </main>
      <Footer />
      <ThemeSwitch />
    </MotionConfig>
  )
}
