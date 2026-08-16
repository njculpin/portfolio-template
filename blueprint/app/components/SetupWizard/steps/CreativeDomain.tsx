import styles from '../SetupWizard.module.css';

const DOMAINS = [
  {
    id: 'illustration',
    icon: '\uD83C\uDFA8',
    title: 'Illustration',
    description: 'Digital or traditional illustration, concept art, and visual storytelling.',
  },
  {
    id: 'photography',
    icon: '\uD83D\uDCF7',
    title: 'Photography',
    description: 'Fine art, editorial, commercial, or documentary photography.',
  },
  {
    id: 'motion',
    icon: '\uD83C\uDFAC',
    title: 'Motion',
    description: 'Animation, motion graphics, video, and time-based media.',
  },
  {
    id: 'mixed',
    icon: '\u2728',
    title: 'Mixed Media',
    description: 'A blend of disciplines and creative practices.',
  },
];

export default function CreativeDomain({ formData, updateFormData }: any) {
  return (
    <div>
      <h2 className={styles.stepTitle}>Creative domain</h2>
      <p className={styles.stepDescription}>
        What kind of work will you be showcasing? This helps us tailor your layout.
      </p>

      <div className={styles.cardGrid}>
        {DOMAINS.map((domain: any) => (
          <div
            key={domain.id}
            className={`${styles.card} ${formData.domain === domain.id ? styles.cardSelected : ''}`}
            onClick={() => updateFormData({ domain: domain.id })}
          >
            <div className={styles.cardIcon}>{domain.icon}</div>
            <div className={styles.cardTitle}>{domain.title}</div>
            <div className={styles.cardDescription}>{domain.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
