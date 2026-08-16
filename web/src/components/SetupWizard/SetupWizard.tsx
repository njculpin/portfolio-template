import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import styles from './SetupWizard.module.css'
import Welcome from './steps/Welcome'
import PersonalInfo from './steps/PersonalInfo'
import SocialLinks from './steps/SocialLinks'
import CreativeDomain from './steps/CreativeDomain'
import LayoutPreferences from './steps/LayoutPreferences'
import ThemePreset from './steps/ThemePreset'
import DeploymentTarget from './steps/DeploymentTarget'
import Summary from './steps/Summary'
import NextSteps from './steps/NextSteps'

const TOTAL_STEPS = 9

export default function SetupWizard() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    bio: '',
    email: '',
    location: '',
    social: [] as any[],
    domain: 'illustration',
    homepage: 'grid',
    project: 'scroll',
    navigation: 'topbar',
    themePreset: '',
    deployment: 'vercel',
  })

  const updateFormData = (updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }))
  }

  const goNext = () => {
    setDirection(1)
    setStep((s: any) => Math.min(s + 1, TOTAL_STEPS - 1))
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s: any) => Math.max(s - 1, 0))
  }

  const goToStep = (target: any) => {
    setDirection(target > step ? 1 : -1)
    setStep(target)
  }

  const canContinue = () => {
    if (step === 1) {
      return formData.name.trim() !== '' && formData.email.trim() !== ''
    }
    return true
  }

  const progress = (step / (TOTAL_STEPS - 1)) * 100

  const renderStep = () => {
    switch (step) {
      case 0:
        return <Welcome onStart={goNext} />
      case 1:
        return <PersonalInfo formData={formData} updateFormData={updateFormData} />
      case 2:
        return <SocialLinks formData={formData} updateFormData={updateFormData} />
      case 3:
        return <CreativeDomain formData={formData} updateFormData={updateFormData} />
      case 4:
        return <LayoutPreferences formData={formData} updateFormData={updateFormData} />
      case 5:
        return <ThemePreset formData={formData} updateFormData={updateFormData} />
      case 6:
        return <DeploymentTarget formData={formData} updateFormData={updateFormData} />
      case 7:
        return <Summary formData={formData} goToStep={goToStep} onSave={goNext} />
      case 8:
        return <NextSteps />
      default:
        return null
    }
  }

  const showNavigation = step > 0 && step < 7

  return (
    <div className={styles.wizard}>
      <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      <div className={styles.content}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction * 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -80, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={styles.stepContainer}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {showNavigation && (
          <div className={styles.navigation}>
            <button className={styles.backButton} onClick={goBack}>
              Back
            </button>
            <button className={styles.continueButton} onClick={goNext} disabled={!canContinue()}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
