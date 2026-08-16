import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useConfig } from '@/hooks/useConfig'
import CartButton from '@/components/Cart/CartButton'
import styles from './Overlay.module.css'

export default function Overlay() {
  const config = useConfig()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { to: '/', label: 'Work' },
    ...(config.blog?.enabled ? [{ to: '/blog', label: 'Blog' }] : []),
    ...(config.store?.enabled ? [{ to: '/shop', label: 'Shop' }] : []),
    { to: '/about', label: 'About' },
  ]

  return (
    <>
      <nav className={styles.overlay__bar}>
        <Link to="/" className={styles.overlay__brand}>
          {config.site.name}
        </Link>
        <div className={styles.overlay__actions}>
          {config.store?.enabled && <CartButton />}
          <button
            className={styles.overlay__hamburger}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <span
              className={`${styles.overlay__hamburgerLine} ${
                isOpen ? styles['overlay__hamburgerLine--open'] : ''
              }`}
            />
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.overlay__menu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.overlay__links}>
              {links.map((link) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    to={link.to}
                    className={`${styles.overlay__link} ${
                      location.pathname === link.to ? styles['overlay__link--active'] : ''
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
