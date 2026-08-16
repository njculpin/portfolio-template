import MediaViewer from '@/components/MediaViewer/MediaViewer'
import styles from '../Gallery.module.css'

export default function Freeform({
  media,
  projectSlug,
}: {
  media: { src: string; alt: string; description?: string }[]
  projectSlug: string
}) {
  return (
    <div className={styles.galleryFreeform}>
      {media.map((item, i) => (
        <div
          key={item.src}
          className={styles.galleryFreeform__item}
          style={{
            gridColumn: `span ${i > 0 && i % 3 === 0 ? 2 : 1}`,
            gridRow: `span ${i > 0 && i % 5 === 0 ? 2 : 1}`,
          }}
        >
          <MediaViewer
            src={item.src}
            alt={item.alt}
            description={item.description}
            projectSlug={projectSlug}
          />
        </div>
      ))}
    </div>
  )
}
