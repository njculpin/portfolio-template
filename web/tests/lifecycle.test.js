import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'

import {
  createSandbox,
  destroySandbox,
  loadScaffold,
  runReset,
  writeConfig,
  readConfig,
  webPath,
  rootPath,
  contentPath,
  exists,
  read,
  addProject,
} from './helpers/sandbox.js'

/**
 * The lifecycle these tests walk:
 *
 *   fresh clone -> wizard-only site -> submit -> full site -> reset -> wizard
 *
 * Every stage runs in a disposable sandbox, so the artist's real content is
 * never touched.
 */

describe('stage 1: fresh install scaffolds the wizard', () => {
  let sandbox
  let scaffold

  before(async () => {
    sandbox = createSandbox('wizard')
    ;({ scaffold } = await loadScaffold(sandbox))
  })
  after(() => destroySandbox(sandbox))

  it('reports wizard mode when there is no config yet', () => {
    const result = scaffold()
    assert.equal(result.mode, 'wizard')
  })

  it('renders the wizard and nothing else', () => {
    const app = read(webPath(sandbox, 'src', 'App.tsx'))
    assert.match(app, /import SetupWizard/)
    assert.match(app, /<SetupWizard \/>/)
    assert.ok(!exists(webPath(sandbox, 'src', 'pages')), 'no site pages in wizard mode')
  })

  it('installs the default config and the wizard steps', () => {
    assert.equal(readConfig(sandbox).site.name, 'Artist Name')
    assert.ok(exists(webPath(sandbox, 'src', 'components', 'SetupWizard', 'SetupWizard.tsx')))
    assert.ok(
      exists(webPath(sandbox, 'src', 'components', 'SetupWizard', 'steps', 'CreativeDomain.tsx')),
    )
  })

  it('ships token sources for the style build', () => {
    assert.ok(exists(webPath(sandbox, 'src', 'tokens', 'global', 'colors.json')))
    assert.ok(exists(webPath(sandbox, 'src', 'tokens', 'semantic', 'theme.json')))
  })
})

describe('stage 2: submitting the wizard builds the real site', () => {
  let sandbox
  let scaffold

  before(async () => {
    sandbox = createSandbox('full')
    ;({ scaffold } = await loadScaffold(sandbox))
    scaffold() // wizard first, as a real install would
    writeConfig(sandbox, { domains: ['illustration', 'brand', 'ux'] })
  })
  after(() => destroySandbox(sandbox))

  it('switches to full mode once the config is no longer the default', () => {
    const result = scaffold()
    assert.equal(result.mode, 'full')
  })

  it('removes the wizard from the built site', () => {
    assert.ok(
      !exists(webPath(sandbox, 'src', 'components', 'SetupWizard')),
      'the wizard must not survive into the real site',
    )
    const app = read(webPath(sandbox, 'src', 'App.tsx'))
    assert.ok(!app.includes('SetupWizard'), 'App.tsx must not reference the wizard')
    assert.ok(!app.includes('isDefaultConfig'), 'no wizard fallback branch')
  })

  it('routes the real pages', () => {
    const app = read(webPath(sandbox, 'src', 'App.tsx'))
    assert.match(app, /<Route index element={<HomePage \/>} \/>/)
    assert.match(app, /path="\/project\/:slug"/)
    assert.match(app, /path="\/about"/)
    assert.ok(exists(webPath(sandbox, 'src', 'pages', 'HomePage.tsx')))
  })

  it('keeps the multi-select domains in the saved config', () => {
    assert.deepEqual(readConfig(sandbox).domains, ['illustration', 'brand', 'ux'])
  })
})

