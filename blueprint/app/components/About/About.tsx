import { useConfig } from '@/hooks/useConfig'
import SocialLinks from './SocialLinks'
import styles from './About.module.css'

export default function About() {
  const config = useConfig()
  const { name, tagline, bio, location, resume, contact, social } = config.site

  return (
    <div className={styles.about}>
      <header className={styles.about__header}>
        <h1 className={styles.about__name}>{name}</h1>
        {tagline && <p className={styles.about__tagline}>{tagline}</p>}
      </header>

      {bio && (
        <section className={styles.about__section}>
          <h2 className={styles.about__sectionTitle}>About</h2>
          <div className={styles.about__bio}>
            {bio.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </section>
      )}

      {location && (
        <section className={styles.about__section}>
          <h2 className={styles.about__sectionTitle}>Location</h2>
          <p className={styles.about__text}>{location}</p>
        </section>
      )}

      {resume && (
        <section className={styles.about__section}>
          <h2 className={styles.about__sectionTitle}>Resume</h2>
          <a href={resume} target="_blank" rel="noopener noreferrer" className={styles.about__link}>
            Download Resume
          </a>
        </section>
      )}

      {contact.email && (
        <section className={styles.about__section}>
          <h2 className={styles.about__sectionTitle}>Contact</h2>
          <a href={`mailto:${contact.email}`} className={styles.about__link}>
            {contact.email}
          </a>
        </section>
      )}

      {social.length > 0 && (
        <section className={styles.about__section}>
          <h2 className={styles.about__sectionTitle}>Links</h2>
          <SocialLinks links={social} />
        </section>
      )}
    </div>
  )
}
