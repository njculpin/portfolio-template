import styles from '../SetupWizard.module.css'

export default function Welcome({ onStart }: any) {
  return (
    <div className={styles.welcomeContainer}>
      <h1 className={styles.welcomeTitle}>Welcome to your portfolio</h1>
      <p className={styles.welcomeDescription}>
        Let's set up your creative portfolio in just a few steps. We'll gather some basic info, pick
        a layout, and get you ready to share your work with the world.
      </p>
      <button className={styles.getStartedButton} onClick={onStart}>
        Get Started
      </button>
    </div>
  )
}
