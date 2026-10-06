import type { Picture as PictureData } from 'imagetools-core'
import type { CSSProperties } from 'react'

type Props = {
  src: PictureData
  alt: string
  /** Rendered width hint for the browser's srcset choice, e.g. "(max-width: 809px) 90vw, 340px". */
  sizes: string
  className?: string
  style?: CSSProperties
  /** Above-the-fold images load eagerly with high priority; everything else is lazy. */
  priority?: boolean
}

const MIME: Record<string, string> = { avif: 'image/avif', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' }

export function Picture({ src, alt, sizes, className, style, priority = false }: Props) {
  return (
    <picture>
      {Object.entries(src.sources).map(([format, srcSet]) => (
        <source key={format} type={MIME[format]} srcSet={srcSet} sizes={sizes} />
      ))}
      <img
        src={src.img.src}
        width={src.img.w}
        height={src.img.h}
        alt={alt}
        className={className}
        style={style}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
      />
    </picture>
  )
}
