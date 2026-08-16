import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { getMediaUrl } from '@/utils/media'
import styles from '../Gallery.module.css'

export default function Slideshow({
  media,
  projectSlug,
}: {
  media: { src: string; alt: string; description?: string }[]
  projectSlug: string
}) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % media.length)
  }, [media.length])

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + media.length) % media.length)
  }, [media.length])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, prev])

  if (media.length === 0) return null
  const item = media[current]

  return (
    <div className={styles.slideshow}>
      <div className={styles.slideshow__viewport}>
        <AnimatePresence mode="wait">
          <motion.img
            key={item.src}
            src={getMediaUrl(projectSlug, item.src)}
            alt={item.alt}
            className={styles.slideshow__image}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
        {item.description && <p className={styles.slideshow__caption}>{item.description}</p>}
      </div>

      <div className={styles.slideshow__controls}>
        <button onClick={prev} className={styles.slideshow__button} aria-label="Previous slide">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className={styles.slideshow__dots}>
          {media.map((_, i) => (
            <button
              key={i}
              className={`${styles.slideshow__dot} ${
                i === current ? styles['slideshow__dot--active'] : ''
              }`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button onClick={next} className={styles.slideshow__button} aria-label="Next slide">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
