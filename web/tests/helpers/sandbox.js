import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath, pathToFileURL } from 'url'

const HERE = path.dirname(fileURLToPath(import.meta.url))

export const REAL_WEB = path.resolve(HERE, '..', '..')
export const REAL_ROOT = path.resolve(REAL_WEB, '..')

// Sandboxes live inside web/ on purpose: node resolves bare imports by walking
// up the directory tree, so scripts running in a sandbox find web/node_modules
// without any symlinking. Nothing outside the sandbox is ever written to.
const TMP_BASE = path.join(REAL_WEB, '.test-tmp')

const WEB_FILES = ['style-dictionary.config.js', 'package.json', 'vite.config.ts', 'tsconfig.json']

/**
 * A throwaway copy of the repo layout: <sandbox>/blueprint + <sandbox>/web.
 * scaffold.js derives WEB and ROOT from its own location, so everything it
 * writes — including the artist's content dirs — stays inside the sandbox.
 */
export function createSandbox(name) {
  fs.mkdirSync(TMP_BASE, { recursive: true })
  const root = fs.mkdtempSync(path.join(TMP_BASE, `${name}-`))
  const web = path.join(root, 'web')

  fs.cpSync(path.join(REAL_ROOT, 'blueprint'), path.join(root, 'blueprint'), { recursive: true })
  fs.mkdirSync(web, { recursive: true })
  fs.cpSync(path.join(REAL_WEB, 'scripts'), path.join(web, 'scripts'), { recursive: true })
  for (const file of WEB_FILES) {
    fs.copyFileSync(path.join(REAL_WEB, file), path.join(web, file))
  }

  return { root, web }
}

export function destroySandbox(sandbox) {
  fs.rmSync(sandbox.root, { recursive: true, force: true })
}

/** scaffold.js from *this* sandbox, so its WEB/ROOT point at the sandbox. */
export function loadScaffold(sandbox) {
  return import(pathToFileURL(path.join(sandbox.web, 'scripts', 'scaffold.js')).href)
}

export function runReset(sandbox) {
  return execFileSync(process.execPath, ['scripts/reset.js'], {
    cwd: sandbox.web,
    encoding: 'utf-8',
    stdio: 'pipe',
  })
}

export function configPath(sandbox) {
  return path.join(sandbox.web, 'portfolio.config.json')
}

/** Write a portfolio.config.json as the wizard would on submit. */
export function writeConfig(sandbox, overrides = {}) {
  const config = {
    site: {
      name: 'Test Artist',
      tagline: 'Test tagline',
      bio: 'Test bio',
      location: 'Portland, OR',
      resume: '',
      contact: { email: 'test@example.com' },
      social: [],
    },
    domains: ['illustration'],
    layout: { homepage: 'grid', project: 'scroll', navigation: 'topbar' },
    blog: { enabled: false },
    store: { enabled: false, provider: 'stripe', currency: 'usd', layout: 'grid', shipFrom: '' },
    deployment: 'vercel',
    ...overrides,
  }
  fs.writeFileSync(configPath(sandbox), JSON.stringify(config, null, 2) + '\n')
  return config
}

export function readConfig(sandbox) {
  return JSON.parse(fs.readFileSync(configPath(sandbox), 'utf-8'))
}

export function webPath(sandbox, ...segments) {
  return path.join(sandbox.web, ...segments)
}

export function rootPath(sandbox, ...segments) {
  return path.join(sandbox.root, ...segments)
}

/** The artist's content package: <sandbox>/content/... */
export function contentPath(sandbox, ...segments) {
  return path.join(sandbox.root, 'content', ...segments)
}

export function exists(...segments) {
  return fs.existsSync(path.join(...segments))
}

export function read(...segments) {
  return fs.readFileSync(path.join(...segments), 'utf-8')
}

/** Drop a project into the artist's content dir. */
export function addProject(sandbox, slug, project = {}) {
  const dir = contentPath(sandbox, 'portfolio', slug)
  fs.mkdirSync(path.join(dir, 'assets'), { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'project.json'),
    JSON.stringify(
      { title: slug, description: '', tags: [], date: '2026-01-01', ...project },
      null,
      2,
    ),
  )
  return dir
}
