import { ReactNode } from 'react'
import { motion } from 'motion/react'
import styles from './PageTransition.module.css'

const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
}

export default function PageTransition({
  children,
  variant = 'slideUp',
}: {
  children: ReactNode
  variant?: keyof typeof transitionVariants
}) {
  const v = transitionVariants[variant]

  return (
    <motion.div
      className={styles.pageTransition}
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
