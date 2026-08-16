import { useParams, Link } from 'react-router'
import { useProject } from '@/hooks/useProjects'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMetaTags } from '@/hooks/useMetaTags'
import { getMediaUrl } from '@/utils/media'
import ProjectDetail from '@/components/ProjectDetail/ProjectDetail'
import styles from './ProjectPage.module.css'

export default function ProjectPage() {
  const { slug } = useParams()
  const { project } = useProject(slug!)
  useDocumentTitle(project?.title)
  useMetaTags(
    project
      ? {
          title: project.title,
          description: project.description,
          image: getMediaUrl(project.slug, project.cover),
        }
      : undefined,
  )

  if (!project) {
    return (
      <div className={styles.projectPage__notFound}>
        <h1 className={styles.projectPage__notFoundTitle}>Project not found</h1>
        <Link to="/" className={styles.projectPage__notFoundLink}>
          Back to work
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className={styles.projectPage__back}>
        &larr; Back
      </Link>
      <ProjectDetail project={project} />
    </div>
  )
}
