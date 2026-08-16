import { useState } from 'react';
import { usePosts, useFilteredPosts } from '@/hooks/usePosts';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMetaTags } from '@/hooks/useMetaTags';
import TagFilter from '@/components/TagFilter/TagFilter';
import PostList from '@/components/PostList/PostList';

export default function BlogPage() {
  useDocumentTitle('Blog');
  useMetaTags({ title: 'Blog' });
  const { posts } = usePosts();
  const [activeTag, setActiveTag] = useState('all');
  const { filtered, allTags } = useFilteredPosts(posts, activeTag);

  return (
    <div>
      {allTags.length > 1 && (
        <TagFilter tags={allTags} activeTag={activeTag} onFilter={setActiveTag} />
      )}
      <PostList posts={filtered} />
    </div>
  );
}
