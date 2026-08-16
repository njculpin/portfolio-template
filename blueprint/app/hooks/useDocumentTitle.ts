import { useEffect } from 'react'
import { useConfig } from './useConfig'

export function useDocumentTitle(pageTitle?: string) {
  const config = useConfig()
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} — ${config.site.name}` : config.site.name
  }, [pageTitle, config.site.name])
}
