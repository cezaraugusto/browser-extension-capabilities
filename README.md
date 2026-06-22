[npm-version-image]: https://img.shields.io/npm/v/browser-extension-capabilities.svg?color=0971fe
[npm-version-url]: https://www.npmjs.com/package/browser-extension-capabilities
[npm-downloads-image]: https://img.shields.io/npm/dm/browser-extension-capabilities.svg?color=2ecc40
[npm-downloads-url]: https://www.npmjs.com/package/browser-extension-capabilities
[action-image]: https://github.com/cezaraugusto/browser-extension-capabilities/actions/workflows/ci.yml/badge.svg?branch=main
[action-url]: https://github.com/cezaraugusto/browser-extension-capabilities/actions

> Zero-dependency library for analyzing browser extension capabilities from manifest files

# browser-extension-capabilities [![Version][npm-version-image]][npm-version-url] [![Downloads][npm-downloads-image]][npm-downloads-url] [![workflow][action-image]][action-url]

A lightweight, zero-dependency TypeScript library (and CLI) for analyzing browser extension manifests and extracting their capabilities. Useful for extension development tools, analysis tools, and browser extension marketplaces.

> **Static analysis only.** This library inspects the `manifest.json` you give it. Capabilities registered at runtime (`chrome.scripting`/`chrome.userScripts` content scripts, dynamic or session `declarativeNetRequest` rules, programmatically opened side panels) cannot be detected from the manifest. An absent capability means "not declared in the manifest," not "never used."

## Features

- **Comprehensive Detection**: Detects all major UI surfaces, execution contexts, and overrides
- **Permission & host analysis**: Opt-in surfacing of `permissions`, `host_permissions`, and their optional variants
- **Cross-browser compatibility metadata**: Per-capability Chrome/Edge/Firefox/Safari support (opt-in)
- **MV2 and MV3 aware**: Understands both manifest versions in a single pass
- **Library + CLI**: Use it programmatically or from the terminal

## Installation

```bash
npm install browser-extension-capabilities
```

## CLI

```bash
# Analyze a manifest (defaults to ./manifest.json)
npx browser-extension-capabilities ./my-extension/manifest.json

# Everything: fields, normalized ids, compatibility, and permissions
npx browser-extension-capabilities ./manifest.json --all

# Machine-readable output
npx browser-extension-capabilities ./manifest.json --json
```

| Flag            | Description                                                             |
| --------------- | --------------------------------------------------------------------- |
| `--fields`      | Include the manifest field paths that triggered each capability        |
| `--names`       | Include normalized, manifest-aligned ids                               |
| `--compat`      | Include cross-browser compatibility metadata                           |
| `--permissions` | Include permissions and host access as capabilities                    |
| `--all`         | Shorthand for `--fields --names --compat --permissions`                |
| `--json`        | Output JSON instead of a human-readable list                           |
| `--no-strict`   | Print the fallback capability instead of erroring on bad input         |
| `-h`, `--help`  | Show help                                                              |

## Usage

```typescript
import {
  getExtensionCapabilities,
  getExtensionCapabilitiesAsync,
  analyzeExtensionManifest,
  analyzeExtension,
} from 'browser-extension-capabilities'

// 1) Sync (path): throws on missing file / invalid JSON by default
const caps1 = getExtensionCapabilities('./path/to/extension/manifest.json', {
  includeFields: true,
  normalizeNames: true,
  includeCompatibility: true,
  includePermissions: true,
})

// 2) Async (path): opt out of throwing with strict: false
const caps2 = await getExtensionCapabilitiesAsync(
  './path/to/extension/manifest.json',
  { strict: false },
)

// 3) Direct object
import * as fs from 'fs'
const manifest = JSON.parse(fs.readFileSync('./path/to/manifest.json', 'utf8'))
const caps3 = analyzeExtensionManifest(manifest, { normalizeNames: true })

// 4) Direct object + metadata
const analysis = analyzeExtension(manifest)
// { manifestVersion: 3, name: 'My Extension', capabilities: [ ... ] }
```

## Supported Capabilities

