import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { Project } from '@/config/projects'
import { getMediaUrl } from '@/utils/media'
import MediaViewer from '@/components/MediaViewer/MediaViewer'
import styles from '../ProjectDetail.module.css'
import header from '../ProjectHeader.module.css'

function ScrollRevealItem({ children }: { children: React.ReactNode }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      className={styles.scroll__mediaItem}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {children}
    </motion.div>
  )
}

export default function Scroll({ project }: { project: Project }) {
  return (
    <article className={styles.scroll}>
      <div className={styles.scroll__hero}>
        <img
          src={getMediaUrl(project.slug, project.cover)}
          alt={project.title}
          className={styles.scroll__heroImage}
        />
      </div>

      <div className={styles.scroll__header}>
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

      <div className={styles.scroll__media}>
        {project.media.map((item) => (
          <ScrollRevealItem key={item.src}>
            <MediaViewer
              src={item.src}
              alt={item.alt}
              description={item.description}
              projectSlug={project.slug}
            />
          </ScrollRevealItem>
        ))}
      </div>
    </article>
  )
}