describe('optional features are scaffolded on demand', () => {
  let sandbox
  let scaffold

  before(async () => {
    sandbox = createSandbox('features')
    ;({ scaffold } = await loadScaffold(sandbox))
  })
  after(() => destroySandbox(sandbox))

  it('leaves blog and store out when both are off', () => {
    writeConfig(sandbox)
    scaffold()

    const app = read(webPath(sandbox, 'src', 'App.tsx'))
    assert.ok(!app.includes('BlogPage'), 'no blog routes')
    assert.ok(!app.includes('ShopPage'), 'no store routes')
    assert.ok(!exists(webPath(sandbox, 'src', 'pages', 'ShopPage.tsx')))
    assert.ok(!exists(contentPath(sandbox, 'store')), 'no store content dir')
  })

  it('adds the blog when enabled', () => {
    writeConfig(sandbox, { blog: { enabled: true } })
    scaffold()

    const app = read(webPath(sandbox, 'src', 'App.tsx'))
    assert.match(app, /path="\/blog"/)
    assert.match(app, /path="\/blog\/:slug"/)
    assert.ok(exists(webPath(sandbox, 'src', 'pages', 'BlogPage.tsx')))
    assert.ok(exists(contentPath(sandbox, 'blog')), 'starter posts land in the content package')
  })

  it('adds the store and its checkout function when enabled', () => {
    writeConfig(sandbox, {
      store: { enabled: true, provider: 'stripe', currency: 'usd', layout: 'grid', shipFrom: '' },
    })
    scaffold()

    const app = read(webPath(sandbox, 'src', 'App.tsx'))
    assert.match(app, /path="\/shop"/)
    assert.match(app, /path="\/shop\/:slug"/)
    assert.ok(exists(webPath(sandbox, 'src', 'pages', 'ShopPage.tsx')))
    assert.ok(exists(rootPath(sandbox, 'api', 'checkout.js')), 'stripe checkout endpoint')
  })
})

describe('layout choices pull in the matching variants', () => {
  let sandbox
  let scaffold

  before(async () => {
    sandbox = createSandbox('layouts')
    ;({ scaffold } = await loadScaffold(sandbox))
    writeConfig(sandbox, {
      layout: { homepage: 'masonry', project: 'splitview', navigation: 'sidebar' },
    })
    scaffold()
  })
  after(() => destroySandbox(sandbox))

  it('copies the chosen homepage variant only', () => {
    const variants = webPath(sandbox, 'src', 'components', 'ThumbnailGrid', 'variants')
    assert.ok(exists(variants, 'Masonry.tsx'))
    assert.ok(!exists(variants, 'Grid.tsx'), 'unused variants are not shipped')
  })

  it('copies the chosen project variant', () => {
    assert.ok(
      exists(webPath(sandbox, 'src', 'components', 'ProjectDetail', 'variants', 'SplitView.tsx')),
    )
  })

  it('pulls in navigation dependencies', () => {
    const navDir = webPath(sandbox, 'src', 'components', 'Navigation')
    assert.ok(exists(navDir, 'variants', 'Sidebar.tsx'))
    assert.ok(exists(navDir, 'variants', 'Overlay.tsx'), 'sidebar depends on the overlay menu')
  })
})

describe('the generated site is wired up to actually render', () => {
  let sandbox
  let scaffold

  before(async () => {
    sandbox = createSandbox('wiring')
    ;({ scaffold } = await loadScaffold(sandbox))
    // A second project layout turns ProjectDetail into a switch.
    const override = contentPath(sandbox, 'portfolio', 'override')
    fs.mkdirSync(override, { recursive: true })
    fs.writeFileSync(
      path.join(override, 'project.json'),
      JSON.stringify({ title: 'Override', layout: 'slideshow' }),
    )
    writeConfig(sandbox)
    scaffold()
  })
  after(() => destroySandbox(sandbox))

  it('renders child routes through the layout outlet', () => {
    // PageLayout is a layout route, so page content arrives via Outlet, not
    // children — taking children leaves every page blank.
    const layout = read(webPath(sandbox, 'src', 'layouts', 'PageLayout.tsx'))
    assert.match(layout, /<Outlet \/>/)
    assert.ok(!layout.includes('{children}'), 'children never arrive on a layout route')
  })

  it('reads the config the way useConfig returns it', () => {
    // useConfig() returns the config itself; destructuring { config } yields
    // undefined and the nav throws on first render.
    const nav = read(webPath(sandbox, 'src', 'components', 'Navigation', 'Navigation.tsx'))
    assert.match(nav, /const config = useConfig\(\)/)
    assert.ok(!nav.includes('const { config }'), 'useConfig does not return a wrapper')
  })

  it('honours a per-project layout override', () => {
    // The override lives on the project, not on a prop nobody passes.
    const detail = read(webPath(sandbox, 'src', 'components', 'ProjectDetail', 'ProjectDetail.tsx'))
    assert.match(detail, /props\.project\.layout/)
    assert.match(detail, /case 'slideshow':/)
  })
})

