// Writes the package.json of the deploy branch: only what is needed to run the
// app, with the exact versions that are in package-lock.json. The tools to
// build and check the code (Vite, ESLint, Stylelint...) are not installed there.
import { readFileSync, writeFileSync } from 'node:fs'

// Runtime dependencies of the server: everything else is only used to build
const RUNTIME_DEPENDENCIES = ['socket.io', 'tsx']

const output = process.argv[2] ?? 'package.json'
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'))

// The version that is actually installed, not the range from package.json
function exactVersion(name) {
  return lock.packages[`node_modules/${name}`].version
}

const deployPackage = {
  name: pkg.name,
  private: true,
  type: 'module',
  scripts: { start: pkg.scripts.start },
  dependencies: Object.fromEntries(
    RUNTIME_DEPENDENCIES.map((name) => [name, exactVersion(name)]),
  ),
}

writeFileSync(output, `${JSON.stringify(deployPackage, null, 2)}\n`)
