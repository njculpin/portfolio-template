# Portfolio Template

A self-hosted portfolio website template for artists and designers. Configured via Claude Code — no drag-and-drop editor needed.

## Quick Start

```bash
npm install
npm run dev
```

Then run `/setup-portfolio` in Claude Code to configure your site.

## Configure with Claude

### `/setup-portfolio`

Initial setup. Claude asks for your name, bio, contact info, social links, and layout preferences.

### `/add-project`

Add a new portfolio project. Claude creates the folder — you drop in your files.

### `/theme`

Customize colors, fonts, and spacing.

### `/deploy`

Deploy your site to Vercel, Netlify, or GitHub Pages.

## Adding Projects

Drop files in a folder. That's it.

```
portfolio/
  my-project/
    cover.jpg              ← homepage thumbnail (optional)
    assets/
      01-hero.jpg          ← auto-discovered, sorted by filename
      02-detail.png
      03-process.mp4
    project.json           ← optional metadata
```

**What's automatic:**

- Media files in `assets/` are discovered and displayed in filename order
- Cover is discovered from `cover.{jpg,png,webp,...}` or falls back to the first image
- Title is generated from the folder name if no `project.json` exists

**Optional `project.json`** — add any of these fields:

```json
{
  "title": "Custom Title",
  "description": "Brief description.",
  "tags": ["illustration", "editorial"],
  "date": "2025-01-15",
  "draft": true,
  "order": 1
}
```

- `draft: true` hides the project from the homepage
- `order` controls homepage sort order (lower numbers first)
- To add captions or custom alt text, add a `media` array that overrides auto-discovery

Supported formats: jpg, png, webp, gif, avif (images), mp4, webm (video)

## Layout Options

### Homepage

- **grid** — Uniform thumbnail grid
- **masonry** — Pinterest-style staggered layout
- **columnized** — Magazine-style 3-column with captions
- **justify** — Packed rows filling full width

### Project Pages

- **scroll** — Vertical scroll with reveal animations
- **slideshow** — Fullscreen slides with keyboard navigation
- **splitview** — Media alongside sticky project info

### Navigation

- **topbar** — Horizontal navigation bar
- **sidebar** — Fixed vertical sidebar
- **overlay** — Hamburger menu with fullscreen overlay

## Tech Stack

- Vite + React + TypeScript
- BEM CSS + CSS Modules
- CSS Custom Properties (design tokens via Style Dictionary)
- Motion (animations and page transitions)
- React Router (client-side routing)
