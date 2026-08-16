import { ReactNode } from 'react'
import { useConfig } from '@/hooks/useConfig'
import Navigation from '@/components/Navigation/Navigation'
import Footer from '@/components/Footer/Footer'
import styles from './PageLayout.module.css'

export default function PageLayout({ children }: { children: ReactNode }) {
  const config = useConfig()
  const isSidebar = config.layout.navigation === 'sidebar'

  return (
    <div className={`${styles.pageLayout} ${isSidebar ? styles['pageLayout--sidebar'] : ''}`}>
      <Navigation />
      <main className={styles.pageLayout__content}>{children}</main>
      <Footer />
    </div>
  )
}
