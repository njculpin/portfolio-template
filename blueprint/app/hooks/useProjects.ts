import { useState } from 'react'
import { loadProjects, loadProject } from '@/config/projects'

export function useProjects() {
  const [projects] = useState(() => loadProjects())
  return { projects }
}

export function useProject(slug: string) {
  const [project] = useState(() => loadProject(slug))
  return { project }
}
