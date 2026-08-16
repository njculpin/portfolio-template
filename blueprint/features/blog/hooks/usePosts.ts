import { useState, useMemo } from 'react';
import { loadPosts, loadPost, type Post } from '@/config/posts';

export function usePosts() {
  const [posts] = useState(() => loadPosts());
  return { posts };
}

export function usePost(slug: string) {
  const [post] = useState(() => loadPost(slug));
  return { post };
}

export function useFilteredPosts(posts: Post[], activeTag: string) {
  const filtered = useMemo(() => {
    if (activeTag === 'all') return posts;
    return posts.filter((p) => p.tags.includes(activeTag));
  }, [posts, activeTag]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((p) => {
      p.tags.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  return { filtered, allTags };
}