describe('deployment files are generated output, not leftovers', () => {
  let sandbox
  let scaffold

  before(async () => {
    sandbox = createSandbox('deploy')
    ;({ scaffold } = await loadScaffold(sandbox))
  })
  after(() => destroySandbox(sandbox))

  it('writes Vercel files at the repo root', () => {
    writeConfig(sandbox, { deployment: 'vercel' })
    scaffold()
    assert.ok(exists(rootPath(sandbox, 'vercel.json')))
    assert.ok(exists(rootPath(sandbox, 'api')))
  })

  it('clears the previous host when switching to Netlify', () => {
    writeConfig(sandbox, { deployment: 'netlify' })
    scaffold()
    assert.ok(exists(rootPath(sandbox, 'netlify.toml')))
    assert.ok(!exists(rootPath(sandbox, 'vercel.json')), 'stale vercel.json removed')
    assert.ok(!exists(rootPath(sandbox, 'api')), 'stale api/ removed')
  })

  it('clears the previous host when switching to GitHub Pages', () => {
    writeConfig(sandbox, { deployment: 'github-pages' })
    scaffold()
    assert.ok(exists(rootPath(sandbox, '.github', 'workflows', 'deploy-gh-pages.yml')))
    assert.ok(!exists(rootPath(sandbox, 'netlify.toml')), 'stale netlify.toml removed')
    assert.ok(!exists(rootPath(sandbox, 'netlify')), 'stale netlify functions removed')
  })
})

describe('content lives in content/, outside the web package', () => {
  let sandbox
  let scaffold

  before(async () => {
    sandbox = createSandbox('content')
    ;({ scaffold } = await loadScaffold(sandbox))
  })
  after(() => destroySandbox(sandbox))

  it('creates starter content in content/', () => {
    writeConfig(sandbox)
    scaffold()
    assert.ok(exists(contentPath(sandbox, 'portfolio')), 'content/portfolio holds the projects')
    assert.ok(!exists(webPath(sandbox, 'portfolio')), 'never inside the web package')
    assert.ok(!exists(rootPath(sandbox, 'portfolio')), 'never loose at the repo root')
  })

  it('leaves the artist projects alone on a re-scaffold', () => {
    addProject(sandbox, 'my-project', { title: 'My Project' })
    scaffold()
    const project = JSON.parse(
      read(contentPath(sandbox, 'portfolio', 'my-project', 'project.json')),
    )
    assert.equal(project.title, 'My Project')
  })

  it('migrates content left inside web/ by an older version', () => {
    const legacy = webPath(sandbox, 'portfolio')
    fs.mkdirSync(path.join(legacy, 'legacy-project'), { recursive: true })
    fs.writeFileSync(path.join(legacy, 'legacy-project', 'project.json'), '{"title":"Legacy"}')
    fs.rmSync(contentPath(sandbox, 'portfolio'), { recursive: true, force: true })

    scaffold()

    assert.ok(!exists(webPath(sandbox, 'portfolio')), 'web/portfolio is moved, not copied')
    const migrated = JSON.parse(
      read(contentPath(sandbox, 'portfolio', 'legacy-project', 'project.json')),
    )
    assert.equal(migrated.title, 'Legacy')
  })

  it('migrates content left loose at the repo root by an older version', () => {
    const legacy = rootPath(sandbox, 'portfolio')
    fs.mkdirSync(path.join(legacy, 'root-project'), { recursive: true })
    fs.writeFileSync(path.join(legacy, 'root-project', 'project.json'), '{"title":"Root"}')
    fs.rmSync(contentPath(sandbox, 'portfolio'), { recursive: true, force: true })

    scaffold()

    assert.ok(!exists(rootPath(sandbox, 'portfolio')), 'the loose dir is moved, not copied')
    const migrated = JSON.parse(
      read(contentPath(sandbox, 'portfolio', 'root-project', 'project.json')),
    )
    assert.equal(migrated.title, 'Root')
  })
})

