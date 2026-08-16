import { useMemo } from 'react'
import { Project } from '@/config/projects'

export function useFilteredProjects(projects: Project[], activeTag: string) {
  const filtered = useMemo(() => {
    if (activeTag === 'all') return projects
    return projects.filter((p) => p.tags.includes(activeTag))
  }, [projects, activeTag])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    projects.forEach((p) => p.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [projects])

  return { filtered, allTags }
}
