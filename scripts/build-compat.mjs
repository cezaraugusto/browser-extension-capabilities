// Regenerates src/generated/compat.ts from `browser-extension-compat-data`
// (which sources MDN browser-compat-data). Run: pnpm data:build-compat
//
// Why a committed snapshot instead of a runtime dependency:
//   - browser-extension-compat-data is not published to npm yet, so a hard
//     dependency would make this package uninstallable.
//   - Consumers of capability detection should not have to pull in the compat
//     toolchain (and its acorn dependency) just to read a support table.
// The data still comes from the canonical source and is regenerable anytime.
//
// Two documented rules applied on top of the raw data:
//   1. Edge mirrors Chrome. MDN's WebExtensions BCD under-tracks Edge (most
//      entries are `false` even for features Edge ships), so we derive Edge
//      from Chrome (Edge is Chromium-based). This matches how MDN displays it.
//   2. Keys MDN does not track (sandbox, tts_engine) fall back to OVERRIDES.

import {fileURLToPath} from 'node:url'
import {dirname, resolve} from 'node:path'
import {writeFileSync, readFileSync, existsSync} from 'node:fs'

const here = dirname(fileURLToPath(import.meta.url))

// `--check` regenerates and fails on drift instead of writing. Used in CI; it
// skips cleanly when the compat-data source is not checked out alongside.
const CHECK = process.argv.includes('--check')

const distPath =
  process.env.COMPAT_DATA_DIST ??
  resolve(here, '../../browser-extension-compat-data/dist/index.js')

// Assigned in main() from the compat-data dist (top-level await is avoided so
// the script lints cleanly under the shared config).
let getSupport
let getMdnUrl
let hasFeature

const OUT = resolve(here, '../src/generated/compat.ts')

// capability id -> manifest key(s). A browser supports the capability if it
// supports ANY of the keys (OR). The first key that exists drives the doc URL.
const CAPABILITIES = {
  background: [
    'background.service_worker',
    'background.scripts',
    'background.page'
  ],
  content_scripts: ['content_scripts'],
  user_scripts: ['user_scripts'],
  action_popup: [
    'action.default_popup',
    'browser_action.default_popup',
    'page_action.default_popup'
  ],
  side_panel: ['side_panel'],
  sidebar_action: ['sidebar_action.default_panel', 'sidebar_action'],
  devtools_page: ['devtools_page'],
  options: ['options_ui', 'options_page'],
  'chrome_url_overrides.newtab': ['chrome_url_overrides.newtab'],
  'chrome_url_overrides.bookmarks': ['chrome_url_overrides.bookmarks'],
  'chrome_url_overrides.history': ['chrome_url_overrides.history'],
  web_accessible_resources: ['web_accessible_resources'],
  omnibox: ['omnibox.keyword', 'omnibox'],
  commands: ['commands'],
  'chrome_settings_overrides.homepage': ['chrome_settings_overrides.homepage'],
  'chrome_settings_overrides.search_provider': [
    'chrome_settings_overrides.search_provider'
  ],
  'chrome_settings_overrides.startup_pages': [
    'chrome_settings_overrides.startup_pages'
  ],
  declarative_net_request: ['declarative_net_request.rule_resources'],
  externally_connectable: ['externally_connectable'],
  content_security_policy: ['content_security_policy'],
  incognito: ['incognito'],
  'storage.managed_schema': ['storage.managed_schema']
}

// Keys MDN browser-compat-data does not track. Best-effort, flagged as such.
const OVERRIDES = {
  sandbox: {
    chrome: true,
    edge: true,
    firefox: false,
    safari: false,
    notes:
      'Not tracked by MDN browser-compat-data; best-effort. Sandboxed pages are Chromium-only.'
  },
  tts_engine: {
    chrome: true,
    edge: true,
    firefox: false,
    safari: false,
    notes:
      'Not tracked by MDN browser-compat-data; best-effort. TTS engine registration is Chromium-only.'
  }
}

const TRACKED = ['chrome', 'firefox', 'safari']
const LABEL = {firefox: 'Firefox', safari: 'Safari', edge: 'Edge'}

function supportFor (keys, browser) {
  // OR across keys. partial only if every supporting key is partial.
  let supported = false
  let anyFull = false
  let anyPartial = false

  for (const key of keys) {
    const map = getSupport('manifest', key)
    const info = map?.[browser]

    if (info?.supported) {
      supported = true

      if (info.partial) anyPartial = true
      else anyFull = true
    }
  }

  return {supported, partial: supported && anyPartial && !anyFull}
}

function docUrl (keys) {
  for (const key of keys) {
    if (hasFeature('manifest', key)) return getMdnUrl('manifest', key)
  }

  return null
}

function buildEntry (keys) {
  const entry = {}
  const partials = []

  for (const browser of TRACKED) {
    const {supported, partial} = supportFor(keys, browser)

    entry[browser] = supported

    if (partial) partials.push(LABEL[browser])
  }

  // Rule 1: Edge mirrors Chrome.
  entry.edge = entry.chrome

  const notes = []

  if (partials.length) {
    notes.push(`Partial support in ${partials.join(' and ')}.`)
  }

  const ordered = {
    chrome: entry.chrome,
    edge: entry.edge,
    firefox: entry.firefox,
    safari: entry.safari
  }

  if (notes.length) ordered.notes = notes.join(' ')

  const docs = docUrl(keys)

  if (docs) ordered.docs = docs

  return ordered
}

function render () {
  const result = {}

  for (const [id, keys] of Object.entries(CAPABILITIES)) {
    result[id] = buildEntry(keys)
  }

  for (const [id, entry] of Object.entries(OVERRIDES)) {
    result[id] = entry
  }

  // Stable, sorted output for clean diffs.
  const sorted = Object.fromEntries(
    Object.entries(result).sort(([a], [b]) => a.localeCompare(b))
  )

  const header = `/* eslint-disable @stylistic/max-len */
// AUTO-GENERATED, do not edit by hand.
// Source: browser-extension-compat-data (MDN browser-compat-data).
// Regenerate with: pnpm data:build-compat
import type {CapabilityCompatibility} from '../types'

export const CAP_COMPAT: Record<string, CapabilityCompatibility> = `

  const body = JSON.stringify(sorted, null, 2)
    // Quote-free keys where valid, single quotes for strings, to match style.
    .replace(/"([a-zA-Z_$][\w$]*)":/g, '$1:')
    .replace(/"([^"\\]*)"/g, "'$1'")

  return {content: `${header}${body}\n`, count: Object.keys(sorted).length}
}

async function main () {
  let mod

  try {
    mod = await import(distPath)
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.log(
        `Skipping: compat-data source not found at ${distPath}. ` +
          'Set COMPAT_DATA_DIST or build the sibling package to regenerate.'
      )

      return
    }

    throw error
  }

  getSupport = mod.getSupport
  getMdnUrl = mod.getMdnUrl
  hasFeature = mod.hasFeature

  const {content, count} = render()

  if (CHECK) {
    const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : ''

    if (current !== content) {
      console.error(
        'src/generated/compat.ts is out of date. ' +
          'Run `pnpm data:build-compat` and commit the result.'
      )
      process.exitCode = 1

      return
    }

    console.log(`compat.ts is up to date (${count} capabilities).`)

    return
  }

  writeFileSync(OUT, content, 'utf8')

  console.log(`Wrote ${OUT} (${count} capabilities)`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
