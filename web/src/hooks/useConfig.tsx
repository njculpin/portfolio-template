import { createContext, useContext, useState, ReactNode } from 'react'
import { loadConfig } from '@/config/schema'

const ConfigContext = createContext<ReturnType<typeof loadConfig> | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config] = useState(() => loadConfig())

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}

export function useConfig() {
  const config = useContext(ConfigContext)
  if (!config) throw new Error('useConfig must be used within ConfigProvider')
  return config
}
