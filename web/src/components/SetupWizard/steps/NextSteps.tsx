import { useState } from 'react'
import styles from '../SetupWizard.module.css'

const COMMANDS = [
  {
    name: '/add-project',
    description: 'Add a new project with title, description, tags, and media.',
  },
  {
    name: '/theme',
    description: 'Customize colors, fonts, spacing, and visual style.',
  },
  {
    name: '/setup-shop',
    description: 'Set up an online store to sell prints, originals, or digital downloads.',
  },
  {
    name: '/deploy',
    description: 'Deploy your portfolio to your chosen hosting provider.',
  },
]

export default function NextSteps() {
  const [copied, setCopied] = useState('')

  const handleCopy = (command: any) => {
    navigator.clipboard.writeText(command)
    setCopied(command)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleViewPortfolio = () => {
    window.location.reload()
  }

  return (
    <div className={styles.nextStepsContainer}>
      <h2 className={styles.stepTitle}>Your portfolio is ready!</h2>
      <p className={styles.stepDescription}>
        Use these commands to continue building and customizing your site.
      </p>

      <div className={styles.commandCards}>
        {COMMANDS.map((cmd: any) => (
          <div key={cmd.name} className={styles.commandCard}>
            <div className={styles.commandHeader}>
              <span className={styles.commandName}>{cmd.name}</span>
              <button className={styles.copyButton} onClick={() => handleCopy(cmd.name)}>
                {copied === cmd.name ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className={styles.commandDescription}>{cmd.description}</div>
          </div>
        ))}
      </div>

      <button className={styles.viewPortfolioButton} onClick={handleViewPortfolio}>
        View My Portfolio
      </button>
    </div>
  )
}
