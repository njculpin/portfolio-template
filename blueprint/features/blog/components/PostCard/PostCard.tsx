import { Link } from 'react-router';
import type { Post } from '@/config/posts';
import styles from './PostCard.module.css';

export default function PostCard({ post }: { post: Post }) {
  const coverUrl = post.cover ? `/blog/${post.slug}/${post.cover}` : null;

  return (
    <Link to={`/blog/${post.slug}`} className={styles.postCard}>
      {coverUrl && (
        <div className={styles.postCard__imageWrap}>
          <img src={coverUrl} alt={post.title} className={styles.postCard__image} loading="lazy" />
        </div>
      )}
      <div className={styles.postCard__body}>
        {post.date && (
          <time className={styles.postCard__date} dateTime={post.date}>
            {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
        <h2 className={styles.postCard__title}>{post.title}</h2>
        {post.excerpt && <p className={styles.postCard__excerpt}>{post.excerpt}</p>}
        {post.tags.length > 0 && (
          <div className={styles.postCard__tags}>
            {post.tags.map((tag) => (
              <span key={tag} className={styles.postCard__tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
