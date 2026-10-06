import { useEffect, useId, useRef, useSyncExternalStore } from 'react'
import type { YouTubeVideo } from '../content/videos'
import { useSlideInteractive } from './slideContext'
import styles from './YouTubeEmbed.module.css'

// Click-to-load YouTube player. Until clicked it is a thumbnail button (one image from i.ytimg.com);
// the iframe, and with it YouTube's ~1MB player, loads only for the video someone chose to play.
// Starting another video swaps the previous one back to its thumbnail, so at most one plays.

const EMBED_ORIGIN = 'https://www.youtube-nocookie.com'

// YouTube's own large play buttons (from the embed player): the red pill for videos, the red
// Shorts mark for shorts.
const PLAY_ICONS = {
  video: (
    <svg className={styles.playVideo} viewBox="0 0 68 48" aria-hidden="true">
      <path
        d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
        fill="#f03"
      />
      <path d="M45 24 27 14v20" fill="#fff" />
    </svg>
  ),
  short: (
    <svg className={styles.playShort} viewBox="0 0 87 115" aria-hidden="true">
      <path
        d="M83.99 10.81C90.08 21.24 86.62 34.66 76.26 40.79L69.05 45.06L74.17 47.38C81.58 50.74 86.52 57.99 86.96 66.17C87.4 74.34 83.27 82.09 76.26 86.24L32.76 111.97C22.41 118.1 9.08 114.61 3 104.18C-3.08 93.75.37 80.33 10.73 74.2L17.94 69.93L12.82 67.61C5.41 64.25.47 57 .03 48.82C-.4 40.65 3.72 32.9 10.73 28.75L54.23 3.02C64.58-3.1 77.91.38 83.99 10.81Z"
        fill="#f00"
        fillRule="evenodd"
      />
      <path d="M33 74V41l28 16.5z" fill="#fff" />
    </svg>
  ),
}

let activeId: string | null = null
const subscribers = new Set<() => void>()

function setActive(id: string | null) {
  activeId = id
  subscribers.forEach((notify) => notify())
}

function subscribe(notify: () => void) {
  subscribers.add(notify)
  return () => subscribers.delete(notify)
}

type Props = {
  video: YouTubeVideo
  kind: 'video' | 'short'
  /** Thumbnail URL (and optional srcset/sizes); it is cropped to the frame with object-fit: cover. */
  src: string
  srcSet?: string
  sizes?: string
}

export function YouTubeEmbed({ video, kind, src, srcSet, sizes }: Props) {
  const id = useId()
  const active = useSyncExternalStore(
    subscribe,
    () => activeId === id,
    () => false,
  )
  const interactive = useSlideInteractive()
  const frameClass = `${styles.frame} ${kind === 'short' ? styles.short : styles.video}`

  return (
    <div className={frameClass}>
      {active ? (
        <Player videoId={video.id} title={video.title} tabIndex={interactive ? 0 : -1} />
      ) : (
        <button
          type="button"
          className={styles.facade}
          aria-label={`Play video: ${video.title}`}
          tabIndex={interactive ? 0 : -1}
          onClick={() => setActive(id)}
        >
          <img
            className={styles.thumb}
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <span className={styles.meta} aria-hidden="true">
            <span className={styles.title}>{video.title}</span>
            <span className={styles.channel}>{video.channel}</span>
          </span>
          {PLAY_ICONS[kind]}
        </button>
      )}
    </div>
  )
}

/** YouTube player state codes posted by the embed (onStateChange / infoDelivery messages). */
const PLAYING = 1
const PAUSED = 2
const ENDED = 0

function readPlayerState(data: unknown): number | undefined {
  if (typeof data !== 'object' || data === null || !('event' in data) || !('info' in data)) return undefined
  const { event, info } = data
  if (event === 'onStateChange' && typeof info === 'number') return info
  if (event === 'infoDelivery' && typeof info === 'object' && info !== null && 'playerState' in info) {
    return typeof info.playerState === 'number' ? info.playerState : undefined
  }
  return undefined
}

function Player({ videoId, title, tabIndex }: { videoId: string; title: string; tabIndex: number }) {
  const ref = useRef<HTMLIFrameElement>(null)

  // Same window events the Framer YT components fired via the iframe API, read here straight from
  // the embed's postMessage channel instead of loading YouTube's iframe_api script.
  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return
    let playing = false
    let heard = false
    const hello = () => {
      if (heard) return
      iframe.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: videoId, channel: 'widget' }), EMBED_ORIGIN)
    }
    const retry = window.setInterval(hello, 250)
    const stopRetry = window.setTimeout(() => window.clearInterval(retry), 15000)
    iframe.addEventListener('load', hello)

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow || typeof event.data !== 'string') return
      heard = true
      window.clearInterval(retry)
      let state: number | undefined
      try {
        state = readPlayerState(JSON.parse(event.data))
      } catch {
        return
      }
      if (state === PLAYING && !playing) {
        playing = true
        window.dispatchEvent(new Event('videoPlaying'))
      } else if ((state === PAUSED || state === ENDED) && playing) {
        playing = false
        window.dispatchEvent(new Event('videoStopped'))
      }
    }
    window.addEventListener('message', onMessage)
    return () => {
      window.clearInterval(retry)
      window.clearTimeout(stopRetry)
      iframe.removeEventListener('load', hello)
      window.removeEventListener('message', onMessage)
      // Swapped back to the thumbnail mid-play: the video is gone, so it has stopped.
      if (playing) window.dispatchEvent(new Event('videoStopped'))
    }
  }, [videoId])

  return (
    <iframe
      ref={ref}
      className={styles.iframe}
      title={title}
      src={`${EMBED_ORIGIN}/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1`}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      tabIndex={tabIndex}
    />
  )
}
