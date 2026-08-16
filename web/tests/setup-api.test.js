import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import net from 'node:net'

import {
  createSandbox,
  destroySandbox,
  loadScaffold,
  readConfig,
  webPath,
  rootPath,
  exists,
  read,
} from './helpers/sandbox.js'

/**
 * The submit step, driven through the dev server exactly as the wizard drives
 * it: one POST that saves the config, scaffolds the site, applies the theme and
 * rebuilds the tokens. This is the hinge of the lifecycle — if it half-runs, the
 * artist is left staring at the wizard again.
 */

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
  })
}

describe('submitting the wizard through the dev server', () => {
  let sandbox
  let server
  let port
  let response

  before(async () => {
    sandbox = createSandbox('setup-api')
    const { scaffold } = await loadScaffold(sandbox)
    scaffold() // wizard-only site, as a fresh install would have

    port = await freePort()
    const { createServer } = await import('vite')
    server = await createServer({
      root: sandbox.web,
      configFile: webPath(sandbox, 'vite.config.ts'),
      server: { host: '127.0.0.1', port, strictPort: true },
      logLevel: 'silent',
    })
    await server.listen()

    response = await fetch(`http://127.0.0.1:${port}/__api/complete-setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: {
          site: {
            name: 'Wired Artist',
            tagline: 'Illustrator and brand designer',
            bio: 'Bio',
            location: 'Portland, OR',
            resume: '',
            contact: { email: 'wired@example.com' },
            social: [],
          },
          domains: ['illustration', 'brand'],
          layout: { homepage: 'grid', project: 'scroll', navigation: 'topbar' },
          blog: { enabled: false },
          store: {
            enabled: false,
            provider: 'stripe',
            currency: 'usd',
            layout: 'grid',
            shipFrom: '',
          },
          deployment: 'vercel',
        },
        preset: 'editorial',
      }),
    })
  })

  after(async () => {
    await server?.close()
    destroySandbox(sandbox)
  })

  it('answers with the full-site mode', async () => {
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { ok: true, mode: 'full' })
  })

  it('saves the config the wizard collected', () => {
    const config = readConfig(sandbox)
    assert.equal(config.site.name, 'Wired Artist')
    assert.deepEqual(config.domains, ['illustration', 'brand'])
  })

  it('leaves no wizard behind to fall back to', () => {
    assert.ok(!exists(webPath(sandbox, 'src', 'components', 'SetupWizard')))
    assert.ok(!read(webPath(sandbox, 'src', 'App.tsx')).includes('SetupWizard'))
  })

  it('serves the real site instead', async () => {
    assert.ok(exists(webPath(sandbox, 'src', 'pages', 'HomePage.tsx')))
    const res = await fetch(`http://127.0.0.1:${port}/`)
    assert.equal(res.status, 200)
    assert.match(await res.text(), /<title>Wired Artist<\/title>/)
  })

  it('applies the chosen theme preset on top of the fresh scaffold', () => {
    // The scaffold re-copies the token sources, so a preset applied before it
    // would be silently overwritten.
    const tokens = read(webPath(sandbox, 'src', 'styles', 'tokens.css'))
    assert.match(tokens, /--color-accent: #c45d3e/)
    assert.match(tokens, /--font-family-heading: 'Playfair Display'/)
  })

  it('writes the deployment files for the chosen host', () => {
    assert.ok(exists(rootPath(sandbox, 'vercel.json')))
  })
})
