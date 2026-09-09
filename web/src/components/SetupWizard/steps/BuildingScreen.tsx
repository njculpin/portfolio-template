import { useEffect } from 'react'
import type { CSSProperties } from 'react'

export const BUILD_STAGES = [
  { id: 'config', label: 'Saving your details' },
  { id: 'build', label: 'Building your site' },
  { id: 'theme', label: 'Applying your theme' },
  { id: 'styles', label: 'Generating styles' },
]

/**
 * Shown while the site is being built.
 *
 * Deliberately styled inline: the build deletes the wizard's stylesheet halfway
 * through, and Vite removes the injected <style> with it. A screen that depends
 * on that CSS would lose all of its styling at exactly the wrong moment.
 */

const KEYFRAMES = `
@keyframes wizardSpin { to { transform: rotate(360deg); } }
@keyframes wizardFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .wizard-building-spinner { animation-duration: 3s !important; }
}
`

const container: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  minHeight: '50vh',
  gap: '28px',
  color: 'var(--text-primary, #16150f)',
  fontFamily: 'var(--font-family-body, system-ui, sans-serif)',
  animation: 'wizardFade 0.4s ease both',
}

const spinner: CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '3px solid var(--border-default, #d8d5cd)',
  borderTopColor: 'var(--accent-primary, #6b6459)',
  animation: 'wizardSpin 0.9s linear infinite',
}

const title: CSSProperties = {
  fontFamily: 'var(--font-family-heading, Georgia, serif)',
  fontSize: '1.75rem',
  fontWeight: 700,
  margin: 0,
}

const hint: CSSProperties = {
  color: 'var(--text-secondary, #6b6459)',
  fontSize: '0.95rem',
  margin: 0,
  maxWidth: '34ch',
  lineHeight: 1.6,
}

const list: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  textAlign: 'left',
  minWidth: '260px',
}

const row = (state: 'done' | 'active' | 'pending'): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '0.95rem',
  opacity: state === 'pending' ? 0.4 : 1,
  fontWeight: state === 'active' ? 600 : 400,
  transition: 'opacity 0.3s ease',
})

const marker = (state: 'done' | 'active' | 'pending'): CSSProperties => ({
  width: '18px',
  height: '18px',
  flex: 'none',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  lineHeight: 1,
  color: state === 'done' ? 'var(--surface-primary, #fff)' : 'var(--text-secondary, #6b6459)',
  background: state === 'done' ? 'var(--accent-primary, #6b6459)' : 'transparent',
  border: state === 'done' ? 'none' : '2px solid var(--border-default, #d8d5cd)',
})

const errorBox: CSSProperties = {
  color: 'var(--text-primary, #16150f)',
  background: 'var(--surface-secondary, #f2f0eb)',
  border: '1px solid var(--border-default, #d8d5cd)',
  borderRadius: '10px',
  padding: '16px 20px',
  fontSize: '0.9rem',
  lineHeight: 1.6,
  maxWidth: '46ch',
}

const retryButton: CSSProperties = {
  background: 'var(--surface-inverse, #16150f)',
  color: 'var(--text-inverse, #fff)',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 24px',
  fontSize: '0.95rem',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

type BuildingScreenProps = {
  stageIndex: number
  error: string
  onRetry: () => void
}

export default function BuildingScreen({ stageIndex, error, onRetry }: BuildingScreenProps) {
  useEffect(() => {
    // Injected by hand rather than imported, for the same reason as the inline
    // styles above — an imported stylesheet would be pruned mid-build.
    const style = document.createElement('style')
    style.textContent = KEYFRAMES
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  if (error) {
    return (
      <div style={container}>
        <h2 style={title}>That didn&rsquo;t work</h2>
        <div style={errorBox}>
          <p style={{ margin: '0 0 8px' }}>{error}</p>
          <p style={{ margin: 0, opacity: 0.75 }}>
            Your answers are still here — the details are in the terminal running{' '}
            <code>npm run dev</code>.
          </p>
        </div>
        <button style={retryButton} onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={spinner} className="wizard-building-spinner" />
      <div>
        <h2 style={title}>Building your portfolio</h2>
        <p style={{ ...hint, marginTop: '8px' }}>
          This takes a few seconds. The page will reload into your new site when it&rsquo;s ready.
        </p>
      </div>
      <ul style={list}>
        {BUILD_STAGES.map((stage, i) => {
          const state = i < stageIndex ? 'done' : i === stageIndex ? 'active' : 'pending'
          return (
            <li key={stage.id} style={row(state)}>
              <span style={marker(state)} aria-hidden="true">
                {state === 'done' ? '✓' : ''}
              </span>
              {stage.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
