---
name: theme
description: Customize your portfolio's visual theme including colors, fonts, and spacing. Use this when the artist wants to change the look and feel of their site.
---

# Theme Customization

You are helping an artist customize the visual theme of their portfolio. Start with presets, then refine.

## Step 1: Choose a starting point

Ask the artist if they'd like to start from a preset or customize from scratch:

**Presets** (in `src/tokens/presets/`):

- **Editorial** — Refined serif typography, warm earthy tones, generous spacing. Inspired by art magazines and gallery catalogs.
- **Minimal** — Clean sans-serif, high contrast black and white, tight spacing. Lets the work speak for itself.
- **Brutalist** — Bold monospace type, dark background, raw industrial aesthetic with a bright red accent.

If they choose a preset, read the preset JSON file from `src/tokens/presets/<name>.json` and apply it (see Step 5 below).

If they want to customize from scratch, continue to Step 2.

## Step 2: Color Scheme

Ask the artist about their color preferences:

**Surface style:**

- `light` — Light background with dark text (default)
- `dark` — Dark background with light text

**Accent color:**

- Ask for a hex color code, or a description like "warm red", "deep blue"
- If they give a description, choose an appropriate hex value

## Step 3: Typography

Ask about their font preferences:

**Heading font** — Suggest options:

- Playfair Display (serif, elegant)
- Inter (sans, modern)
- Space Grotesk (sans, geometric)
- DM Serif Display (serif, editorial)
- Space Mono (mono, technical)
- Or any Google Font they name

**Body font** — Suggest options:

- Inter (sans, modern)
- Source Sans 3 (sans, readable)
- Space Grotesk (sans, geometric)
- Or any Google Font they name

## Step 4: Spacing Density

Ask about spacing:

- `compact` — Tighter spacing, more content visible
- `comfortable` — Balanced (default)
- `spacious` — More breathing room, gallery-like

## Step 5: Apply the theme

Whether from a preset or custom choices, apply as follows:

### Colors

Update `src/tokens/global/colors.json`:

- Set `color.accent.$value` to the accent color
- If dark mode: set `color.black` to a dark value and `color.white` to a light value, invert the gray scale

Update `src/tokens/semantic/theme.json`:

**For light mode:**

```json
{
  "surface": {
    "primary": { "$value": "{color.white}" },
    "secondary": { "$value": "{color.gray.100}" },
    "inverse": { "$value": "{color.gray.900}" }
  },
  "text": {
    "primary": { "$value": "{color.gray.900}" },
    "secondary": { "$value": "{color.gray.500}" },
    "inverse": { "$value": "{color.white}" },
    "accent": { "$value": "{color.accent}" }
  }
}
```

**For dark mode:**

```json
{
  "surface": {
    "primary": { "$value": "{color.black}" },
    "secondary": { "$value": "{color.gray.900}" },
    "inverse": { "$value": "{color.white}" }
  },
  "text": {
    "primary": { "$value": "{color.white}" },
    "secondary": { "$value": "{color.gray.400}" },
    "inverse": { "$value": "{color.black}" },
    "accent": { "$value": "{color.accent}" }
  }
}
```

### Typography

Update `src/tokens/global/typography.json`:

- Set `font.family.heading.$value` to their chosen heading font with fallbacks
- Set `font.family.body.$value` to their chosen body font with fallbacks

If using Google Fonts, add a `<link>` tag in `index.html` `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Font+Name:wght@400;500;700&display=swap"
  rel="stylesheet"
/>
```

### Spacing

Update `src/tokens/global/spacing.json` based on density:

**Compact:**

```json
{
  "2xs": "0.125rem",
  "xs": "0.25rem",
  "sm": "0.5rem",
  "md": "0.75rem",
  "lg": "1rem",
  "xl": "1.5rem",
  "2xl": "2rem",
  "3xl": "3rem",
  "4xl": "4rem"
}
```

**Spacious:**

```json
{
  "2xs": "0.375rem",
  "xs": "0.75rem",
  "sm": "1rem",
  "md": "1.5rem",
  "lg": "2.25rem",
  "xl": "3rem",
  "2xl": "4.5rem",
  "3xl": "6rem",
  "4xl": "9rem"
}
```

**Comfortable:** Keep defaults.

## Step 6: Summary

Tell the artist:

1. Run `npm run dev` to preview the updated theme
2. They can run `/theme` again any time to try a different preset or refine
3. For fine-grained control, edit the JSON files in `src/tokens/` directly
