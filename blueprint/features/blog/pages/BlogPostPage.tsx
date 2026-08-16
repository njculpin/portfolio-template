import { useParams, Link } from 'react-router';
import { usePost } from '@/hooks/usePosts';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMetaTags } from '@/hooks/useMetaTags';
import MarkdownRenderer from '@/components/MarkdownRenderer/MarkdownRenderer';
import styles from './BlogPostPage.module.css';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { post } = usePost(slug || '');
  useDocumentTitle(post?.title);
  useMetaTags(
    post
      ? {
          title: post.title,
          description: post.excerpt,
          image: post.cover ? `/blog/${post.slug}/${post.cover}` : undefined,
        }
      : undefined,
  );

  if (!post) {
    return (
      <div className={styles.blogPost__notFound}>
        <h1 className={styles.blogPost__notFoundTitle}>Post not found</h1>
        <Link to="/blog" className={styles.blogPost__notFoundLink}>
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className={styles.blogPost}>
      <Link to="/blog" className={styles.blogPost__back}>
        &larr; Back to Blog
      </Link>
      <header className={styles.blogPost__header}>
        <h1 className={styles.blogPost__title}>{post.title}</h1>
        {post.date && (
          <time className={styles.blogPost__date} dateTime={post.date}>
            {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
        {post.tags.length > 0 && (
          <div className={styles.blogPost__tags}>
            {post.tags.map((tag) => (
              <span key={tag} className={styles.blogPost__tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>
      {post.cover && (
        <div className={styles.blogPost__coverWrap}>
          <img
            src={`/blog/${post.slug}/${post.cover}`}
            alt={post.title}
            className={styles.blogPost__cover}
          />
        </div>
      )}
      <MarkdownRenderer contentLoader={post.contentLoader} slug={post.slug} />
    </article>
  );
}
