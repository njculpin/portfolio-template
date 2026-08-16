import { Project } from '@/config/projects'
import GallerySlideshow from '@/components/Gallery/variants/Slideshow'
import styles from '../ProjectDetail.module.css'
import header from '../ProjectHeader.module.css'

export default function Slideshow({ project }: { project: Project }) {
  return (
    <article className={styles.slideshow}>
      <div className={styles.slideshow__header}>
        <h1 className={header.projectHeader__title}>{project.title}</h1>
        {project.description && (
          <p className={header.projectHeader__description}>{project.description}</p>
        )}
        {project.tags.length > 0 && (
          <div className={header.projectHeader__tags}>
            {project.tags.map((tag) => (
              <span key={tag} className={header.projectHeader__tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <GallerySlideshow media={project.media} projectSlug={project.slug} />
    </article>
  )
}
