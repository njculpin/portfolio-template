import siteConfig from '../../portfolio.config.json'

const defaultConfig = {
  site: {
    name: 'Artist Name',
    tagline: 'Creative Portfolio',
    bio: '',
    location: '',
    resume: '',
    contact: {
      email: '',
    },
    social: [] as { platform: string; url: string }[],
  },
  domain: 'mixed',
  layout: {
    homepage: 'grid',
    project: 'scroll',
    navigation: 'topbar',
  },
  store: {
    enabled: false,
    provider: 'stripe' as 'stripe' | 'shopify',
    currency: 'usd',
    layout: 'grid',
    shipFrom: '',
  },
  deployment: 'vercel',
}

export function isDefaultConfig(config: any) {
  return config.site.name === 'Artist Name'
}

export function loadConfig() {
  return {
    ...defaultConfig,
    ...siteConfig,
    site: {
      ...defaultConfig.site,
      ...siteConfig.site,
      contact: {
        ...defaultConfig.site.contact,
        ...siteConfig.site?.contact,
      },
      social: (siteConfig.site?.social || defaultConfig.site.social) as {
        platform: string
        url: string
      }[],
    },
    layout: {
      ...defaultConfig.layout,
      ...siteConfig.layout,
    },
    store: {
      ...defaultConfig.store,
      ...((siteConfig as Record<string, unknown>).store as
        Partial<typeof defaultConfig.store> | undefined),
    },
  }
}
