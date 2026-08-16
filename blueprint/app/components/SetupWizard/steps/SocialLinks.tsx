import { useState, useEffect } from 'react';
import styles from '../SetupWizard.module.css';

const PLATFORMS = [
  'Instagram',
  'X',
  'LinkedIn',
  'Behance',
  'Dribbble',
  'Vimeo',
  'YouTube',
  'GitHub',
];

export default function SocialLinks({ formData, updateFormData }: any) {
  const [activePlatforms, setActivePlatforms] = useState(
    () => new Set(formData.social.map((s: any) => s.platform))
  );

  useEffect(() => {
    setActivePlatforms(new Set(formData.social.map((s: any) => s.platform)));
  }, [formData.social]);

  const togglePlatform = (platform: any) => {
    const next = new Set(activePlatforms);
    if (next.has(platform)) {
      next.delete(platform);
      const updated = formData.social.filter((s: any) => s.platform !== platform);
      updateFormData({ social: updated });
    } else {
      next.add(platform);
      const updated = [...formData.social, { platform, url: '' }];
      updateFormData({ social: updated });
    }
    setActivePlatforms(next);
  };

  const updateUrl = (platform: any, url: any) => {
    const updated = formData.social.map((s: any) =>
      s.platform === platform ? { ...s, url } : s
    );
    updateFormData({ social: updated });
  };

  return (
    <div>
      <h2 className={styles.stepTitle}>Social links</h2>
      <p className={styles.stepDescription}>
        Select the platforms you'd like to link to from your portfolio.
      </p>

      <div className={styles.socialPills}>
        {PLATFORMS.map((platform: any) => (
          <button
            key={platform}
            className={`${styles.socialPill} ${activePlatforms.has(platform) ? styles.socialPillActive : ''}`}
            onClick={() => togglePlatform(platform)}
          >
            {platform}
          </button>
        ))}
      </div>

      {formData.social.length > 0 && (
        <div className={styles.socialInputs}>
          {formData.social.map((item: any) => (
            <div key={item.platform} className={styles.socialInputRow}>
              <span className={styles.socialInputLabel}>{item.platform}</span>
              <input
                className={styles.socialInput}
                value={item.url}
                onChange={(e: any) => updateUrl(item.platform, e.target.value)}
                placeholder={`Your ${item.platform} URL`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
