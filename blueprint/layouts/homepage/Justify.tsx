import { Link } from 'react-router'
import { motion } from 'motion/react'
import { Project } from '@/config/projects'
import { getMediaUrl } from '@/utils/media'
import styles from '../ThumbnailGrid.module.css'

export default function Justify({ projects }: { projects: Project[] }) {
  return (
    <div className={styles.justify}>
      {projects.map((project, i) => (
        <motion.div
          key={project.slug}
          className={styles.justify__item}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.4 }}
          layout
        >
          <Link to={`/project/${project.slug}`} className={styles.thumbnail__link}>
            <img
              src={getMediaUrl(project.slug, project.cover)}
              alt={project.title}
              className={styles.justify__image}
              loading="lazy"
            />
            <div className={styles.thumbnail__overlay}>
              <h3 className={styles.thumbnail__title}>{project.title}</h3>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
