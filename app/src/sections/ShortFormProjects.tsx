import { YouTubeEmbed } from '../components/YouTubeEmbed'
import { shortFormVideos } from '../content/videos'
import { ProjectShowcase } from './projects/ProjectShowcase'

const slides = shortFormVideos.map((video) => ({
  key: video.id,
  node: <YouTubeEmbed video={video} kind="short" src={`https://i.ytimg.com/vi_webp/${video.id}/maxresdefault.webp`} />,
}))

export function ShortFormProjects() {
  return <ProjectShowcase title="Short Form Project" variant="short" slides={slides} />
}
