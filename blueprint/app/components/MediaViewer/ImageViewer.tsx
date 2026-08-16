import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import styles from './MediaViewer.module.css'

export default function ImageViewer({ src, alt }: { src: string; alt: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!lightboxOpen) return

    closeRef.current?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen])

  return (
    <>
      <motion.img
        src={src}
        alt={alt}
        className={styles.mediaViewer__image}
        loading="lazy"
        onClick={() => setLightboxOpen(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            <img src={src} alt={alt} className={styles.lightbox__image} />
            <button
              ref={closeRef}
              className={styles.lightbox__close}
              onClick={() => setLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
