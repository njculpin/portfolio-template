---
name: add-blog-post
description: Add a new blog post to your portfolio. Use this when the artist wants to create a new blog post with title, content, tags, and optional cover image.
---

# Add Blog Post

You are helping an artist add a new blog post to their portfolio.

## How blog posts work

Blog posts are folders inside `content/blog/`. Each post has a `post.json` for metadata and a `content.md` for the body text written in markdown.

**Folder structure:**

```
content/blog/
  my-post/
    cover.jpg          ← hero image (optional)
    post.json          ← metadata (required)
    content.md         ← post body in markdown (required)
```

**What's automatic:**

- Cover image is discovered from `cover.{jpg,png,webp,...}` at the post root
- Posts are sorted by date (newest first) unless explicit `order` is set
- Draft posts are hidden from the blog listing

**`post.json` fields:**

```json
{
  "title": "Post Title",
  "excerpt": "A short summary shown on the blog listing page.",
  "tags": ["process", "inspiration"],
  "date": "2025-01-20",
  "draft": false,
  "order": 1
}
```

**`content.md` supports:**

- Headings (`## H2`, `### H3`)
- Bold (`**bold**`), italic (`*italic*`)
- Links (`[text](url)`)
- Images (`![alt](image.jpg)` — relative paths resolve to the post folder)
- Unordered lists (`- item`)
- Code blocks (triple backticks)
- Blockquotes (`> quote`)
- Horizontal rules (`---`)

## Step 1: Check blog is enabled

Read `portfolio.config.json` and check if `blog.enabled` is `true`. If not, add `"blog": { "enabled": true }` to the config and inform the artist that blog has been enabled. Then re-run the scaffold: `cd web && node scripts/scaffold.js`.

## Step 2: Post Details

Ask the artist for:

- **Title**: The post title
- **Content**: What the post should be about — they can give you a topic, an outline, a rough draft, or the full text
- **Tags**: Comma-separated tags for filtering, or skip
- **Date**: Publication date (YYYY-MM-DD), defaults to today

## Step 3: Create the post

1. Generate a slug from the title (lowercase, hyphens for spaces, remove special characters)
2. Create `content/blog/<slug>/`
3. Create `content/blog/<slug>/post.json` with:
   - `title`, `excerpt` (generate a 1-2 sentence summary from the content), `tags`, `date`
4. Create `content/blog/<slug>/content.md` with the post body in markdown
   - If the artist gave a topic or outline, write the full post for them in their voice
   - Keep it authentic — avoid corporate tone, generic filler, or clickbait
   - Use the artist's existing blog posts (if any) as a style reference

## Step 4: Tell the artist what to do next

1. Drop a `cover.jpg` into `content/blog/<slug>/` for an optional hero image
2. Run `npm run dev` to see the post appear on the blog
3. To hide a post while drafting, add `"draft": true` to `post.json`
4. To control blog order, add `"order": 1` (lower numbers appear first)
5. Edit `content.md` anytime — it's just markdown
