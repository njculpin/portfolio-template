import PostCard from '@/components/PostCard/PostCard';
import type { Post } from '@/config/posts';
import styles from './PostList.module.css';

export default function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className={styles.postList__empty}>No posts yet.</p>;
  }

  return (
    <div className={styles.postList}>
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
