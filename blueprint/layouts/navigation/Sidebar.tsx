import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useConfig } from '@/hooks/useConfig'
import CartButton from '@/components/Cart/CartButton'
import Overlay from './Overlay'
import styles from './Sidebar.module.css'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

export default function Sidebar() {
  const config = useConfig()
  const location = useLocation()
  const isMobile = useIsMobile()

  if (isMobile === null) return null
  if (isMobile) return <Overlay />

  const links = [
    { to: '/', label: 'Work' },
    ...(config.blog?.enabled ? [{ to: '/blog', label: 'Blog' }] : []),
    ...(config.store?.enabled ? [{ to: '/shop', label: 'Shop' }] : []),
    { to: '/about', label: 'About' },
  ]

  return (
    <nav className={styles.sidebar}>
      <Link to="/" className={styles.sidebar__brand}>
        {config.site.name}
      </Link>
      {config.site.tagline && <p className={styles.sidebar__tagline}>{config.site.tagline}</p>}
      <div className={styles.sidebar__links}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`${styles.sidebar__link} ${
              location.pathname === link.to ? styles['sidebar__link--active'] : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
        {config.store?.enabled && <CartButton />}
      </div>
      {config.site.contact.email && (
        <a href={`mailto:${config.site.contact.email}`} className={styles.sidebar__email}>
          {config.site.contact.email}
        </a>
      )}
    </nav>
  )
}
