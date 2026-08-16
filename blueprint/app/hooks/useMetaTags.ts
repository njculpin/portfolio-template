import { useEffect } from 'react'
import { useConfig } from './useConfig'

function setMeta(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useMetaTags(opts?: { title?: string; description?: string; image?: string }) {
  const config = useConfig()

  useEffect(() => {
    const title = opts?.title ? `${opts.title} — ${config.site.name}` : config.site.name
    const description = opts?.description || config.site.tagline || ''
    const image = opts?.image || ''

    setMeta('og:title', title)
    setMeta('og:description', description)
    setMeta('og:type', 'website')
    if (image) setMeta('og:image', image)

    // Twitter card
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    if (image) setMeta('twitter:image', image)

    // Standard description
    let descEl = document.querySelector('meta[name="description"]')
    if (!descEl) {
      descEl = document.createElement('meta')
      descEl.setAttribute('name', 'description')
      document.head.appendChild(descEl)
    }
    descEl.setAttribute('content', description)
  }, [opts?.title, opts?.description, opts?.image, config.site.name, config.site.tagline])
}
