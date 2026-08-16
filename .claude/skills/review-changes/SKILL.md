---
name: review
description: Review all staged changes for problems before committing. Checks for bugs, broken styles, accessibility issues, token misuse, config errors, and UX regressions. Fixes issues automatically when possible.
---

# Code Review

You are reviewing staged git changes before they are committed. Your goal is to catch problems and fix them before they land.

## Step 1: Gather the diff

Run `git diff --cached` to get all staged changes. If nothing is staged, report that there's nothing to review and exit.

Also run `git diff --cached --name-only` to get the list of changed files.

## Step 2: Categorize changed files

Sort the changed files into these buckets:

- **Components** — `src/components/**`, `src/pages/**`, `src/layouts/**`
- **Styles** — `*.module.css`, `src/styles/**`
- **Tokens** — `src/tokens/**`
- **Config** — `portfolio.config.json`, `vite.config.ts`, `tsconfig.json`, `vercel.json`, `netlify.toml`
- **Content** — `portfolio/**`, `blog/**`
- **Other** — everything else

## Step 3: Review each bucket

### Components & Pages

For any changed `.tsx` files, check:

- **Runtime errors** — missing imports, undefined variables, incorrect prop usage
- **React issues** — missing keys in lists, hooks called conditionally, stale closures
- **Accessibility** — images without alt text, non-semantic elements used for interaction, missing aria labels on interactive elements
- **Responsive** — hardcoded pixel widths that will break on mobile, missing media query considerations
- **Performance** — unnecessary re-renders, large inline objects/arrays in render, missing memoization on expensive computations

### Styles

For any changed `.css` or `.module.css` files, check:

- **Broken layouts** — conflicting flex/grid properties, missing fallbacks
- **Token usage** — hardcoded colors, font sizes, or spacing that should use `var(--token-*)` CSS custom properties from the design system
- **Responsive** — styles that will break at breakpoints, missing mobile considerations
- **Specificity issues** — overly broad selectors that might leak, `!important` usage

### Tokens

For any changed token JSON files in `src/tokens/`, check:

- **Valid JSON** — syntax errors
- **Token references** — `{color.xyz}` references that point to tokens that don't exist
- **Semantic consistency** — theme tokens should reference global tokens, not hardcode values
- **Contrast** — if text/surface color pairings are changed, flag if contrast ratio may be insufficient

### Config

For any changed config files, check:

- **Valid JSON/TOML** — syntax errors
- **Schema compliance** — `portfolio.config.json` fields match expected structure (site, domain, layout, blog, store, deployment)
- **Layout values** — homepage layout must be one of: grid, masonry, columnized, justify. Project layout must be one of: scroll, slideshow, splitview. Navigation must be one of: topbar, sidebar, overlay

### Content

For any changed `portfolio/**/project.json` files, check:

- **Valid JSON** — syntax errors
- **Field types** — tags should be an array, date should be YYYY-MM-DD format, draft should be boolean
- **Media references** — if `media` array references files, note they should exist in the project's assets folder

For any changed `blog/**/post.json` files, check:

- **Valid JSON** — syntax errors
- **Field types** — tags should be an array, date should be YYYY-MM-DD format, draft should be boolean
- **Required fields** — title and excerpt should be non-empty strings

For any changed `blog/**/content.md` files, check:

- **Broken links** — markdown links with empty URLs `[text]()`
- **Broken images** — image references to files that likely don't exist (relative paths should reference files in the same blog post folder)

## Step 4: Report findings

For each issue found, classify it:

- **Error** — Will break the build, cause runtime errors, or produce broken output. These MUST be fixed.
- **Warning** — Won't break anything but violates project conventions, hurts accessibility, or degrades UX. These SHOULD be fixed.
- **Info** — Stylistic suggestions or minor improvements. Optional.

Present findings as a concise list:

```
[ERROR] src/components/Gallery/Gallery.tsx:24 — Missing key prop on mapped elements
[WARNING] src/components/About/About.module.css:12 — Hardcoded color #333 should use var(--color-text-primary)
[INFO] portfolio/my-project/project.json — Consider adding alt text to media entries
```

## Step 5: Fix errors and warnings

For all **Error** and **Warning** items:

1. Read the full file to understand context around the issue.
2. Apply the fix using the Edit tool.
3. Stage the fixed files with `git add <file>`.
4. Report what was fixed.

For **Info** items, just list them as suggestions — do not auto-fix.

## Step 6: Final verdict

After fixes are applied, summarize:

- How many issues were found (by severity)
- How many were auto-fixed
- Any remaining Info-level suggestions

If there were any **Error** items that could NOT be auto-fixed, exit with code 1 to block the commit:

```bash
exit 1
```

Otherwise, confirm the changes are ready to commit.
