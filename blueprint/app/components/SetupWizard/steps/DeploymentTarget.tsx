import styles from '../SetupWizard.module.css';

const TARGETS = [
  {
    id: 'vercel',
    title: 'Vercel',
    description: 'Fast global CDN with automatic deployments from Git.',
    badge: 'Recommended',
  },
  {
    id: 'netlify',
    title: 'Netlify',
    description: 'Simple deploys with built-in forms and serverless functions.',
    badge: null,
  },
  {
    id: 'github-pages',
    title: 'GitHub Pages',
    description: 'Free static hosting directly from your repository.',
    badge: null,
  },
];

export default function DeploymentTarget({ formData, updateFormData }: any) {
  return (
    <div>
      <h2 className={styles.stepTitle}>Deployment</h2>
      <p className={styles.stepDescription}>
        Where would you like to host your portfolio?
      </p>

      <div className={styles.cardGrid3}>
        {TARGETS.map((target: any) => (
          <div
            key={target.id}
            className={`${styles.card} ${formData.deployment === target.id ? styles.cardSelected : ''}`}
            onClick={() => updateFormData({ deployment: target.id })}
          >
            <div className={styles.cardTitle}>
              {target.title}
              {target.badge && (
                <span className={styles.badge} style={{ marginLeft: 8 }}>
                  {target.badge}
                </span>
              )}
            </div>
            <div className={styles.cardDescription}>{target.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
