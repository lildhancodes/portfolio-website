import { YouTubeEmbed } from '../components/YouTubeEmbed'
import { shortFormVideos } from '../content/videos'
import { ProjectShowcase } from './projects/ProjectShowcase'

// Shorts only have 16:9 thumbnails with the vertical frame in the middle (1280×720 → a 405px-wide
// picture); the 1080×1920 "oardefault" is missing for two of them and is 3–5× heavier.
const slides = shortFormVideos.map((video) => ({
  key: video.id,
  node: <YouTubeEmbed video={video} kind="short" src={`https://i.ytimg.com/vi_webp/${video.id}/maxresdefault.webp`} />,
}))

export function ShortFormProjects() {
  return <ProjectShowcase title="Short Form Project" variant="short" slides={slides} />
}
