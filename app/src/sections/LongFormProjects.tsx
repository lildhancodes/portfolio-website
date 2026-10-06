import { YouTubeEmbed } from '../components/YouTubeEmbed'
import { longFormVideos, type LongFormVideo } from '../content/videos'
import { sectionIds } from '../content/site'
import { ProjectShowcase } from './projects/ProjectShowcase'

// Slide width per page breakpoint (the slideshow box minus its 50px side padding).
const sizes = '(max-width: 809.98px) 355px, (max-width: 1399.98px) 696px, 1300px'

// hq/sd thumbnails are 4:3 with the 16:9 picture letterboxed, so their usable width is the full width.
function thumbnails({ id, hasMaxRes }: LongFormVideo) {
  const url = (name: string) => `https://i.ytimg.com/vi_webp/${id}/${name}.webp`
  const candidates = [`${url('hqdefault')} 480w`, `${url('sddefault')} 640w`]
  if (hasMaxRes) candidates.push(`${url('maxresdefault')} 1280w`)
  return { src: url(hasMaxRes ? 'maxresdefault' : 'sddefault'), srcSet: candidates.join(', ') }
}

const slides = longFormVideos.map((video) => ({
  key: video.id,
  node: <YouTubeEmbed video={video} kind="video" sizes={sizes} {...thumbnails(video)} />,
}))

export function LongFormProjects() {
  return <ProjectShowcase id={sectionIds.longForm} title="Long Form Project" variant="long" slides={slides} />
}
