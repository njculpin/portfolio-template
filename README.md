# Portfolio Template

A self-hosted portfolio website for artists and designers. Set up through a browser wizard, customize with Claude Code.

## Quick Start

```bash
cd web
npm install
npm run dev
```

Your browser opens with a setup wizard. Fill in your name, pick a layout, choose a theme — your portfolio is ready in minutes.

## Project Structure

```
blueprint/    All available components, layouts, and integrations
web/          Your website — this is where you work
```

`blueprint/` is the parts shelf. The setup wizard pulls what you need into `web/`. After setup, `web/` is a standard Vite project you fully own.

## After Setup

The wizard gives you these commands to run in Claude Code:

### `/add-project`

Add a portfolio project. Claude creates the folder — you drop in your files.

### `/theme`

Customize colors, fonts, and spacing.

### `/setup-shop`

Sell prints, originals, or digital downloads through Stripe or Shopify.

### `/deploy`

Put your site live on Vercel, Netlify, or GitHub Pages.

## Adding Projects

Drop files in a folder. That's it.

```
web/portfolio/
  my-project/
    cover.jpg              <- homepage thumbnail (auto-discovered)
    assets/
      01-hero.jpg          <- sorted by filename
      02-detail.png
      03-process.mp4
    project.json           <- optional metadata
```

Media files are auto-discovered. Cover falls back to the first image. Title comes from the folder name.

Optional `project.json`:

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

Supported formats: jpg, png, webp, gif, avif (images), mp4, webm (video)

## Layout Options

**Homepage:** grid, masonry, columnized, justify

**Project pages:** scroll, slideshow, splitview

**Navigation:** topbar, sidebar, overlay

## Tech Stack

Vite, React, TypeScript, CSS Modules, Style Dictionary, Motion, React Router
