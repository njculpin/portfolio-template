import { useState } from 'react'
import styles from '../SetupWizard.module.css'
import { DOMAIN_LABELS } from './CreativeDomain'
import type { WizardFormData } from '../types'

type SummaryProps = {
  formData: WizardFormData
  goToStep: (step: number) => void
}

export default function Summary({ formData, goToStep }: SummaryProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')

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
      domains: formData.domains,
      layout: {
        homepage: formData.homepage,
        project: formData.project,
        navigation: formData.navigation,
      },
      blog: {
        enabled: formData.blogEnabled,
      },
      store: {
        enabled: formData.storeEnabled,
        provider: 'stripe',
        currency: 'usd',
        layout: 'grid',
        shipFrom: '',
      },
      deployment: formData.deployment,
    }

    try {
      // One request: saves the config, applies the theme preset, and scaffolds the
      // real site. When it returns, the wizard no longer exists on disk.
      const response = await fetch('/__api/complete-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, preset: formData.themePreset }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      // Replace rather than push, so Back can't land on the wizard again.
      window.location.replace(import.meta.env.BASE_URL || '/')
    } catch (err) {
      console.error('Failed to save:', err)
      setError('Something went wrong while building your site — check the dev server output.')
      setSaving(false)
    }
  }

  const socialDisplay =
    formData.social.length > 0 ? formData.social.map((s) => s.platform).join(', ') : 'None'

  const domainDisplay =
    formData.domains.length > 0
      ? formData.domains.map((id) => DOMAIN_LABELS[id] || id).join(', ')
      : 'None'

  const enabledFeatures = [
    formData.blogEnabled ? 'Blog' : '',
    formData.storeEnabled ? 'Store' : '',
  ].filter(Boolean)

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
        <span className={styles.summaryLabel}>Domains</span>
        <span className={styles.summaryValue}>{domainDisplay}</span>
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
        <span className={styles.summaryLabel}>Features</span>
        <span className={styles.summaryValue}>
          {enabledFeatures.length > 0 ? enabledFeatures.join(', ') : 'None'}
        </span>
        <button className={styles.summaryEdit} onClick={() => goToStep(6)}>
          Edit
        </button>
      </div>

      <div className={styles.summarySection}>
        <span className={styles.summaryLabel}>Deploy</span>
        <span className={styles.summaryValue}>{formData.deployment}</span>
        <button className={styles.summaryEdit} onClick={() => goToStep(7)}>
          Edit
        </button>
      </div>

      <button
        className={`${styles.saveButton} ${saving ? styles.saving : ''}`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Building your site…' : 'Save & Build My Portfolio'}
      </button>

      {error && <p className={styles.saveError}>{error}</p>}
    </div>
  )
}
