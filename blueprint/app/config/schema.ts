import siteConfig from '../../portfolio.config.json';

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
  domains: [] as string[],
  layout: {
    homepage: 'grid',
    project: 'scroll',
    navigation: 'topbar',
  },
  blog: {
    enabled: false,
  },
  store: {
    enabled: false,
    provider: 'stripe' as 'stripe' | 'shopify',
    currency: 'usd',
    layout: 'grid',
    shipFrom: '',
  },
  deployment: 'vercel',
};

export function isDefaultConfig(config: { site?: { name?: string } }) {
  return config.site?.name === 'Artist Name';
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
        platform: string;
        url: string;
      }[],
    },
    layout: {
      ...defaultConfig.layout,
      ...siteConfig.layout,
    },
    blog: {
      ...defaultConfig.blog,
      ...((siteConfig as Record<string, unknown>).blog as
        Partial<typeof defaultConfig.blog> | undefined),
    },
    store: {
      ...defaultConfig.store,
      ...((siteConfig as Record<string, unknown>).store as
        Partial<typeof defaultConfig.store> | undefined),
    },
  };
}
