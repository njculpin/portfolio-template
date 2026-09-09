import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import { createSandbox, destroySandbox, loadScaffold, writeConfig } from './helpers/sandbox.js'

/**
 * A site that compiles can still render nothing — a bad hook call or a layout
 * that never receives its children shows up as a blank white page, not as a
 * build error. So actually render the generated pages.
 *
 * The pages are loaded through Vite's SSR pipeline, which is what makes the
 * `@/` aliases, CSS modules and `import.meta.glob` content loading work outside
 * a browser.
 */

const PROBE = `import { MemoryRouter, Routes, Route } from 'react-router'
import { ConfigProvider } from '@/hooks/useConfig'
import PageLayout from '@/layouts/PageLayout'
import HomePage from '@/pages/HomePage'
import ProjectPage from '@/pages/ProjectPage'
import AboutPage from '@/pages/AboutPage'

export function Probe({ path }: { path: string }) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <ConfigProvider>
        <Routes>
          <Route element={<PageLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/project/:slug" element={<ProjectPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Routes>
      </ConfigProvider>
    </MemoryRouter>
  )
}
`

describe('the generated site renders', () => {
  let sandbox
  let server
  let Probe

  before(async () => {
    sandbox = createSandbox('render')
    const { scaffold } = await loadScaffold(sandbox)
    writeConfig(sandbox, {
      site: {
        name: 'Rendered Artist',
        tagline: 'Illustrator',
        bio: 'A bio that belongs on the about page.',
        location: 'Portland, OR',
        resume: '',
        contact: { email: 'render@example.com' },
        social: [],
      },
      blog: { enabled: true },
    })
    scaffold()
    fs.writeFileSync(path.join(sandbox.web, 'src', '__probe.tsx'), PROBE)

    const { createServer } = await import('vite')
    server = await createServer({
      root: sandbox.web,
      configFile: path.join(sandbox.web, 'vite.config.ts'),
      server: { middlewareMode: true },
      appType: 'custom',
      logLevel: 'error',
    })
    ;({ Probe } = await server.ssrLoadModule('/src/__probe.tsx'))
  })

  after(async () => {
    await server?.close()
    destroySandbox(sandbox)
  })

  const render = (at) => renderToString(createElement(Probe, { path: at }))

  it('paints a home page with content in it', () => {
    const html = render('/')
    assert.ok(html.length > 500, 'not a blank page')
    assert.match(html, /Rendered Artist/, 'the site name is on screen')
    assert.match(html, /Example Project/, 'the placeholder projects are listed')
  })

  it('renders page content inside the layout, not just the chrome', () => {
    // PageLayout is a layout route: if it takes `children` instead of rendering
    // an <Outlet />, the nav and footer appear and the page itself never does.
    const html = render('/')
    const main = html.match(/<main[^>]*>([\s\S]*)<\/main>/)
    assert.ok(main, 'the layout renders a <main>')
    assert.ok(main[1].trim().length > 0, '<main> is not empty')
  })

  it('styles the navigation it generates', () => {
    // The generated markup referenced class names its stylesheet never defined,
    // which rendered a completely unstyled nav.
    const html = render('/')
    const nav = html.match(/<nav([^>]*)>/)
    assert.ok(nav, 'there is a nav')
    assert.match(nav[1], /class="[^"]*navigation/, 'the nav carries its CSS module class')
  })

  it('renders a project page', () => {
    const html = render('/project/example-project')
    assert.match(html, /Example Project/)
  })

  it('renders the about page with the artist bio', () => {
    const html = render('/about')
    assert.match(html, /A bio that belongs on the about page/)
  })
})
