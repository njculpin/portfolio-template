import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const WEB = path.resolve(__dirname, '..')
const BLUEPRINT = path.resolve(WEB, '..', 'blueprint')

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

// 1. Remove scaffold outputs
rmDir(path.join(WEB, 'src'))
rmDir(path.join(WEB, 'blog'))
rmDir(path.join(WEB, 'portfolio'))
rmDir(path.join(WEB, 'store'))
rmDir(path.join(WEB, 'dist'))

// 2. Reset config to default
const defaultConfig = path.join(BLUEPRINT, 'defaults', 'portfolio.config.json')
const configDest = path.join(WEB, 'portfolio.config.json')
fs.copyFileSync(defaultConfig, configDest)

// 3. Re-scaffold in wizard-only mode
const { scaffold } = await import('./scaffold.js')
const result = scaffold()

console.log('Reset complete. ' + result.message)