| Capability                   | Description                                                         | Manifest Fields                                                                     |
| ---------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **background**               | Background service worker or page                                   | `background.page`, `background.scripts`, `background.service_worker`                |
| **content_scripts**          | Content scripts that run on web pages                               | `content_scripts`                                                                   |
| **user_scripts**             | Registration/execution of arbitrary user scripts                   | `user_scripts`                                                                       |
| **popup**                    | Toolbar popup UI                                                    | `action.default_popup`, `browser_action.default_popup`, `page_action.default_popup` |
| **side_panel**               | Side panel UI (Chromium)                                            | `side_panel.default_path`                                                            |
| **sidebar_action**           | Sidebar UI (Firefox)                                               | `sidebar_action.default_panel`                                                       |
| **devtools**                 | Developer tools panel                                              | `devtools_page`                                                                     |
| **options**                  | Options page for user configuration                                | `options_ui.page`, `options_page`                                                   |
| **newtab**                   | New tab page override                                              | `chrome_url_overrides.newtab`                                                       |
| **bookmarks**                | Custom bookmarks page replacement                                  | `chrome_url_overrides.bookmarks`                                                    |
| **history**                  | History page override                                             | `chrome_url_overrides.history`                                                      |
| **sandbox**                  | Sandboxed pages for isolated execution                            | `sandbox.pages`                                                                     |
| **web_resources**            | Web-accessible resources exposed to web pages                     | `web_accessible_resources`                                                          |
| **omnibox**                  | Omnibox keyword integration                                       | `omnibox.keyword`                                                                   |
| **commands**                 | Keyboard shortcuts and command actions                            | `commands`                                                                          |
| **settings_homepage**        | Browser settings override: homepage                               | `chrome_settings_overrides.homepage`                                                |
| **settings_search_provider** | Browser settings override: search provider                        | `chrome_settings_overrides.search_provider`                                         |
| **settings_startup_pages**   | Browser settings override: startup pages                          | `chrome_settings_overrides.startup_pages`                                           |
| **declarative_net_request**  | Declarative network request rules                                 | `declarative_net_request.rule_resources`                                            |
| **tts_engine**               | Text-to-speech engine                                             | `tts_engine.voices`                                                                 |
| **externally_connectable**   | Messaging endpoint for web pages / other extensions               | `externally_connectable.matches`, `externally_connectable.ids`                      |
| **content_security_policy**  | Custom Content Security Policy                                     | `content_security_policy`                                                           |
| **incognito**                | Declared incognito (private browsing) behavior                    | `incognito`                                                                         |
| **managed_storage**          | Managed storage schema for enterprise policy                      | `storage.managed_schema`                                                            |

### Permissions (opt-in)

With `includePermissions: true` (or `--permissions`), the analyzer also emits a capability per requested permission and one for host access:

- Each entry in `permissions` / `optional_permissions` (optional ones carry `optional: true`)
- `host_permissions` / `optional_host_permissions`, with the match patterns in `fields`

Well-known API permissions (`nativeMessaging`, `webRequest`, `scripting`, `cookies`, `debugger`, …) get a human-readable description; unknown ones fall back to `API permission: <name>`.

## API Reference

### `getExtensionCapabilities(manifestPath, options?): ExtensionCapability[]`

Reads a manifest from disk (synchronous) and returns its capabilities.

### `getExtensionCapabilitiesAsync(manifestPath, options?): Promise<ExtensionCapability[]>`

Async variant. Same options and error semantics.

### `analyzeExtensionManifest(manifest, options?): ExtensionCapability[]`

Analyzes a manifest object directly without reading from disk.

### `analyzeExtension(manifest, options?): ExtensionAnalysis`

Like `analyzeExtensionManifest`, but returns `{ manifestVersion, name, capabilities }`.

### Types

```typescript
interface ExtensionCapability {
  capability: string
  description: string
  id?: string // normalized manifest-aligned name (e.g., "web_accessible_resources")
  fields?: string[] // manifest fields that triggered this capability
  optional?: boolean // true for optional_permissions / optional_host_permissions
  compatibility?: {
    chrome?: boolean
    edge?: boolean
    firefox?: boolean
    safari?: boolean
    notes?: string
    docs?: string
  }
}

interface ExtensionAnalysis {
  manifestVersion?: number
  name?: string
  capabilities: ExtensionCapability[]
}

interface GetCapabilitiesOptions {
  strict?: boolean // default true: throw on missing/invalid manifest; set false to return the fallback
  includeFields?: boolean // include manifest field paths in each capability
  normalizeNames?: boolean // include normalized id aligned with manifest naming
  includeCompatibility?: boolean // include cross-browser compatibility metadata per capability
  includePermissions?: boolean // surface permissions and host access as capabilities
}
```

