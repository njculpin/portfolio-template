import styles from '../SetupWizard.module.css';

type FeatureFlags = {
  blogEnabled: boolean;
  storeEnabled: boolean;
};

type FeaturesProps = {
  formData: FeatureFlags;
  updateFormData: (updates: Partial<FeatureFlags>) => void;
};

const FEATURES: { id: keyof FeatureFlags; title: string; description: string }[] = [
  {
    id: 'blogEnabled',
    title: 'Blog',
    description:
      'Write and publish blog posts in markdown. Great for sharing process, updates, and inspiration.',
  },
  {
    id: 'storeEnabled',
    title: 'Store',
    description:
      'Sell prints, originals, or digital downloads. Run /setup-shop afterwards to connect Stripe or Shopify.',
  },
];

export default function Features({ formData, updateFormData }: FeaturesProps) {
  const toggle = (id: keyof FeatureFlags) => {
    updateFormData(
      id === 'blogEnabled'
        ? { blogEnabled: !formData.blogEnabled }
        : { storeEnabled: !formData.storeEnabled },
    );
  };

  return (
    <div>
      <h2 className={styles.stepTitle}>Features</h2>
      <p className={styles.stepDescription}>Enable optional features for your portfolio.</p>

      <div className={styles.cardGrid}>
        {FEATURES.map((feature) => (
          <div
            key={feature.id}
            className={`${styles.card} ${formData[feature.id] ? styles.cardSelected : ''}`}
            onClick={() => toggle(feature.id)}
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
