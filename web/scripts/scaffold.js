import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const WEB = path.resolve(__dirname, '..')
const BLUEPRINT = path.resolve(WEB, '..', 'blueprint')
const ROOT = path.resolve(WEB, '..')

const VARIANT_NAMES = {
  grid: 'Grid',
  masonry: 'Masonry',
  columnized: 'Columnized',
  justify: 'Justify',
  scroll: 'Scroll',
  slideshow: 'Slideshow',
  splitview: 'SplitView',
  freeform: 'Freeform',
}

const NAV_DEPS = {
  sidebar: ['Sidebar', 'Overlay'],
  overlay: ['Overlay'],
  topbar: [],
}

const PROJECT_TO_GALLERY = {
  slideshow: ['Slideshow'],
}

// ---------------------------------------------------------------------------
// Filesystem helpers
// ---------------------------------------------------------------------------

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest))
  fs.copyFileSync(src, dest)
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return
  ensureDir(dest)
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, content, 'utf-8')
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

// ---------------------------------------------------------------------------
// Config detection
// ---------------------------------------------------------------------------

function isDefaultConfig(config) {
  return config?.site?.name === 'Artist Name'
}

function loadConfig() {
  const configPath = path.join(WEB, 'portfolio.config.json')
  if (!fs.existsSync(configPath)) return null
  try {
    return readJSON(configPath)
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Collect layout variants needed across all projects
// ---------------------------------------------------------------------------

function collectProjectVariants(config) {
  const globalProject = config.layout?.project || 'scroll'
  const variants = new Set([globalProject])

  const portfolioDir = path.join(WEB, 'portfolio')
  if (fs.existsSync(portfolioDir)) {
    for (const entry of fs.readdirSync(portfolioDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const projectJsonPath = path.join(portfolioDir, entry.name, 'project.json')
      if (!fs.existsSync(projectJsonPath)) continue
      try {
        const proj = readJSON(projectJsonPath)
        if (proj.layout && VARIANT_NAMES[proj.layout]) {
          variants.add(proj.layout)
        }
      } catch {
        // skip malformed project.json
      }
    }
  }

  return [...variants]
}

function collectGalleryVariants(projectVariants) {
  const variants = new Set()
  for (const pv of projectVariants) {
    const deps = PROJECT_TO_GALLERY[pv]
    if (deps) deps.forEach((d) => variants.add(d))
  }
  return [...variants]
}

function collectNavVariants(config) {
  const nav = config.layout?.navigation || 'topbar'
  return NAV_DEPS[nav] || []
}

// ---------------------------------------------------------------------------
// Mode A — wizard only
// ---------------------------------------------------------------------------

function scaffoldWizard() {
  ensureDir(path.join(WEB, 'src'))
  ensureDir(path.join(WEB, 'public'))

  // 1. index.html
  copyFile(
    path.join(BLUEPRINT, 'app', 'index.html'),
    path.join(WEB, 'index.html'),
  )

  // 2. main.tsx, vite-env.d.ts
  copyFile(
    path.join(BLUEPRINT, 'app', 'main.tsx'),
    path.join(WEB, 'src', 'main.tsx'),
  )
  copyFile(
    path.join(BLUEPRINT, 'app', 'vite-env.d.ts'),
    path.join(WEB, 'src', 'vite-env.d.ts'),
  )

  // 3. styles
  copyDir(
    path.join(BLUEPRINT, 'app', 'styles'),
    path.join(WEB, 'src', 'styles'),
  )

  // 4. tokens (global + semantic)
  copyDir(
    path.join(BLUEPRINT, 'tokens', 'global'),
    path.join(WEB, 'src', 'tokens', 'global'),
  )
  copyDir(
    path.join(BLUEPRINT, 'tokens', 'semantic'),
    path.join(WEB, 'src', 'tokens', 'semantic'),
  )

  // 5. config/schema.ts
  copyFile(
    path.join(BLUEPRINT, 'app', 'config', 'schema.ts'),
    path.join(WEB, 'src', 'config', 'schema.ts'),
  )

  // 6. hooks/useConfig.tsx
  copyFile(
    path.join(BLUEPRINT, 'app', 'hooks', 'useConfig.tsx'),
    path.join(WEB, 'src', 'hooks', 'useConfig.tsx'),
  )

  // 7. SetupWizard
  copyDir(
    path.join(BLUEPRINT, 'app', 'components', 'SetupWizard'),
    path.join(WEB, 'src', 'components', 'SetupWizard'),
  )

  // 8. favicon
  copyFile(
    path.join(BLUEPRINT, 'defaults', 'favicon.svg'),
    path.join(WEB, 'public', 'favicon.svg'),
  )

  // 9. default config (only if not already present)
  const configDest = path.join(WEB, 'portfolio.config.json')
  if (!fs.existsSync(configDest)) {
    copyFile(
      path.join(BLUEPRINT, 'defaults', 'portfolio.config.json'),
      configDest,
    )
  }

  // 10. App.tsx — wizard only
  writeFile(
    path.join(WEB, 'src', 'App.tsx'),
    `import { BrowserRouter } from 'react-router'
import { ConfigProvider } from '@/hooks/useConfig'
import SetupWizard from '@/components/SetupWizard/SetupWizard'

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <SetupWizard />
      </ConfigProvider>
    </BrowserRouter>
  )
}
`,
  )

  return 'wizard'
}

// ---------------------------------------------------------------------------
// Mode B — full portfolio
// ---------------------------------------------------------------------------

function scaffoldFull(config) {
  // 1. Clean web/src/ entirely, preserve other top-level dirs
  rmDir(path.join(WEB, 'src'))
  ensureDir(path.join(WEB, 'src'))

  // 2. Copy all of blueprint/app/ into web/src/ (except index.html)
  const appDir = path.join(BLUEPRINT, 'app')
  for (const entry of fs.readdirSync(appDir, { withFileTypes: true })) {
    if (entry.name === 'index.html') continue
    const src = path.join(appDir, entry.name)
    const dest = path.join(WEB, 'src', entry.name)
    if (entry.isDirectory()) {
      copyDir(src, dest)
    } else {
      copyFile(src, dest)
    }
  }

  // 3. Tokens
  copyDir(
    path.join(BLUEPRINT, 'tokens'),
    path.join(WEB, 'src', 'tokens'),
  )

  // 4. Store feature
  const storeEnabled = config.store?.enabled === true
  if (storeEnabled) {
    const storeBase = path.join(BLUEPRINT, 'features', 'store')
    copyDir(path.join(storeBase, 'pages'), path.join(WEB, 'src', 'pages'))
    copyDir(path.join(storeBase, 'components'), path.join(WEB, 'src', 'components'))
    copyDir(path.join(storeBase, 'hooks'), path.join(WEB, 'src', 'hooks'))
    copyDir(path.join(storeBase, 'config'), path.join(WEB, 'src', 'config'))
  }

  // 5. Homepage layout variants
  const homepageVariant = config.layout?.homepage || 'grid'
  const homepageName = VARIANT_NAMES[homepageVariant] || 'Grid'
  const thumbnailVariantsDir = path.join(WEB, 'src', 'components', 'ThumbnailGrid', 'variants')
  ensureDir(thumbnailVariantsDir)
  copyFile(
    path.join(BLUEPRINT, 'layouts', 'homepage', `${homepageName}.tsx`),
    path.join(thumbnailVariantsDir, `${homepageName}.tsx`),
  )
  copyFile(
    path.join(BLUEPRINT, 'layouts', 'homepage', 'ThumbnailGrid.module.css'),
    path.join(WEB, 'src', 'components', 'ThumbnailGrid', 'ThumbnailGrid.module.css'),
  )

  // 6. Project layout variants (includes per-project overrides)
  const projectVariants = collectProjectVariants(config)
  const projectDetailDir = path.join(WEB, 'src', 'components', 'ProjectDetail')
  const projectVariantsDir = path.join(projectDetailDir, 'variants')
  ensureDir(projectVariantsDir)
  for (const variant of projectVariants) {
    const name = VARIANT_NAMES[variant]
    if (!name) continue
    const src = path.join(BLUEPRINT, 'layouts', 'project', `${name}.tsx`)
    if (fs.existsSync(src)) {
      copyFile(src, path.join(projectVariantsDir, `${name}.tsx`))
    }
  }
  copyFile(
    path.join(BLUEPRINT, 'layouts', 'project', 'ProjectDetail.module.css'),
    path.join(projectDetailDir, 'ProjectDetail.module.css'),
  )
  copyFile(
    path.join(BLUEPRINT, 'layouts', 'project', 'ProjectHeader.module.css'),
    path.join(projectDetailDir, 'ProjectHeader.module.css'),
  )

  // 7. Navigation variants
  const navVariantNames = collectNavVariants(config)
  const navigationDir = path.join(WEB, 'src', 'components', 'Navigation')
  const navVariantsDir = path.join(navigationDir, 'variants')
  ensureDir(navVariantsDir)
  for (const name of navVariantNames) {
    const tsxSrc = path.join(BLUEPRINT, 'layouts', 'navigation', `${name}.tsx`)
    const cssSrc = path.join(BLUEPRINT, 'layouts', 'navigation', `${name}.module.css`)
    if (fs.existsSync(tsxSrc)) {
      copyFile(tsxSrc, path.join(navVariantsDir, `${name}.tsx`))
    }
    if (fs.existsSync(cssSrc)) {
      copyFile(cssSrc, path.join(navVariantsDir, `${name}.module.css`))
    }
  }
  copyFile(
    path.join(BLUEPRINT, 'layouts', 'navigation', 'Navigation.module.css'),
    path.join(navigationDir, 'Navigation.module.css'),
  )

  // 8. Gallery variants
  const galleryVariantNames = collectGalleryVariants(projectVariants)
  const galleryDir = path.join(WEB, 'src', 'components', 'Gallery')
  if (galleryVariantNames.length > 0) {
    const galleryVariantsDir = path.join(galleryDir, 'variants')
    ensureDir(galleryVariantsDir)
    for (const name of galleryVariantNames) {
      const src = path.join(BLUEPRINT, 'layouts', 'gallery', `${name}.tsx`)
      if (fs.existsSync(src)) {
        copyFile(src, path.join(galleryVariantsDir, `${name}.tsx`))
      }
    }
    copyFile(
      path.join(BLUEPRINT, 'layouts', 'gallery', 'Gallery.module.css'),
      path.join(galleryDir, 'Gallery.module.css'),
    )
  }

  // 9. Default portfolio content
  const portfolioDir = path.join(WEB, 'portfolio')
  if (!fs.existsSync(portfolioDir)) {
    copyDir(
      path.join(BLUEPRINT, 'defaults', 'portfolio'),
      portfolioDir,
    )
  }

  // 10. Generate App.tsx
  writeFile(
    path.join(WEB, 'src', 'App.tsx'),
    generateAppTsx(config, storeEnabled),
  )

  // 11. Generate ThumbnailGrid.tsx
  writeFile(
    path.join(WEB, 'src', 'components', 'ThumbnailGrid', 'ThumbnailGrid.tsx'),
    generateThumbnailGrid(homepageVariant),
  )

  // 12. Generate ProjectDetail.tsx
  writeFile(
    path.join(WEB, 'src', 'components', 'ProjectDetail', 'ProjectDetail.tsx'),
    generateProjectDetail(projectVariants, config.layout?.project || 'scroll'),
  )

  // 13. Generate Navigation.tsx
  writeFile(
    path.join(WEB, 'src', 'components', 'Navigation', 'Navigation.tsx'),
    generateNavigation(config.layout?.navigation || 'topbar'),
  )

  // 14. Generate Gallery.tsx
  writeFile(
    path.join(galleryDir, 'Gallery.tsx'),
    generateGallery(galleryVariantNames),
  )

  // 15. Generate CartButton stub if store disabled
  if (!storeEnabled) {
    writeFile(
      path.join(WEB, 'src', 'components', 'Cart', 'CartButton.tsx'),
      `export default function CartButton() {
  return null
}
`,
    )
  }

  // 16. Generate checkout-handler.ts
  writeFile(
    path.join(WEB, 'src', 'checkout-handler.ts'),
    generateCheckoutHandler(config),
  )

  // 17. Deployment config
  copyDeploymentConfig(config)

  // 18. Checkout server files for Stripe
  if (storeEnabled && config.store?.provider === 'stripe') {
    copyCheckoutServerFiles(config)
  }

  return 'full'
}

// ---------------------------------------------------------------------------
// Code generators
// ---------------------------------------------------------------------------

function generateAppTsx(config, storeEnabled) {
  const imports = [
    `import { BrowserRouter, Routes, Route } from 'react-router'`,
    `import { ConfigProvider, useConfig } from '@/hooks/useConfig'`,
    `import PageLayout from '@/layouts/PageLayout'`,
    `import HomePage from '@/pages/HomePage'`,
    `import ProjectPage from '@/pages/ProjectPage'`,
    `import AboutPage from '@/pages/AboutPage'`,
    `import NotFoundPage from '@/pages/NotFoundPage'`,
    `import SetupWizard from '@/components/SetupWizard/SetupWizard'`,
  ]

  if (storeEnabled) {
    imports.push(`import ShopPage from '@/pages/ShopPage'`)
    imports.push(`import ProductPage from '@/pages/ProductPage'`)
  }

  const storeRoutes = storeEnabled
    ? `\n            <Route path="/shop" element={<ShopPage />} />\n            <Route path="/shop/:slug" element={<ProductPage />} />`
    : ''

  return `${imports.join('\n')}

function AppRoutes() {
  const { isDefaultConfig } = useConfig()

  if (isDefaultConfig) {
    return <SetupWizard />
  }

  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/project/:slug" element={<ProjectPage />} />${storeRoutes}
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <AppRoutes />
      </ConfigProvider>
    </BrowserRouter>
  )
}
`
}

function generateThumbnailGrid(homepageVariant) {
  const name = VARIANT_NAMES[homepageVariant] || 'Grid'

  return `import ${name} from './variants/${name}'

export default function ThumbnailGrid(props) {
  return <${name} {...props} />
}
`
}

function generateProjectDetail(projectVariants, defaultVariant) {
  const defaultName = VARIANT_NAMES[defaultVariant] || 'Scroll'

  if (projectVariants.length === 1) {
    return `import ${defaultName} from './variants/${defaultName}'

export default function ProjectDetail(props) {
  return <${defaultName} {...props} />
}
`
  }

  const imports = projectVariants
    .map((v) => {
      const name = VARIANT_NAMES[v]
      return `import ${name} from './variants/${name}'`
    })
    .join('\n')

  const cases = projectVariants
    .map((v) => {
      const name = VARIANT_NAMES[v]
      return `    case '${v}':\n      return <${name} {...props} />`
    })
    .join('\n')

  return `${imports}

const VARIANTS = {
${projectVariants.map((v) => `  '${v}': ${VARIANT_NAMES[v]},`).join('\n')}
}

export default function ProjectDetail(props) {
  const layout = props.layout || '${defaultVariant}'

  switch (layout) {
${cases}
    default:
      return <${defaultName} {...props} />
  }
}
`
}

function generateNavigation(navType) {
  if (navType === 'topbar') {
    return `import { NavLink } from 'react-router'
import { useConfig } from '@/hooks/useConfig'
import CartButton from '@/components/Cart/CartButton'
import styles from './Navigation.module.css'

export default function Navigation() {
  const { config } = useConfig()
  const storeEnabled = config.store?.enabled

  return (
    <nav className={styles.topbar}>
      <NavLink to="/" className={styles.logo}>
        {config.site.name}
      </NavLink>
      <div className={styles.links}>
        <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>
          Work
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? styles.active : ''}>
          About
        </NavLink>
        {storeEnabled && (
          <NavLink to="/shop" className={({ isActive }) => isActive ? styles.active : ''}>
            Shop
          </NavLink>
        )}
        {storeEnabled && <CartButton />}
      </div>
    </nav>
  )
}
`
  }

  if (navType === 'sidebar') {
    return `import Sidebar from './variants/Sidebar'

export default function Navigation(props) {
  return <Sidebar {...props} />
}
`
  }

  if (navType === 'overlay') {
    return `import Overlay from './variants/Overlay'

export default function Navigation(props) {
  return <Overlay {...props} />
}
`
  }

  // fallback
  return `export default function Navigation() {
  return null
}
`
}

function generateGallery(galleryVariantNames) {
  if (galleryVariantNames.length === 0) {
    return `export default function Gallery(props) {
  return null
}
`
  }

  if (galleryVariantNames.length === 1) {
    const name = galleryVariantNames[0]
    return `import ${name} from './variants/${name}'

export default function Gallery(props) {
  return <${name} {...props} />
}
`
  }

  const imports = galleryVariantNames
    .map((name) => `import ${name} from './variants/${name}'`)
    .join('\n')

  const cases = galleryVariantNames
    .map((name) => {
      const key = name.toLowerCase()
      return `    case '${key}':\n      return <${name} {...props} />`
    })
    .join('\n')

  const defaultName = galleryVariantNames[0]

  return `${imports}

export default function Gallery(props) {
  const variant = props.variant || '${defaultName.toLowerCase()}'

  switch (variant) {
${cases}
    default:
      return <${defaultName} {...props} />
  }
}
`
}

function generateCheckoutHandler(config) {
  const provider = config.store?.provider
  const storeEnabled = config.store?.enabled === true

  if (!storeEnabled || !provider || provider === 'none') {
    return `export function useCheckout() {
  return {
    handleCheckout(_items, _config) {},
  }
}
`
  }

  if (provider === 'stripe') {
    return `export { useStripeCheckout as useCheckout } from '@blueprint/checkout/stripe/useStripeCheckout'
`
  }

  if (provider === 'shopify') {
    return `export { useShopifyCheckout as useCheckout } from '@blueprint/checkout/shopify/useShopifyCheckout'
`
  }

  return `export function useCheckout() {
  return {
    handleCheckout(_items, _config) {},
  }
}
`
}

// ---------------------------------------------------------------------------
// Deployment config
// ---------------------------------------------------------------------------

function copyDeploymentConfig(config) {
  const target = config.deployment || 'vercel'

  if (target === 'vercel') {
    const src = path.join(BLUEPRINT, 'deployment', 'vercel', 'vercel.json')
    if (fs.existsSync(src)) {
      copyFile(src, path.join(ROOT, 'vercel.json'))
    }
    const apiSrc = path.join(BLUEPRINT, 'deployment', 'vercel', 'api')
    if (fs.existsSync(apiSrc)) {
      copyDir(apiSrc, path.join(ROOT, 'api'))
    }
  } else if (target === 'netlify') {
    const src = path.join(BLUEPRINT, 'deployment', 'netlify', 'netlify.toml')
    if (fs.existsSync(src)) {
      copyFile(src, path.join(ROOT, 'netlify.toml'))
    }
    const fnSrc = path.join(BLUEPRINT, 'deployment', 'netlify', 'functions')
    if (fs.existsSync(fnSrc)) {
      copyDir(fnSrc, path.join(ROOT, 'netlify', 'functions'))
    }
  } else if (target === 'github-pages') {
    const workflowsSrc = path.join(BLUEPRINT, 'deployment', 'github-pages', 'workflows')
    if (fs.existsSync(workflowsSrc)) {
      copyDir(workflowsSrc, path.join(ROOT, '.github', 'workflows'))
    }
  }
}

function copyCheckoutServerFiles(config) {
  const target = config.deployment || 'vercel'

  if (target === 'vercel') {
    const src = path.join(BLUEPRINT, 'deployment', 'vercel', 'api', 'checkout.js')
    if (fs.existsSync(src)) {
      copyFile(src, path.join(ROOT, 'api', 'checkout.js'))
    }
  } else if (target === 'netlify') {
    const src = path.join(BLUEPRINT, 'deployment', 'netlify', 'functions', 'checkout.js')
    if (fs.existsSync(src)) {
      copyFile(src, path.join(ROOT, 'netlify', 'functions', 'checkout.js'))
    }
  }
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export function scaffold() {
  const config = loadConfig()

  if (!config || isDefaultConfig(config)) {
    const mode = scaffoldWizard()
    return { mode, message: 'Scaffolded wizard-only site. Run the dev server and complete setup.' }
  }

  const mode = scaffoldFull(config)
  return {
    mode,
    message: `Scaffolded full portfolio for "${config.site.name}" (homepage: ${config.layout?.homepage}, project: ${config.layout?.project}, nav: ${config.layout?.navigation}).`,
  }
}

// CLI entry point
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)
if (isMain) {
  const ifNeeded = process.argv.includes('--if-needed')
  if (ifNeeded && fs.existsSync(path.join(WEB, 'src', 'App.tsx'))) {
    // Already scaffolded — skip
  } else {
    const result = scaffold()
    console.log(result.message)
  }
}
