import styles from '../SetupWizard.module.css';

const FEATURES = [
  {
    id: 'blogEnabled',
    title: 'Blog',
    description: 'Write and publish blog posts in markdown. Great for sharing process, updates, and inspiration.',
  },
];

export default function Features({ formData, updateFormData }: any) {
  return (
    <div>
      <h2 className={styles.stepTitle}>Features</h2>
      <p className={styles.stepDescription}>
        Enable optional features for your portfolio.
      </p>

      <div className={styles.cardGrid}>
        {FEATURES.map((feature: any) => (
          <div
            key={feature.id}
            className={`${styles.card} ${formData[feature.id] ? styles.cardSelected : ''}`}
            onClick={() => updateFormData({ [feature.id]: !formData[feature.id] })}
          >
            <div className={styles.cardTitle}>
              {feature.title}
              {formData[feature.id] && (
                <span className={styles.badge} style={{ marginLeft: 8 }}>
                  Enabled
                </span>
              )}
            </div>
            <div className={styles.cardDescription}>{feature.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
