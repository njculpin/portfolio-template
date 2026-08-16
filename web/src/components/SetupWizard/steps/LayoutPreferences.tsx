import styles from '../SetupWizard.module.css'

function OptionGroup({ title, options, value, onChange }: any) {
  return (
    <div className={styles.layoutSection}>
      <h3 className={styles.layoutSectionTitle}>{title}</h3>
      <div className={styles.cardGrid}>
        {options.map((option: any) => (
          <div
            key={option.id}
            className={`${styles.card} ${value === option.id ? styles.cardSelected : ''}`}
            onClick={() => onChange(option.id)}
          >
            <div className={styles.cardTitle}>{option.title}</div>
            <div className={styles.cardDescription}>{option.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const HOMEPAGE_OPTIONS = [
  { id: 'grid', title: 'Grid', description: 'Uniform grid of project thumbnails.' },
  { id: 'masonry', title: 'Masonry', description: 'Pinterest-style variable height layout.' },
  { id: 'columnized', title: 'Columnized', description: 'Stacked columns with varying widths.' },
  { id: 'justify', title: 'Justified', description: 'Edge-to-edge rows of images.' },
]

const PROJECT_OPTIONS = [
  { id: 'scroll', title: 'Scroll', description: 'Vertical scroll through project media.' },
  { id: 'slideshow', title: 'Slideshow', description: 'Full-screen image-by-image navigation.' },
  { id: 'splitview', title: 'Split View', description: 'Media on one side, details on the other.' },
]

const NAVIGATION_OPTIONS = [
  { id: 'topbar', title: 'Top Bar', description: 'Horizontal navigation at the top.' },
  { id: 'sidebar', title: 'Sidebar', description: 'Vertical navigation on the side.' },
  { id: 'overlay', title: 'Overlay', description: 'Full-screen overlay menu on toggle.' },
]

export default function LayoutPreferences({ formData, updateFormData }: any) {
  return (
    <div>
      <h2 className={styles.stepTitle}>Layout preferences</h2>
      <p className={styles.stepDescription}>
        Choose how your portfolio is structured and navigated.
      </p>

      <OptionGroup
        title="Homepage"
        options={HOMEPAGE_OPTIONS}
        value={formData.homepage}
        onChange={(val: any) => updateFormData({ homepage: val })}
      />

      <OptionGroup
        title="Project Page"
        options={PROJECT_OPTIONS}
        value={formData.project}
        onChange={(val: any) => updateFormData({ project: val })}
      />

      <OptionGroup
        title="Navigation"
        options={NAVIGATION_OPTIONS}
        value={formData.navigation}
        onChange={(val: any) => updateFormData({ navigation: val })}
      />
    </div>
  )
}
