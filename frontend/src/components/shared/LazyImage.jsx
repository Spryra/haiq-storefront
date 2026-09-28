import { useState, useRef, useEffect } from 'react'

/**
 * Lazy-loaded image with:
 *  - Amber shimmer skeleton while loading (matches brand palette)
 *  - Opacity fade-in on load (skipped when prefers-reduced-motion)
 *  - loading="lazy" + decoding="async" by default
 *  - fetchpriority="high" via `priority` prop for above-fold images
 *  - Graceful error state (keeps aspect ratio, shows subtle icon)
 */
export default function LazyImage({
  src,
  alt,
  className = '',
  style = {},
  imgClassName = '',
  imgStyle = {},
  priority = false,
  objectPosition = 'center',
}) {
  const [loaded,  setLoaded]  = useState(false)
  const [errored, setErrored] = useState(false)
  const imgRef = useRef(null)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // If already cached the browser fires load before the effect — catch it.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [])

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* Skeleton — amber shimmer, hidden once image loads */}
      {!loaded && !errored && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, #1A0A00 25%, #2A1400 50%, #1A0A00 75%)',
            backgroundSize: '200% 100%',
            animation: prefersReduced ? 'none' : 'haiqShimmer 1.6s ease-in-out infinite',
          }}
        />
      )}

      {/* Error fallback */}
      {errored && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: '#1A0A00' }}
        >
          <span style={{ fontSize: 28, opacity: 0.15 }}>▪</span>
        </div>
      )}

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={priority ? 'high' : undefined}
        className={`w-full h-full object-cover ${imgClassName}`}
        style={{
          objectPosition,
          opacity:    loaded ? 1 : 0,
          transition: prefersReduced ? 'none' : 'opacity 0.45s ease',
          ...imgStyle,
        }}
        onLoad={() => setLoaded(true)}
        onError={() => { setLoaded(true); setErrored(true) }}
      />
    </div>
  )
}
