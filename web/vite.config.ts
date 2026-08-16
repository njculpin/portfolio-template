import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import type { IncomingMessage } from 'http'

// The artist's content lives in content/ at the repo root, outside this package.
const REPO_ROOT = path.resolve(__dirname, '..')
const CONTENT_ROOT = path.join(REPO_ROOT, 'content')

type WizardConfig = {
  site?: { name?: string }
  [key: string]: unknown
}

type ThemePreset = {
  colors?: {
    black: string
    white: string
    accent: string
    gray?: Record<string, string>
  }
  typography?: { heading: string; body: string }
  darkMode?: boolean
  googleFonts?: string
}

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    {
      name: 'setup-wizard-api',
      configureServer(server) {
        // One shot: save the config, apply the theme preset, then scaffold the
        // real site. The scaffold deletes the wizard from web/src, so the client
        // only has to reload to land on the finished portfolio.
        server.middlewares.use('/__api/complete-setup', (req, res, next) => {
          if (req.method !== 'POST') return next()

          readRequestBody(req)
            .then(async (body) => {
              const { config, preset } = JSON.parse(body) as {
                config: WizardConfig
                preset?: string
              }

              saveConfig(config)

              // Scaffold first: it wipes web/src and re-copies the token sources,
              // so the preset has to be applied on top of the fresh tree. Tokens
              // are always rebuilt afterwards — src/styles/tokens.css is generated
              // and would otherwise be missing from the new site.
              const { scaffold } = await import('./scripts/scaffold.js')
              const result = scaffold()

              if (preset) applyPreset(preset)
              await rebuildTokens()

              logNextSteps(result.message)

              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true, mode: result.mode }))
            })
            .catch((err) => {
              console.error('[setup] Failed to complete setup:', err)
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: String(err) }))
            })
        })
      },
    },
    {
      name: 'serve-portfolio',
      configureServer(server) {
        server.middlewares.use('/portfolio', (req, res, next) => {
          const filePath = path.resolve(CONTENT_ROOT, 'portfolio', req.url!.slice(1))
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Access-Control-Allow-Origin', '*')
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })
      },
    },
    {
      name: 'serve-store',
      configureServer(server) {
        server.middlewares.use('/store', (req, res, next) => {
          const filePath = path.resolve(CONTENT_ROOT, 'store', req.url!.slice(1))
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Access-Control-Allow-Origin', '*')
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })
      },
    },
    {
      name: 'serve-blog',
      configureServer(server) {
        server.middlewares.use('/blog', (req, res, next) => {
          const filePath = path.resolve(CONTENT_ROOT, 'blog', req.url!.slice(1))
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Access-Control-Allow-Origin', '*')
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })
      },
    },
    {
      name: 'optimize-portfolio-assets',
      async closeBundle() {
        const src = path.resolve(CONTENT_ROOT, 'portfolio')
        const dest = path.resolve(__dirname, 'dist/portfolio')
        await optimizeAndCopy(src, dest)

        const storeSrc = path.resolve(CONTENT_ROOT, 'store')
        const storeDest = path.resolve(__dirname, 'dist/store')
        await optimizeAndCopy(storeSrc, storeDest)

        const blogSrc = path.resolve(CONTENT_ROOT, 'blog')
        const blogDest = path.resolve(__dirname, 'dist/blog')
        await optimizeAndCopy(blogSrc, blogDest)

        generateRssFeed()
      },
    },
  ],
  server: {
    fs: {
      // Content lives one level up, outside this package
      allow: [REPO_ROOT],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@blueprint': path.resolve(__dirname, '../blueprint'),
    },
  },
})

// ---------------------------------------------------------------------------
// Setup wizard helpers
// ---------------------------------------------------------------------------

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function saveConfig(config: WizardConfig) {
  const configPath = path.resolve(__dirname, 'portfolio.config.json')
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')

  const indexPath = path.resolve(__dirname, 'index.html')
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf-8')
    fs.writeFileSync(
      indexPath,
      html.replace(/<title>.*?<\/title>/, `<title>${config.site?.name || 'Portfolio'}</title>`),
    )
  }
}

function applyPreset(preset: string) {
  const presetPath = path.resolve(__dirname, `../blueprint/tokens/presets/${preset}.json`)
  if (!fs.existsSync(presetPath)) {
    console.warn(`[setup] Unknown theme preset "${preset}" — keeping the current tokens.`)
    return false
  }

  const presetData: ThemePreset = JSON.parse(fs.readFileSync(presetPath, 'utf-8'))

  const colorsPath = path.resolve(__dirname, 'src/tokens/global/colors.json')
  const colors = JSON.parse(fs.readFileSync(colorsPath, 'utf-8'))
  if (presetData.colors) {
    colors.color.black.$value = presetData.colors.black
    colors.color.white.$value = presetData.colors.white
    colors.color.accent.$value = presetData.colors.accent
    for (const [key, val] of Object.entries(presetData.colors.gray || {})) {
      if (colors.color.gray[key]) colors.color.gray[key].$value = val
    }
  }
  fs.writeFileSync(colorsPath, JSON.stringify(colors, null, 2) + '\n')

  const typePath = path.resolve(__dirname, 'src/tokens/global/typography.json')
  const typography = JSON.parse(fs.readFileSync(typePath, 'utf-8'))
  if (presetData.typography) {
    typography.font.family.heading.$value = presetData.typography.heading
    typography.font.family.body.$value = presetData.typography.body
  }
  fs.writeFileSync(typePath, JSON.stringify(typography, null, 2) + '\n')

  writeThemeTokens(presetData.darkMode === true)

  if (presetData.googleFonts) {
    const indexPath = path.resolve(__dirname, 'index.html')
    let html = fs.readFileSync(indexPath, 'utf-8')
    html = html.replace(/\s*<link[^>]*fonts\.googleapis\.com[^>]*>/g, '')
    html = html.replace(/\s*<link[^>]*fonts\.gstatic\.com[^>]*>/g, '')
    const fontLinks = `\n    <link rel="preconnect" href="https://fonts.googleapis.com" />\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${presetData.googleFonts}&display=swap" />`
    html = html.replace('</head>', `${fontLinks}\n  </head>`)
    fs.writeFileSync(indexPath, html)
  }

  return true
}

