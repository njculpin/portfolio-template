import styles from './TagFilter.module.css'

export default function TagFilter({
  tags,
  activeTag,
  onFilter,
}: {
  tags: string[]
  activeTag: string
  onFilter: (tag: string) => void
}) {
  return (
    <div className={styles.tagFilter} role="group" aria-label="Filter by tag">
      <button
        className={`${styles.tagFilter__tag} ${
          activeTag === 'all' ? styles['tagFilter__tag--active'] : ''
        }`}
        onClick={() => onFilter('all')}
        aria-pressed={activeTag === 'all'}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`${styles.tagFilter__tag} ${
            activeTag === tag ? styles['tagFilter__tag--active'] : ''
          }`}
          onClick={() => onFilter(tag)}
          aria-pressed={activeTag === tag}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
