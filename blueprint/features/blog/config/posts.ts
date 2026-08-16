const postConfigs = import.meta.glob('../../../content/blog/*/post.json', {
  eager: true,
})

const postContent = import.meta.glob('../../../content/blog/*/content.md', {
  eager: false,
  query: '?raw',
  import: 'default',
})

const postCovers = import.meta.glob('../../../content/blog/*/cover.{jpg,jpeg,png,gif,webp,avif}', {
  eager: false,
  query: '?url',
  import: 'default',
})

function discoverCover(slug) {
  const prefix = `../../../content/blog/${slug}/cover.`
  const match = Object.keys(postCovers).find((p) => p.startsWith(prefix))
  if (match) {
    return match.slice(`../../../content/blog/${slug}/`.length)
  }
  return null
}

export function loadPosts() {
  const slugs = new Set()

  for (const path of Object.keys(postConfigs)) {
    slugs.add(path.split('/').at(-2))
  }
  for (const path of Object.keys(postContent)) {
    const parts = path.split('/')
    const idx = parts.indexOf('blog')
    if (idx >= 0 && parts[idx + 1]) {
      slugs.add(parts[idx + 1])
    }
  }

  const posts = Array.from(slugs).map((slug) => {
    const configPath = `../../../content/blog/${slug}/post.json`
    const configMod = postConfigs[configPath]
    const config = configMod?.default || {}

    const contentPath = `../../../content/blog/${slug}/content.md`
    const contentLoader = postContent[contentPath] || null

    const discoveredCover = discoverCover(slug)
    const cover = config.cover || discoveredCover || ''

    const title = config.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

    return {
      title,
      excerpt: config.excerpt || '',
      date: config.date || '',
      tags: config.tags || [],
      cover,
      draft: config.draft ?? false,
      order: config.order,
      slug,
      contentLoader,
    }
  })

  return posts
    .filter((p) => !p.draft)
    .sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order
      if (a.order !== undefined) return -1
      if (b.order !== undefined) return 1
      return (b.date || '').localeCompare(a.date || '')
    })
}

export function loadPost(slug) {
  const allSlugs = new Set()
  for (const path of Object.keys(postConfigs)) {
    allSlugs.add(path.split('/').at(-2))
  }
  for (const path of Object.keys(postContent)) {
    const parts = path.split('/')
    const idx = parts.indexOf('blog')
    if (idx >= 0 && parts[idx + 1]) allSlugs.add(parts[idx + 1])
  }

  if (!allSlugs.has(slug)) return null

  const configPath = `../../../content/blog/${slug}/post.json`
  const configMod = postConfigs[configPath]
  const config = configMod?.default || {}

  const contentPath = `../../../content/blog/${slug}/content.md`
  const contentLoader = postContent[contentPath] || null

  const discoveredCover = discoverCover(slug)
  const cover = config.cover || discoveredCover || ''

  const title = config.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    title,
    excerpt: config.excerpt || '',
    date: config.date || '',
    tags: config.tags || [],
    cover,
    draft: config.draft ?? false,
    order: config.order,
    slug,
    contentLoader,
  }
}