describe('a new site starts with placeholder content', () => {
  let sandbox
  let scaffold

  before(async () => {
    sandbox = createSandbox('placeholders')
    ;({ scaffold } = await loadScaffold(sandbox))
  })
  after(() => destroySandbox(sandbox))

  it('seeds example projects before setup is even finished', () => {
    scaffold() // wizard mode

    const projects = fs
      .readdirSync(contentPath(sandbox, 'portfolio'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
    assert.ok(projects.length >= 2, 'a couple of projects to look at, not an empty folder')

    for (const project of projects) {
      const dir = contentPath(sandbox, 'portfolio', project.name)
      assert.ok(exists(dir, 'project.json'), `${project.name} has metadata`)
      assert.ok(exists(dir, 'cover.jpg'), `${project.name} has a cover`)
      assert.ok(
        fs.readdirSync(path.join(dir, 'assets')).length > 0,
        `${project.name} has images in assets/`,
      )
    }
  })

  it('ships placeholder images the artist can actually see', () => {
    // They were 1x1 pixels once, which reads as a broken site rather than a
    // prompt to replace them.
    const cover = contentPath(sandbox, 'portfolio', 'example-project', 'cover.jpg')
    assert.ok(fs.statSync(cover).size > 5_000, 'a real, visible placeholder image')
  })

  it('explains the folder in a README', () => {
    const readme = read(contentPath(sandbox, 'README.md'))
    assert.match(readme, /content\/portfolio/)
  })

  it('demonstrates both an explicit media list and auto-discovery', () => {
    const explicit = JSON.parse(
      read(contentPath(sandbox, 'portfolio', 'example-project', 'project.json')),
    )
    assert.ok(Array.isArray(explicit.media) && explicit.media.length > 0)
    assert.ok(
      explicit.media.every((m) => m.alt),
      'placeholders model alt text',
    )

    const discovered = JSON.parse(
      read(contentPath(sandbox, 'portfolio', 'example-series', 'project.json')),
    )
    assert.equal(discovered.media, undefined, 'this one relies on auto-discovery')
  })

  it('adds a placeholder product only once the store is switched on', () => {
    writeConfig(sandbox)
    scaffold()
    assert.ok(!exists(contentPath(sandbox, 'store')), 'no store, no products')

    writeConfig(sandbox, {
      store: { enabled: true, provider: 'stripe', currency: 'usd', layout: 'grid', shipFrom: '' },
    })
    scaffold()
    assert.ok(exists(contentPath(sandbox, 'store', 'example-print', 'product.json')))
    assert.ok(exists(contentPath(sandbox, 'store', 'example-print', 'cover.jpg')))
  })

  it('never overwrites work that is already there', () => {
    addProject(sandbox, 'example-project', { title: 'Mine now' })
    scaffold()
    const project = JSON.parse(
      read(contentPath(sandbox, 'portfolio', 'example-project', 'project.json')),
    )
    assert.equal(project.title, 'Mine now')
  })
})

describe('stage 3: reset returns to the wizard without losing work', () => {
  let sandbox
  let scaffold

  before(async () => {
    sandbox = createSandbox('reset')
    ;({ scaffold } = await loadScaffold(sandbox))
    writeConfig(sandbox, { blog: { enabled: true }, deployment: 'vercel' })
    scaffold()
    addProject(sandbox, 'keep-me', { title: 'Keep Me' })
    runReset(sandbox)
  })
  after(() => destroySandbox(sandbox))

  it('puts the wizard back', () => {
    const app = read(webPath(sandbox, 'src', 'App.tsx'))
    assert.match(app, /<SetupWizard \/>/)
    assert.ok(!exists(webPath(sandbox, 'src', 'pages')), 'site pages are gone')
  })

  it('restores the default config', () => {
    assert.equal(readConfig(sandbox).site.name, 'Artist Name')
  })

  it('keeps the artist content', () => {
    const project = JSON.parse(read(contentPath(sandbox, 'portfolio', 'keep-me', 'project.json')))
    assert.equal(project.title, 'Keep Me')
    assert.ok(exists(contentPath(sandbox, 'blog')), 'blog posts survive too')
  })

  it('removes the generated deployment files', () => {
    assert.ok(!exists(rootPath(sandbox, 'vercel.json')))
    assert.ok(!exists(rootPath(sandbox, 'api')))
  })

  it('rebuilds the generated CSS tokens', () => {
    // Without this the wizard comes back unstyled against a running dev server.
    const tokens = read(webPath(sandbox, 'src', 'styles', 'tokens.css'))
    assert.match(tokens, /--color-accent:/)
  })
})
