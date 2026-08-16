const postConfigs = import.meta.glob('../../../content/blog/*/post.json', {
  eager: true,
});

const postContent = import.meta.glob<string>('../../../content/blog/*/content.md', {
  eager: false,
  query: '?raw',
  import: 'default',
});

const postCovers = import.meta.glob<string>(
  '../../../content/blog/*/cover.{jpg,jpeg,png,gif,webp,avif}',
  {
    eager: false,
    query: '?url',
    import: 'default',
  },
);

function discoverCover(slug: string) {
  const prefix = `../../../content/blog/${slug}/cover.`;
  const match = Object.keys(postCovers).find((p) => p.startsWith(prefix));
  if (match) {
    return match.slice(`../../../content/blog/${slug}/`.length);
  }
  return null;
}

function readConfig(slug: string) {
  const configPath = `../../../content/blog/${slug}/post.json`;
  const configMod = postConfigs[configPath] as { default: Partial<PostData> } | undefined;
  return configMod?.default || {};
}

function buildPost(slug: string) {
  const config = readConfig(slug);
  const contentLoader = postContent[`../../../content/blog/${slug}/content.md`] || null;
  const cover = config.cover || discoverCover(slug) || '';
  const title = config.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

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
  } satisfies Post;
}

function collectSlugs() {
  const slugs = new Set<string>();

  for (const path of Object.keys(postConfigs)) {
    slugs.add(path.split('/').at(-2)!);
  }
  for (const path of Object.keys(postContent)) {
    const parts = path.split('/');
    const idx = parts.indexOf('blog');
    if (idx >= 0 && parts[idx + 1]) {
      slugs.add(parts[idx + 1]);
    }
  }

  return slugs;
}

export function loadPosts() {
  const posts = Array.from(collectSlugs()).map(buildPost);

  return posts
    .filter((p) => !p.draft)
    .sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return (b.date || '').localeCompare(a.date || '');
    });
}

export function loadPost(slug: string) {
  // Loads including drafts, for direct access by URL
  if (!collectSlugs().has(slug)) return null;
  return buildPost(slug);
}

export interface PostData {
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  cover: string;
  draft?: boolean;
  order?: number;
}

export interface Post {
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  cover: string;
  draft: boolean;
  order?: number;
  slug: string;
  contentLoader: (() => Promise<string>) | null;
}
