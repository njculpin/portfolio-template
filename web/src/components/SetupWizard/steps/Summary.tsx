import { useState } from 'react'
import styles from '../SetupWizard.module.css'
import { DOMAIN_LABELS } from './CreativeDomain'
import BuildingScreen, { BUILD_STAGES } from './BuildingScreen'
import type { WizardFormData } from '../types'

type SummaryProps = {
  formData: WizardFormData
  goToStep: (step: number) => void
}

// Writing the config and deleting the wizard both make Vite want to reload the
// page. Mid-build that lands on a half-written site — the white screen. The
// wizard reloads itself once, deliberately, when the build is finished.
// Returns a release function: if the build fails we are staying on this page,
// and it must be able to reload normally again.
function holdTheReload() {
  const hot = import.meta.hot
  if (!hot) return () => {}

  const block = () => {
    throw new Error('[setup] build in progress — reload deferred')
  }
  hot.on('vite:beforeFullReload', block)
  return () => hot.off('vite:beforeFullReload', block)
}

export default function Summary({ formData, goToStep }: SummaryProps) {
  const [saving, setSaving] = useState(false)
  const [stageIndex, setStageIndex] = useState(0)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const releaseTheReload = holdTheReload()
    setSaving(true)
    setStageIndex(0)
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
      // One request: saves the config, applies the theme preset, and scaffolds
      // the real site. It streams a line per step so the screen can keep up.
      const response = await fetch('/__api/complete-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, preset: formData.themePreset }),
      })

      if (!response.ok || !response.body) {
        throw new Error(`The dev server answered with ${response.status}.`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffered = ''
      let finished = false

      const handleLine = (line: string) => {
        if (!line.trim()) return
        const message = JSON.parse(line) as { stage?: string; ok?: boolean; error?: string }
        if (message.error) throw new Error(message.error)
        if (message.stage) {
          const index = BUILD_STAGES.findIndex((s) => s.id === message.stage)
          if (index >= 0) setStageIndex(index)
        }
        if (message.ok) finished = true
      }

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffered += decoder.decode(value, { stream: true })
        const lines = buffered.split('\n')
        buffered = lines.pop() || ''
        lines.forEach(handleLine)
      }
      handleLine(buffered)

      if (!finished) {
        throw new Error('The build stopped before it finished.')
      }

      setStageIndex(BUILD_STAGES.length)

      // Replace rather than push, so Back can't land on the wizard again.
      window.location.replace(import.meta.env.BASE_URL || '/')
    } catch (err) {
      console.error('Failed to save:', err)
      releaseTheReload()
      setError(err instanceof Error ? err.message : String(err))
      setSaving(false)
    }
  }

  if (saving || error) {
    return (
      <BuildingScreen
        stageIndex={stageIndex}
        error={error}
        onRetry={() => {
          setError('')
          handleSave()
        }}
      />
    )
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

      <button className={styles.saveButton} onClick={handleSave}>
        Save &amp; Build My Portfolio
      </button>
    </div>
  )
}
