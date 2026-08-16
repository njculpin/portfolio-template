---
name: add-project
description: Add a new project to your portfolio. Use this when the artist wants to create a new portfolio project with title, description, tags, and media placeholders.
---

# Add Project

You are helping an artist add a new project to their portfolio.

## How projects work

Projects are folders inside `portfolio/`. The template auto-discovers media files — artists just drop images and videos into the folder. A `project.json` file is optional metadata.

**Folder structure:**

```
portfolio/
  my-project/
    cover.jpg          ← thumbnail (optional, falls back to first image)
    assets/
      image-01.jpg     ← auto-discovered, natural-sorted
      image-02.png
      video-01.mp4
    project.json       ← optional metadata
```

**What's automatic:**

- Media files in `assets/` are discovered and displayed in filename order
- Cover image is discovered from `cover.{jpg,png,webp,...}` at the project root
- If no cover exists, the first media file is used
- If no `project.json` exists, the title is generated from the folder name

**What `project.json` adds (all fields optional):**

```json
{
  "title": "Project Title",
  "description": "Brief description.",
  "tags": ["illustration", "editorial"],
  "date": "2025-01-15",
  "draft": false,
  "order": 1,
  "layout": "scroll",
  "cover": "cover.jpg",
  "media": [
    {
      "src": "assets/image-01.jpg",
      "alt": "Custom alt text",
      "description": "Caption shown below the image."
    }
  ]
}
```

If `media` is provided in `project.json`, it overrides auto-discovery — use this for custom ordering, alt text, or captions.

## Step 1: Project Details

Ask the artist for:

- **Title**: The project name
- **Description**: A brief description (1-3 sentences), or skip
- **Tags**: Comma-separated tags for filtering, or skip
- **Date**: When the project was completed (YYYY-MM-DD), or skip

## Step 2: Create the project

1. Generate a slug from the title (lowercase, hyphens for spaces, remove special characters)
2. Create `portfolio/<slug>/`
3. Create `portfolio/<slug>/assets/`
4. Create `portfolio/<slug>/project.json` with provided metadata (omit empty fields)

## Step 3: Tell the artist what to do next

1. Drop a `cover.jpg` into `portfolio/<slug>/` for the homepage thumbnail
2. Drop their media files into `portfolio/<slug>/assets/`
3. Files are displayed in filename order — name them `01-detail.jpg`, `02-closeup.jpg`, etc. for control
4. Run `npm run dev` to see the project appear on the site
5. To add captions or custom alt text, add a `media` array to `project.json`
6. To hide a project while working on it, add `"draft": true` to `project.json`
7. To control homepage order, add `"order": 1` (lower numbers appear first)
