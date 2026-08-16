import MediaViewer from '@/components/MediaViewer/MediaViewer'
import styles from '../Gallery.module.css'

export default function Justify({
  media,
  projectSlug,
}: {
  media: { src: string; alt: string; description?: string }[]
  projectSlug: string
}) {
  return (
    <div className={styles.galleryJustify}>
      {media.map((item) => (
        <div key={item.src} className={styles.galleryJustify__item}>
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
