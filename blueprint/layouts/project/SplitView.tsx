import { Project } from '@/config/projects'
import MediaViewer from '@/components/MediaViewer/MediaViewer'
import styles from '../ProjectDetail.module.css'
import header from '../ProjectHeader.module.css'

export default function SplitView({ project }: { project: Project }) {
  return (
    <article className={styles.splitView}>
      <div className={styles.splitView__media}>
        {project.media.map((item) => (
          <div key={item.src} className={styles.splitView__mediaItem}>
            <MediaViewer
              src={item.src}
              alt={item.alt}
              description={item.description}
              projectSlug={project.slug}
            />
          </div>
        ))}
      </div>
      <aside className={styles.splitView__info}>
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
        {project.date && <p className={header.projectHeader__date}>{project.date}</p>}
      </aside>
    </article>
  )
}
