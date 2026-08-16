import { useState } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { useFilteredProjects } from '@/hooks/useFilteredProjects'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMetaTags } from '@/hooks/useMetaTags'
import TagFilter from '@/components/TagFilter/TagFilter'
import ThumbnailGrid from '@/components/ThumbnailGrid/ThumbnailGrid'

export default function HomePage() {
  useDocumentTitle()
  useMetaTags()
  const { projects } = useProjects()
  const [activeTag, setActiveTag] = useState('all')
  const { filtered, allTags } = useFilteredProjects(projects, activeTag)

  return (
    <div>
      {allTags.length > 1 && (
        <TagFilter tags={allTags} activeTag={activeTag} onFilter={setActiveTag} />
      )}
      <ThumbnailGrid projects={filtered} />
    </div>
  )
}
