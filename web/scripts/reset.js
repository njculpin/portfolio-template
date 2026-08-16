import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const WEB = path.resolve(__dirname, '..')
const BLUEPRINT = path.resolve(WEB, '..', 'blueprint')

const { scaffold, clearDeploymentFiles } = await import('./scaffold.js')

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

// 1. Remove generated output inside web/. The artist's content lives at the
//    repo root (portfolio/, blog/, store/) and is deliberately left alone —
//    a reset rebuilds the site, it does not throw away the work.
rmDir(path.join(WEB, 'src'))
rmDir(path.join(WEB, 'dist'))

// 2. Remove the deployment files the scaffold writes to the repo root
//    (vercel.json, api/, netlify.toml, netlify/, generated workflows)
clearDeploymentFiles()

// 3. Reset config to default
const defaultConfig = path.join(BLUEPRINT, 'defaults', 'portfolio.config.json')
const configDest = path.join(WEB, 'portfolio.config.json')
fs.copyFileSync(defaultConfig, configDest)

// 4. Re-scaffold in wizard-only mode
const result = scaffold()

// 5. Rebuild the generated CSS tokens. Step 1 deleted src/styles/tokens.css,
//    and a dev server that is already running will not regenerate it — without
//    this the wizard comes back completely unstyled.
execFileSync(process.execPath, ['style-dictionary.config.js'], { cwd: WEB, stdio: 'inherit' })

console.log('Reset complete. ' + result.message)
