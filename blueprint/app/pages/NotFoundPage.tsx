import { Link } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './ProjectPage.module.css'

export default function NotFoundPage() {
  useDocumentTitle('Not Found')

  return (
    <div className={styles.projectPage__notFound}>
      <h1 className={styles.projectPage__notFoundTitle}>Page not found</h1>
      <Link to="/" className={styles.projectPage__notFoundLink}>
        Back to work
      </Link>
    </div>
  )
}