### Compatibility metadata

When `includeCompatibility: true` is set, each capability may include a `compatibility` object describing per-browser support.

The data is **generated from [browser-extension-compat-data](https://github.com/cezaraugusto/browser-extension-compat-data)** (which sources MDN's [browser-compat-data](https://github.com/mdn/browser-compat-data)) and committed as a snapshot in `src/generated/compat.ts`. Regenerate it with `pnpm data:build-compat`. Two rules are applied on top of the raw data:

- **Edge mirrors Chrome.** MDN's WebExtensions data under-tracks Edge (most entries read `false` even for features Edge ships), so Edge is derived from Chrome (Edge is Chromium-based).
- **`sandbox` and `tts_engine`** are not in MDN's manifest data, so they use a best-effort override (flagged in `notes`).

```json
{
  "capability": "externally_connectable",
  "description": "Messaging endpoint for web pages and other extensions",
  "id": "externally_connectable",
  "compatibility": {
    "chrome": true,
    "edge": true,
    "firefox": false,
    "safari": true,
    "notes": "Partial support in Safari.",
    "docs": "https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/externally_connectable"
  }
}
```

## Error Handling

By default the library **throws** so problems are never silently swallowed:

- **Missing manifest file**: throws `Error` (or returns the `manifest` fallback when `strict: false`)
- **Invalid JSON**: throws `SyntaxError` (or returns the fallback when `strict: false`)
- **Non-object manifest** (`null`, array, primitive): throws `TypeError` (or returns the fallback when `strict: false`)

A valid manifest that declares no recognized capabilities returns a single `manifest` capability; that is a result, not an error. The library never writes to `console`.

## Browser Support

The analyzer itself is browser-agnostic (it parses JSON). The table below reflects where the *runtime* of this package is exercised; per-capability browser support is available via `includeCompatibility`.

| <img src="https://media.extension.land/logos/browsers/chrome.svg" width="70"> | <img src="https://media.extension.land/logos/browsers/edge.svg" width="70"> | <img src="https://media.extension.land/logos/browsers/firefox.svg" width="70"> | <img src="https://media.extension.land/logos/browsers/opera.svg" width="70"> | <img src="https://media.extension.land/logos/browsers/safari.svg" width="70"> | <img src="https://media.extension.land/logos/browsers/chromium.svg" width="70"> |
| :-----------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------: |
|                                              Chrome<br>✅                                               |                                             Edge<br>✅                                              |                                               Firefox<br>✅                                               |                                              Opera<br>✅                                              |                                              Safari<br>✅                                               |                                               Chromium<br>✅                                                |

## Related projects

* [browser-extension-manifest-fields](https://github.com/cezaraugusto/browser-extension-manifest-fields)
* [browser-extension-compat-data](https://github.com/cezaraugusto/browser-extension-compat-data)
* [extension-from-store](https://github.com/cezaraugusto/extension-from-store)
* [chrome-extension-manifest-json-schema](https://github.com/cezaraugusto/chrome-extension-manifest-json-schema)
* [parse5-asset-patcher](https://github.com/cezaraugusto/parse5-asset-patcher)

## Migrating from v2

- **Errors throw by default.** v2 swallowed missing-file / invalid-JSON errors and logged to `console`. v3 throws; pass `strict: false` to restore fallback-style behavior. The library no longer logs.
- **`sidebar` split into `side_panel` and `sidebar_action`.** The old merged `sidebar` capability is gone; detect the Chromium and Firefox surfaces independently.
- **`compatibility` is now multi-browser and data-sourced.** It exposes `chrome`/`edge`/`firefox`/`safari` (instead of a single `safari` boolean), generated from `browser-extension-compat-data` / MDN rather than hand-maintained.

## License

MIT (c) Cezar Augusto.
