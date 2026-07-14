import { useState, type ImgHTMLAttributes } from 'react'

export interface ProductImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'height' | 'src' | 'width'> {
  alt: string
  height?: number
  src?: string | null
  width?: number
}

export function ProductImage({
  alt,
  className,
  height = 640,
  loading = 'lazy',
  onError,
  src,
  width = 640,
  ...props
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const hasImage = Boolean(src) && failedSrc !== src
  const aspectRatio = `${width} / ${height}`

  return (
    <div
      className={[
        'relative grid w-full overflow-hidden rounded-xl bg-ink-800',
        className,
      ].filter(Boolean).join(' ')}
      style={{ aspectRatio }}
    >
      {hasImage ? (
        <img
          alt={alt}
          className="h-full w-full object-contain"
          decoding="async"
          height={height}
          loading={loading}
          onError={(event) => {
            setFailedSrc(src ?? null)
            onError?.(event)
          }}
          src={src ?? undefined}
          width={width}
          {...props}
        />
      ) : (
        <div
          aria-label={alt}
          className="grid h-full w-full place-content-center gap-2 p-4 text-center text-zinc-500"
          role="img"
        >
          <svg
            aria-hidden="true"
            className="mx-auto size-10"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="m4 16 4.5-4.5 3 3L14 12l6 6M8.5 8.5h.01M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
          <span className="text-sm">Imagem indisponível</span>
        </div>
      )}
    </div>
  )
}
