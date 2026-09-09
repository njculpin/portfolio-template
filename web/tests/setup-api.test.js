import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import net from 'node:net'

import {
  createSandbox,
  destroySandbox,
  loadScaffold,
  readConfig,
  writeConfig,
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitFor(predicate, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (predicate()) return true
    await sleep(100)
  }
  return false
}

/** The endpoint answers in newline-delimited JSON: a line per step, then the result. */
function parseStream(text) {
  return text
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line))
}

describe('an open browser is told to reload when the site is rebuilt', () => {
  let sandbox
  let server
  let socket
  let received

  before(async () => {
    sandbox = createSandbox('reload')
    const { scaffold } = await loadScaffold(sandbox)
    scaffold() // wizard-only, as a browser sitting on the wizard would have

    const port = await freePort()
    const { createServer } = await import('vite')
    server = await createServer({
      root: sandbox.web,
      configFile: webPath(sandbox, 'vite.config.ts'),
      server: { host: '127.0.0.1', port, strictPort: true },
      logLevel: 'silent',
    })
    await server.listen()

    // Connect the way a browser tab does.
    received = []
    socket = new WebSocket(`ws://127.0.0.1:${port}`, 'vite-hmr')
    socket.onmessage = (event) => received.push(JSON.parse(event.data))
    await new Promise((resolve) => {
      socket.onopen = resolve
    })

    // Give the file watcher a moment to finish its initial scan, otherwise the
    // rebuild lands before it is listening.
    await sleep(1000)

    // Now rebuild into the real site, as submitting the wizard does.
    writeConfig(sandbox)
    scaffold()
    await waitFor(() => received.some((m) => m.type === 'full-reload'))
  })

  after(async () => {
    socket?.close()
    await server?.close()
    destroySandbox(sandbox)
  })

  it('sends a full reload rather than trying to hot-patch the swap', () => {
    // src/ is replaced wholesale and App.tsx flips between the wizard and the
    // site. HMR cannot patch that, and a browser left alone keeps showing
    // modules that no longer exist — which is what made reset look broken.
    const reloads = received.filter((m) => m.type === 'full-reload')
    assert.ok(reloads.length > 0, 'the open page is told to reload')
  })
})

describe('submitting the wizard through the dev server', () => {
  let sandbox
  let server
  let port
  let response
  let messages

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

    messages = parseStream(await response.text())
  })

  after(async () => {
    await server?.close()
    destroySandbox(sandbox)
  })

  it('answers with the full-site mode', () => {
    assert.equal(response.status, 200)
    assert.deepEqual(messages.at(-1), { ok: true, mode: 'full' })
  })

  it('reports each step as it happens, so the wizard can show progress', () => {
    const stages = messages.filter((m) => m.stage).map((m) => m.stage)
    assert.deepEqual(stages, ['config', 'build', 'theme', 'styles'])
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
