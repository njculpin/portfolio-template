import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import { execFileSync } from 'child_process'
import { createRequire } from 'module'

import {
  createSandbox,
  destroySandbox,
  loadScaffold,
  writeConfig,
  contentPath,
} from './helpers/sandbox.js'

/**
 * `npm run build` runs tsc before vite, so a type error anywhere in the
 * generated site blocks every deploy. The scaffold writes different code for
 * each combination of features and layouts, so each combination has to be
 * checked on its own.
 */

const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc')

function typecheck(sandbox) {
  try {
    execFileSync(process.execPath, [tsc, '--noEmit', '-p', 'tsconfig.json'], {
      cwd: sandbox.web,
      encoding: 'utf-8',
      stdio: 'pipe',
    })
    return ''
  } catch (err) {
    return `${err.stdout || ''}${err.stderr || ''}`.trim()
  }
}

describe('the generated site typechecks', () => {
  let sandbox
  let scaffold

  before(async () => {
    sandbox = createSandbox('typecheck')
    ;({ scaffold } = await loadScaffold(sandbox))
  })
  after(() => destroySandbox(sandbox))

  it('in wizard mode', () => {
    scaffold()
    assert.equal(typecheck(sandbox), '')
  })

  it('with no optional features', () => {
    writeConfig(sandbox)
    scaffold()
    assert.equal(typecheck(sandbox), '')
  })

  it('with the blog and a Stripe store', () => {
    writeConfig(sandbox, {
      blog: { enabled: true },
      store: { enabled: true, provider: 'stripe', currency: 'usd', layout: 'grid', shipFrom: '' },
    })
    scaffold()
    assert.equal(typecheck(sandbox), '')
  })

  it('with a Shopify store', () => {
    writeConfig(sandbox, {
      store: { enabled: true, provider: 'shopify', currency: 'usd', layout: 'grid', shipFrom: '' },
    })
    scaffold()
    assert.equal(typecheck(sandbox), '')
  })

  it('with the sidebar and split-view layouts', () => {
    writeConfig(sandbox, {
      layout: { homepage: 'masonry', project: 'splitview', navigation: 'sidebar' },
    })
    scaffold()
    assert.equal(typecheck(sandbox), '')
  })

  it('with the overlay and slideshow layouts', () => {
    writeConfig(sandbox, {
      layout: { homepage: 'columnized', project: 'slideshow', navigation: 'overlay' },
    })
    scaffold()
    assert.equal(typecheck(sandbox), '')
  })

  it('with a project that overrides the site-wide layout', () => {
    // Two variants means ProjectDetail becomes a switch rather than a passthrough.
    const dir = contentPath(sandbox, 'portfolio', 'override')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(
      `${dir}/project.json`,
      JSON.stringify({ title: 'Override', layout: 'slideshow', tags: [], date: '2026-01-01' }),
    )
    writeConfig(sandbox, { layout: { homepage: 'grid', project: 'scroll', navigation: 'topbar' } })
    scaffold()
    assert.equal(typecheck(sandbox), '')
  })
})
