import { useState } from 'react'
import styles from '../SetupWizard.module.css'

export default function Summary({ formData, goToStep, onSave }: any) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    const config = {
      site: {
        name: formData.name,
        tagline: formData.tagline,
        bio: formData.bio,
        location: formData.location,
        resume: '',
        contact: {
          email: formData.email,
        },
        social: formData.social,
      },
      domain: formData.domain,
      layout: {
        homepage: formData.homepage,
        project: formData.project,
        navigation: formData.navigation,
      },
      store: {
        enabled: false,
        provider: 'stripe',
        currency: 'usd',
        layout: 'grid',
        shipFrom: '',
      },
      deployment: formData.deployment,
    }

    try {
      await fetch('/__api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (formData.themePreset) {
        await fetch('/__api/apply-preset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preset: formData.themePreset }),
        })
      }

      await fetch('/__api/scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      onSave()
    } catch (err: any) {
      console.error('Failed to save:', err)
      setSaving(false)
    }
  }

  const socialDisplay =
    formData.social.length > 0 ? formData.social.map((s: any) => s.platform).join(', ') : 'None'

  return (
    <div>
      <h2 className={styles.stepTitle}>Review</h2>
      <p className={styles.stepDescription}>
        Here's a summary of your portfolio setup. Edit anything before saving.
      </p>

      <div className={styles.summarySection}>
        <span className={styles.summaryLabel}>Name</span>
        <span className={styles.summaryValue}>{formData.name}</span>
        <button className={styles.summaryEdit} onClick={() => goToStep(1)}>
          Edit
        </button>
      </div>

      <div className={styles.summarySection}>
        <span className={styles.summaryLabel}>Tagline</span>
        <span className={styles.summaryValue}>{formData.tagline || '—'}</span>
        <button className={styles.summaryEdit} onClick={() => goToStep(1)}>
          Edit
        </button>
      </div>

      <div className={styles.summarySection}>
        <span className={styles.summaryLabel}>Email</span>
        <span className={styles.summaryValue}>{formData.email}</span>
        <button className={styles.summaryEdit} onClick={() => goToStep(1)}>
          Edit
        </button>
      </div>

      <div className={styles.summarySection}>
        <span className={styles.summaryLabel}>Location</span>
        <span className={styles.summaryValue}>{formData.location || '—'}</span>
        <button className={styles.summaryEdit} onClick={() => goToStep(1)}>
          Edit
        </button>
      </div>

      <div className={styles.summarySection}>
        <span className={styles.summaryLabel}>Social</span>
        <span className={styles.summaryValue}>{socialDisplay}</span>
        <button className={styles.summaryEdit} onClick={() => goToStep(2)}>
          Edit
        </button>
      </div>

      <div className={styles.summarySection}>
        <span className={styles.summaryLabel}>Domain</span>
        <span className={styles.summaryValue}>{formData.domain}</span>
        <button className={styles.summaryEdit} onClick={() => goToStep(3)}>
          Edit
        </button>
      </div>

      <div className={styles.summarySection}>
        <span className={styles.summaryLabel}>Layout</span>
        <span className={styles.summaryValue}>
          {formData.homepage} / {formData.project} / {formData.navigation}
        </span>
        <button className={styles.summaryEdit} onClick={() => goToStep(4)}>
          Edit
        </button>
      </div>

      <div className={styles.summarySection}>
        <span className={styles.summaryLabel}>Theme</span>
        <span className={styles.summaryValue}>{formData.themePreset || 'None'}</span>
        <button className={styles.summaryEdit} onClick={() => goToStep(5)}>
          Edit
        </button>
      </div>

      <div className={styles.summarySection}>
        <span className={styles.summaryLabel}>Deploy</span>
        <span className={styles.summaryValue}>{formData.deployment}</span>
        <button className={styles.summaryEdit} onClick={() => goToStep(6)}>
          Edit
        </button>
      </div>

      <button
        className={`${styles.saveButton} ${saving ? styles.saving : ''}`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save & Build My Portfolio'}
      </button>
    </div>
  )
}
