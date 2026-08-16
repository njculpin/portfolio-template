const projectConfigs = import.meta.glob('../../../content/portfolio/*/project.json', {
  eager: true,
});

const mediaFiles = import.meta.glob(
  '../../../content/portfolio/*/assets/*.{jpg,jpeg,png,gif,webp,avif,mp4,webm,mov}',
  { eager: false, query: '?url', import: 'default' },
);

const coverFiles = import.meta.glob(
  '../../../content/portfolio/*/cover.{jpg,jpeg,png,gif,webp,avif}',
  {
    eager: false,
    query: '?url',
    import: 'default',
  },
);

function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function discoverMedia(slug: string) {
  const prefix = `../../../content/portfolio/${slug}/assets/`;
  const discovered = Object.keys(mediaFiles)
    .filter((p) => p.startsWith(prefix))
    .sort((a, b) => naturalSort(a, b))
    .map((p) => {
      const filename = p.slice(prefix.length);
      return {
        src: `assets/${filename}`,
        alt: filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      };
    });
  return discovered;
}

function discoverCover(slug: string) {
  const prefix = `../../../content/portfolio/${slug}/cover.`;
  const match = Object.keys(coverFiles).find((p) => p.startsWith(prefix));
  if (match) {
    return match.slice(`../../../content/portfolio/${slug}/`.length);
  }
  return null;
}

export function loadProjects() {
  // Collect all project slugs from both configs and media folders
  const slugs = new Set<string>();

  for (const path of Object.keys(projectConfigs)) {
    slugs.add(path.split('/').at(-2)!);
  }
  for (const path of Object.keys(mediaFiles)) {
    const parts = path.split('/');
    const idx = parts.indexOf('portfolio');
    if (idx >= 0 && parts[idx + 1]) {
      slugs.add(parts[idx + 1]);
    }
  }
  for (const path of Object.keys(coverFiles)) {
    const parts = path.split('/');
    const idx = parts.indexOf('portfolio');
    if (idx >= 0 && parts[idx + 1]) {
      slugs.add(parts[idx + 1]);
    }
  }

  const projects = Array.from(slugs).map((slug) => {
    const configPath = `../../../content/portfolio/${slug}/project.json`;
    const configMod = projectConfigs[configPath] as { default: Partial<ProjectData> } | undefined;
    const config = configMod?.default || {};

    // Media: use project.json media if provided, otherwise auto-discover
    const discovered = discoverMedia(slug);
    const media = config.media && config.media.length > 0 ? config.media : discovered;

    // Cover: use project.json cover if provided, otherwise discover, otherwise first media
    const discoveredCover = discoverCover(slug);
    const cover = config.cover || discoveredCover || (media[0]?.src ?? 'cover.jpg');

    // Title: use project.json title, otherwise humanize the slug
    const title = config.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      title,
      description: config.description || '',
      tags: config.tags || [],
      date: config.date || '',
      cover,
      media,
      layout: config.layout,
      draft: config.draft ?? false,
      order: config.order,
      slug,
    } satisfies Project;
  });

  return projects
    .filter((p) => !p.draft)
    .sort((a, b) => {
      // Sort by explicit order first, then by date
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return (b.date || '').localeCompare(a.date || '');
    });
}

export function loadProject(slug: string) {
  // Load including drafts for direct access
  const allSlugs = new Set<string>();
  for (const path of Object.keys(projectConfigs)) {
    allSlugs.add(path.split('/').at(-2)!);
  }
  for (const path of Object.keys(mediaFiles)) {
    const parts = path.split('/');
    const idx = parts.indexOf('portfolio');
    if (idx >= 0 && parts[idx + 1]) allSlugs.add(parts[idx + 1]);
  }

  if (!allSlugs.has(slug)) return null;

  const configPath = `../../../content/portfolio/${slug}/project.json`;
  const configMod = projectConfigs[configPath] as { default: Partial<ProjectData> } | undefined;
  const config = configMod?.default || {};

  const discovered = discoverMedia(slug);
  const media = config.media && config.media.length > 0 ? config.media : discovered;
  const discoveredCover = discoverCover(slug);
  const cover = config.cover || discoveredCover || (media[0]?.src ?? 'cover.jpg');
  const title = config.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title,
    description: config.description || '',
    tags: config.tags || [],
    date: config.date || '',
    cover,
    media,
    layout: config.layout,
    draft: config.draft ?? false,
    order: config.order,
    slug,
  } satisfies Project;
}

export interface ProjectData {
  title: string;
  description: string;
  tags: string[];
  date: string;
  cover: string;
  media: { src: string; alt: string; description?: string }[];
  layout?: string;
  draft?: boolean;
  order?: number;
}

export interface Project {
  title: string;
  description: string;
  tags: string[];
  date: string;
  cover: string;
  media: { src: string; alt: string; description?: string }[];
  layout?: string;
  draft: boolean;
  order?: number;
  slug: string;
}
