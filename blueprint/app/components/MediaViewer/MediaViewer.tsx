import { getMediaType } from '@/utils/media'
import ImageViewer from './ImageViewer'
import VideoViewer from './VideoViewer'
import styles from './MediaViewer.module.css'

export default function MediaViewer({
  src,
  alt,
  description,
  projectSlug,
}: {
  src: string
  alt: string
  description?: string
  projectSlug: string
}) {
  const type = getMediaType(src)
  const url = `/portfolio/${projectSlug}/${src}`

  return (
    <figure className={styles.mediaViewer}>
      {type === 'video' ? <VideoViewer src={url} /> : <ImageViewer src={url} alt={alt} />}
      {description && (
        <figcaption className={styles.mediaViewer__caption}>{description}</figcaption>
      )}
    </figure>
  )
}
