import type { KeyboardEvent } from 'react'
import styles from '../SetupWizard.module.css'

type CreativeDomainProps = {
  formData: { domains: string[] }
  updateFormData: (updates: { domains: string[] }) => void
}

const DOMAINS = [
  {
    id: 'illustration',
    icon: '🎨',
    title: 'Illustration',
    description: 'Digital or traditional illustration, concept art, and visual storytelling.',
  },
  {
    id: 'photography',
    icon: '📷',
    title: 'Photography',
    description: 'Fine art, editorial, commercial, or documentary photography.',
  },
  {
    id: 'brand',
    icon: '✒️',
    title: 'Brand Design',
    description: 'Identity systems, logos, typography, packaging, and campaigns.',
  },
  {
    id: 'ux',
    icon: '🧭',
    title: 'UX Design',
    description: 'Research, flows, wireframes, and interface systems.',
  },
  {
    id: 'product',
    icon: '📐',
    title: 'Product Design',
    description: 'End-to-end product work, from concept through shipped experience.',
  },
  {
    id: '3d',
    icon: '🧊',
    title: '3D Artist',
    description: 'Modeling, texturing, lighting, and rendered environments.',
  },
  {
    id: 'other',
    icon: '✨',
    title: 'Other',
    description: 'A blend of disciplines, or a practice all your own.',
  },
]

export const DOMAIN_LABELS: Record<string, string> = Object.fromEntries(
  DOMAINS.map((domain) => [domain.id, domain.title]),
)

export default function CreativeDomain({ formData, updateFormData }: CreativeDomainProps) {
  const toggleDomain = (id: string) => {
    const selected = new Set(formData.domains)
    if (selected.has(id)) {
      selected.delete(id)
    } else {
      selected.add(id)
    }
    // Save in list order rather than click order, so the config stays stable.
    updateFormData({
      domains: DOMAINS.filter((domain) => selected.has(domain.id)).map((domain) => domain.id),
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleDomain(id)
    }
  }

  return (
    <div>
      <h2 className={styles.stepTitle}>Creative domain</h2>
      <p className={styles.stepDescription}>
        What kind of work will you be showcasing? Pick as many as apply — plenty of people
        illustrate and design.
      </p>

      <div className={styles.cardGrid}>
        {DOMAINS.map((domain) => {
          const isSelected = formData.domains.includes(domain.id)
          return (
            <div
              key={domain.id}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              onClick={() => toggleDomain(domain.id)}
              onKeyDown={(event) => handleKeyDown(event, domain.id)}
            >
              {isSelected && (
                <span className={styles.cardCheck} aria-hidden="true">
                  ✓
                </span>
              )}
              <div className={styles.cardIcon}>{domain.icon}</div>
              <div className={styles.cardTitle}>{domain.title}</div>
              <div className={styles.cardDescription}>{domain.description}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
