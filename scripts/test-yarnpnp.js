const child_process = require('child_process')
const ezburn = require('./ezburn')
const path = require('path')
const fs = require('fs')

const EZBURN_BINARY_PATH = ezburn.buildBinary()
const rootDir = path.join(__dirname, '..', 'require', 'yarnpnp')

function run(command) {
  console.log('\n\x1B[37m' + '$ ' + command + '\x1B[0m')
  child_process.execSync(command, { cwd: rootDir, stdio: 'inherit' })
}

function modTime(file) {
  return fs.statSync(file).mtimeMs
}

function reinstallYarnIfNeeded() {
  const yarnPath = path.join(rootDir, '.yarn', 'releases', 'yarn-4.0.0-rc.22.cjs')

  if (fs.existsSync(yarnPath) && modTime(yarnPath) > Math.max(
    modTime(path.join(rootDir, 'package.json')),
    modTime(path.join(rootDir, 'yarn.lock')),
  )) {
    return
  }

  fs.rmSync(path.join(rootDir, '.pnp.cjs'), { recursive: true, force: true })
  fs.rmSync(path.join(rootDir, '.pnp.loader.mjs'), { recursive: true, force: true })
  fs.rmSync(path.join(rootDir, '.yarn'), { recursive: true, force: true })
  fs.rmSync(path.join(rootDir, '.yarnrc.yml'), { recursive: true, force: true })

  try {
    run('yarn set version 4.0.0-rc.22')
  } catch {
    run('npm i -g yarn') // Install Yarn globally if it's not already installed
    run('yarn set version 4.0.0-rc.22')
  }

  let rc
  try {
    rc = fs.readFileSync(path.join(rootDir, '.yarnrc.yml'), 'utf8')
  } catch {
    rc = '' // Sometimes this file doesn't exist, so pretend it's empty
  }
  fs.writeFileSync(path.join(rootDir, '.yarnrc.yml'), `
pnpEnableEsmLoader: true
pnpIgnorePatterns: ["./bar/**"]

# Note: Yarn 4 defaults to "enableGlobalCache: true" which doesn't
# work on Windows due to cross-drive issues with relative paths.
# Explicitly set "enableGlobalCache: false" to avoid this issue.
enableGlobalCache: false

` + rc)

  run('yarn install')
}

function runTests() {
  // Make sure the tests are valid
  run('yarn node in.mjs')

  // Test the native build
  child_process.execFileSync(EZBURN_BINARY_PATH, [
    'in.mjs',
    '--bundle',
    '--log-level=debug',
    '--platform=node',
    '--outfile=out-native.js',
  ], { cwd: rootDir, stdio: 'inherit' })
  run('node out-native.js')

  // Test the WebAssembly build
  ezburn.buildWasmLib(EZBURN_BINARY_PATH)
  run('node ../../npm/ezburn-wasm/bin/ezburn in.mjs --bundle --log-level=debug --platform=node --outfile=out-wasm.js')
  run('node out-wasm.js')

  // Test the WebAssembly build when run through Yarn's file system shim
  ezburn.buildWasmLib(EZBURN_BINARY_PATH)
  run('yarn node ../../npm/ezburn-wasm/bin/ezburn in.mjs --bundle --log-level=debug --platform=node --outfile=out-wasm-yarn.js')
  run('node out-wasm-yarn.js')
}

const minutes = 10
const timeout = setTimeout(() => {
  console.error(`❌ Yarn PnP tests timed out after ${minutes} minutes`)
  process.exit(1)
}, minutes * 60 * 1000)

reinstallYarnIfNeeded()
runTests()
clearTimeout(timeout)
