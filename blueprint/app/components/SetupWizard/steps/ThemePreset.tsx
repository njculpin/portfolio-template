import styles from '../SetupWizard.module.css';

const PRESETS = [
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Warm tones with serif typography',
    preview: {
      bg: '#f5f0eb',
      text: '#2a2520',
      accent: '#b85c38',
      heading: 'Georgia, serif',
      body: 'Georgia, serif',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean white with sans-serif type',
    preview: {
      bg: '#ffffff',
      text: '#111111',
      accent: '#111111',
      heading: 'Helvetica, Arial, sans-serif',
      body: 'Helvetica, Arial, sans-serif',
    },
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    description: 'Dark background with monospace type',
    preview: {
      bg: '#1a1a1a',
      text: '#e0e0e0',
      accent: '#00ff88',
      heading: '"Courier New", monospace',
      body: '"Courier New", monospace',
    },
  },
];

export default function ThemePreset({ formData, updateFormData }: any) {
  return (
    <div>
      <h2 className={styles.stepTitle}>Theme preset</h2>
      <p className={styles.stepDescription}>
        Pick a starting visual style. You can customize everything later.
      </p>

      <div className={styles.cardGrid3}>
        {PRESETS.map((preset: any) => (
          <div
            key={preset.id}
            className={`${styles.presetCard} ${formData.themePreset === preset.id ? styles.presetCardSelected : ''}`}
            onClick={() => updateFormData({ themePreset: preset.id })}
          >
            <div
              className={styles.presetPreview}
              style={{
                background: preset.preview.bg,
                color: preset.preview.text,
              }}
            >
              <div
                className={styles.presetHeading}
                style={{ fontFamily: preset.preview.heading }}
              >
                Aa
              </div>
              <div
                className={styles.presetBody}
                style={{ fontFamily: preset.preview.body }}
              >
                Portfolio
              </div>
              <div
                className={styles.presetAccent}
                style={{ background: preset.preview.accent }}
              />
            </div>
            <div className={styles.presetInfo}>
              <div className={styles.presetName}>{preset.name}</div>
              <div className={styles.presetDesc}>{preset.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.skipOption}>
        <button
          className={styles.skipButton}
          onClick={() => updateFormData({ themePreset: '' })}
        >
          Skip — I'll customize later
        </button>
      </div>
    </div>
  );
}
