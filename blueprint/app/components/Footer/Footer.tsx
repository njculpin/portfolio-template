import { useConfig } from '@/hooks/useConfig'
import styles from './Footer.module.css'

export default function Footer() {
  const config = useConfig()
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <span className={styles.footer__copyright}>
        &copy; {year} {config.site.name}
      </span>
      {config.site.social.length > 0 && (
        <div className={styles.footer__links}>
          {config.site.social.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footer__link}
            >
              {link.platform}
            </a>
          ))}
        </div>
      )}
    </footer>
  )
}
