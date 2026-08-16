const productConfigs = import.meta.glob('../../../content/store/*/product.json', {
  eager: true,
})

const productImages = import.meta.glob('../../../content/store/*/images/*.{jpg,jpeg,png,gif,webp,avif}', {
  eager: false,
  query: '?url',
  import: 'default',
})

const productCovers = import.meta.glob('../../../content/store/*/cover.{jpg,jpeg,png,gif,webp,avif}', {
  eager: false,
  query: '?url',
  import: 'default',
})

function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function discoverImages(slug: string) {
  const prefix = `../../../content/store/${slug}/images/`
  return Object.keys(productImages)
    .filter((p) => p.startsWith(prefix))
    .sort((a, b) => naturalSort(a, b))
    .map((p) => {
      const filename = p.slice(prefix.length)
      return {
        src: `images/${filename}`,
        alt: filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      }
    })
}

function discoverCover(slug: string) {
  const prefix = `../../../content/store/${slug}/cover.`
  const match = Object.keys(productCovers).find((p) => p.startsWith(prefix))
  if (match) {
    return match.slice(`../../../content/store/${slug}/`.length)
  }
  return null
}

export function loadProducts() {
  const slugs = new Set<string>()

  for (const path of Object.keys(productConfigs)) {
    slugs.add(path.split('/').at(-2)!)
  }
  for (const path of Object.keys(productImages)) {
    const parts = path.split('/')
    const idx = parts.indexOf('store')
    if (idx >= 0 && parts[idx + 1]) {
      slugs.add(parts[idx + 1])
    }
  }
  for (const path of Object.keys(productCovers)) {
    const parts = path.split('/')
    const idx = parts.indexOf('store')
    if (idx >= 0 && parts[idx + 1]) {
      slugs.add(parts[idx + 1])
    }
  }

  const products = Array.from(slugs).map((slug) => {
    const configPath = `../../../content/store/${slug}/product.json`
    const configMod = productConfigs[configPath] as { default: Partial<ProductData> } | undefined
    const config = configMod?.default || {}

    const discovered = discoverImages(slug)
    const images = config.images && config.images.length > 0 ? config.images : discovered

    const discoveredCover = discoverCover(slug)
    const cover = config.cover || discoveredCover || (images[0]?.src ?? 'cover.jpg')

    const title = config.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

    return {
      title,
      description: config.description || '',
      price: config.price || 0,
      compareAtPrice: config.compareAtPrice,
      category: config.category || '',
      tags: config.tags || [],
      cover,
      images,
      providerId: config.providerId || config.stripePriceId || config.shopifyVariantId || '',
      inStock: config.inStock ?? true,
      edition: config.edition || '',
      variants: (config.variants || []).map((v: any) => ({
        name: v.name,
        price: v.price,
        providerId: v.providerId || v.stripePriceId || v.shopifyVariantId || '',
      })),
      draft: config.draft ?? false,
      order: config.order,
      slug,
    } satisfies Product
  })

  return products
    .filter((p) => !p.draft)
    .sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order
      if (a.order !== undefined) return -1
      if (b.order !== undefined) return 1
      return a.title.localeCompare(b.title)
    })
}

export function loadProduct(slug: string) {
  const allSlugs = new Set<string>()
  for (const path of Object.keys(productConfigs)) {
    allSlugs.add(path.split('/').at(-2)!)
  }
  for (const path of Object.keys(productImages)) {
    const parts = path.split('/')
    const idx = parts.indexOf('store')
    if (idx >= 0 && parts[idx + 1]) allSlugs.add(parts[idx + 1])
  }

  if (!allSlugs.has(slug)) return null

  const configPath = `../../../content/store/${slug}/product.json`
  const configMod = productConfigs[configPath] as { default: Partial<ProductData> } | undefined
  const config = configMod?.default || {}

  const discovered = discoverImages(slug)
  const images = config.images && config.images.length > 0 ? config.images : discovered
  const discoveredCover = discoverCover(slug)
  const cover = config.cover || discoveredCover || (images[0]?.src ?? 'cover.jpg')
  const title = config.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    title,
    description: config.description || '',
    price: config.price || 0,
    compareAtPrice: config.compareAtPrice,
    category: config.category || '',
    tags: config.tags || [],
    cover,
    images,
    providerId: config.providerId || config.stripePriceId || config.shopifyVariantId || '',
    inStock: config.inStock ?? true,
    edition: config.edition || '',
    variants: (config.variants || []).map((v: any) => ({
      name: v.name,
      price: v.price,
      providerId: v.providerId || v.stripePriceId || v.shopifyVariantId || '',
    })),
    draft: config.draft ?? false,
    order: config.order,
    slug,
  } satisfies Product
}

export interface ProductVariant {
  name: string
  price: number
  providerId: string
}

export interface ProductData {
  title: string
  description: string
  price: number
  compareAtPrice?: number
  category: string
  tags: string[]
  cover: string
  images: { src: string; alt: string }[]
  providerId: string
  stripePriceId?: string
  shopifyVariantId?: string
  inStock: boolean
  edition: string
  variants: ProductVariant[]
  draft?: boolean
  order?: number
}

export interface Product {
  title: string
  description: string
  price: number
  compareAtPrice?: number
  category: string
  tags: string[]
  cover: string
  images: { src: string; alt: string }[]
  providerId: string
  inStock: boolean
  edition: string
  variants: ProductVariant[]
  draft: boolean
  order?: number
  slug: string
}