function writeThemeTokens(darkMode: boolean) {
  const theme = darkMode
    ? {
        surface: {
          primary: { $value: '{color.gray.900}' },
          secondary: { $value: '{color.gray.800}' },
          inverse: { $value: '{color.white}' },
        },
        text: {
          primary: { $value: '{color.white}' },
          secondary: { $value: '{color.gray.400}' },
          inverse: { $value: '{color.gray.900}' },
          accent: { $value: '{color.accent}' },
        },
        border: {
          default: { $value: '{color.gray.700}' },
          strong: { $value: '{color.gray.500}' },
        },
        accent: { primary: { $value: '{color.accent}' } },
      }
    : {
        surface: {
          primary: { $value: '{color.white}' },
          secondary: { $value: '{color.gray.100}' },
          inverse: { $value: '{color.gray.900}' },
        },
        text: {
          primary: { $value: '{color.gray.900}' },
          secondary: { $value: '{color.gray.500}' },
          inverse: { $value: '{color.white}' },
          accent: { $value: '{color.accent}' },
        },
        border: {
          default: { $value: '{color.gray.200}' },
          strong: { $value: '{color.gray.400}' },
        },
        accent: { primary: { $value: '{color.accent}' } },
      }

  const themePath = path.resolve(__dirname, 'src/tokens/semantic/theme.json')
  fs.writeFileSync(themePath, JSON.stringify(theme, null, 2) + '\n')
}

function rebuildTokens(): Promise<void> {
  return new Promise((resolve) => {
    exec('node style-dictionary.config.js', { cwd: __dirname }, (err) => {
      if (err) console.error('[setup] Token rebuild error:', err)
      resolve()
    })
  })
}

function logNextSteps(message: string) {
  console.log(`\n[setup] ${message}`)
  console.log('[setup] The wizard has been removed — your site is now live at /.')
  console.log('[setup] Next, ask Claude Code for any of these:')
  console.log('[setup]   /add-project    Add a project with title, description, tags, and media')
  console.log('[setup]   /theme          Customize colors, fonts, spacing, and visual style')
  console.log('[setup]   /add-blog-post  Write and publish a post')
  console.log('[setup]   /setup-shop     Sell prints, originals, or digital downloads')
  console.log('[setup]   /deploy         Put the site live on your hosting provider\n')
}

const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']

async function optimizeAndCopy(src: string, dest: string) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })

  const sharp = (await import('sharp')).default

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await optimizeAndCopy(srcPath, destPath)
    } else if (entry.name.endsWith('.json')) {
      continue
    } else {
      const ext = path.extname(entry.name).toLowerCase()

      if (imageExts.includes(ext) && ext !== '.gif') {
        try {
          await sharp(srcPath)
            .resize(2400, undefined, { withoutEnlargement: true })
            .jpeg({ quality: 82, mozjpeg: true })
            .toFile(destPath.replace(/\.[^.]+$/, '.jpg'))

          await sharp(srcPath)
            .resize(2400, undefined, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(destPath.replace(/\.[^.]+$/, '.webp'))
        } catch {
          fs.copyFileSync(srcPath, destPath)
        }
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }
}

function generateRssFeed() {
  const configPath = path.resolve(__dirname, 'portfolio.config.json')
  if (!fs.existsSync(configPath)) return

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  if (!config.blog?.enabled) return

  const blogDir = path.resolve(CONTENT_ROOT, 'blog')
  if (!fs.existsSync(blogDir)) return

  const posts: { title: string; excerpt: string; date: string; slug: string }[] = []

  for (const entry of fs.readdirSync(blogDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const postJsonPath = path.join(blogDir, entry.name, 'post.json')
    if (!fs.existsSync(postJsonPath)) continue

    try {
      const post = JSON.parse(fs.readFileSync(postJsonPath, 'utf-8'))
      if (post.draft) continue
      posts.push({
        title: post.title || entry.name,
        excerpt: post.excerpt || '',
        date: post.date || '',
        slug: entry.name,
      })
    } catch {
      // skip malformed post.json
    }
  }

  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  const siteName = config.site?.name || 'Portfolio'
  const basePath = process.env.BASE_PATH || '/'
  const siteUrl = process.env.SITE_URL || `https://example.com${basePath}`

  const escXml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const items = posts
    .map(
      (p) => `    <item>
      <title>${escXml(p.title)}</title>
      <link>${siteUrl}blog/${p.slug}</link>
      <guid>${siteUrl}blog/${p.slug}</guid>
      <description>${escXml(p.excerpt)}</description>${p.date ? `\n      <pubDate>${new Date(p.date + 'T00:00:00').toUTCString()}</pubDate>` : ''}
    </item>`,
    )
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escXml(siteName)} — Blog</title>
    <link>${siteUrl}blog</link>
    <description>${escXml(siteName)} blog feed</description>
    <atom:link href="${siteUrl}feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`

  const distDir = path.resolve(__dirname, 'dist')
  fs.mkdirSync(distDir, { recursive: true })
  fs.writeFileSync(path.join(distDir, 'feed.xml'), rss)
}
