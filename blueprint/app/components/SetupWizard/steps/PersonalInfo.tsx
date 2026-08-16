import styles from '../SetupWizard.module.css';

export default function PersonalInfo({ formData, updateFormData }: any) {
  const handleChange = (field: any) => (e: any) => {
    updateFormData({ [field]: e.target.value });
  };

  return (
    <div>
      <h2 className={styles.stepTitle}>About you</h2>
      <p className={styles.stepDescription}>
        Tell us a bit about yourself. This info will appear on your portfolio.
      </p>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Name <span className={styles.required}>*</span>
        </label>
        <input
          className={styles.input}
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="Your full name"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Tagline</label>
        <input
          className={styles.input}
          value={formData.tagline}
          onChange={handleChange('tagline')}
          placeholder="A short description of what you do"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Bio</label>
        <textarea
          className={styles.textarea}
          value={formData.bio}
          onChange={handleChange('bio')}
          placeholder="A longer description about yourself and your work"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Email <span className={styles.required}>*</span>
        </label>
        <input
          className={styles.input}
          value={formData.email}
          onChange={handleChange('email')}
          placeholder="your@email.com"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Location</label>
        <input
          className={styles.input}
          value={formData.location}
          onChange={handleChange('location')}
          placeholder="City, Country"
        />
      </div>
    </div>
  );
}
