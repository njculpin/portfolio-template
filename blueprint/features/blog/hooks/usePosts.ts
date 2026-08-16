import { useState, useMemo } from 'react'
import { loadPosts, loadPost } from '@/config/posts'

export function usePosts() {
  const [posts] = useState(() => loadPosts())
  return { posts }
}

export function usePost(slug) {
  const [post] = useState(() => loadPost(slug))
  return { post }
}

export function useFilteredPosts(posts, activeTag) {
  const filtered = useMemo(() => {
    if (activeTag === 'all') return posts
    return posts.filter((p) => p.tags.includes(activeTag))
  }, [posts, activeTag])

  const allTags = useMemo(() => {
    const tagSet = new Set()
    posts.forEach((p) => {
      p.tags.forEach((t) => tagSet.add(t))
    })
    return Array.from(tagSet).sort()
  }, [posts])

  return { filtered, allTags }
}
