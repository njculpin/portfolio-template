---
name: setup-portfolio
description: Configure your portfolio website. Use this when the artist wants to set up their portfolio for the first time, providing their name, bio, contact information, and layout preferences.
---

# Setup Portfolio

You are helping an artist configure their portfolio website. Walk them through the following questions one section at a time. Be conversational and encouraging.

## Step 1: Personal Information

Ask the artist for:

- **Name**: Their full name or artist name
- **Tagline**: A short description of what they do (e.g., "Designer, Illustrator & Art Director")
- **Bio**: A longer description about themselves and their work (can be multiple paragraphs)
- **Email**: Their contact email address

## Step 2: Social Links

Ask which platforms they'd like to link. Supported platforms:

- Instagram, Twitter, LinkedIn, Behance, Dribbble, Vimeo, YouTube, GitHub

For each platform they want, ask for their profile URL. Collect as an array of `{ "platform": "...", "url": "..." }` objects.

## Step 3: Creative Domain

Ask what best describes their work:

- **illustration** - Illustration & visual art
- **photography** - Photography
- **motion** - Motion design & animation
- **mixed** - Multi-disciplinary / mixed media

## Step 4: Layout Preferences

Show the available options and ask their preference for each:

**Homepage layout** (how project thumbnails are displayed):

- `grid` - Uniform grid of thumbnails (clean, structured)
- `masonry` - Pinterest-style staggered layout (dynamic, organic)
- `columnized` - Magazine-style 3-column layout with captions
- `justify` - Packed rows that fill the full width

**Project page layout** (how individual project content is displayed):

- `scroll` - Vertical scroll through media with scroll-reveal animations
- `slideshow` - Fullscreen slideshow with navigation arrows and dots
- `splitview` - Media on the left, sticky project info on the right

**Navigation style**:

- `topbar` - Clean horizontal navigation bar at the top
- `sidebar` - Fixed vertical sidebar on the left
- `overlay` - Minimal bar with hamburger menu that opens a fullscreen overlay

## Step 5: Deployment Target

Ask where they plan to host their site:

- `vercel` - Vercel (recommended, easiest)
- `netlify` - Netlify
- `github-pages` - GitHub Pages (free)

## Step 6: Generate Configuration

Using their answers, update the file `portfolio.config.json` at the project root with this structure:

```json
{
  "site": {
    "name": "Their Name",
    "tagline": "Their tagline",
    "bio": "Their bio text",
    "contact": {
      "email": "their@email.com"
    },
    "social": [{ "platform": "instagram", "url": "https://instagram.com/..." }]
  },
  "domain": "mixed",
  "layout": {
    "homepage": "grid",
    "project": "scroll",
    "navigation": "topbar"
  },
  "deployment": "vercel"
}
```

## Step 7: Update Page Title

Update the `<title>` tag in `index.html` to include the artist's name.

## Step 8: Create Deployment Config

Based on their deployment choice, ensure the appropriate config file exists:

- **vercel**: `vercel.json`
- **netlify**: `netlify.toml`
- **github-pages**: `.github/workflows/deploy-gh-pages.yml`

## Step 9: Build Tokens

The design tokens will rebuild automatically on the next `npm run dev` or `npm run build`.

## Step 10: Summary

Tell the artist what was configured and remind them to:

1. Add their portfolio projects using the `/add-project` skill
2. Customize their visual theme using the `/theme` skill
3. Run `npm run dev` to preview their site locally
4. Add their own media files to the `portfolio/` directory
