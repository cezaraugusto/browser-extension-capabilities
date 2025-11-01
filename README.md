[npm-version-image]: https://img.shields.io/npm/v/browser-extension-capabilities.svg?color=0971fe
[npm-version-url]: https://www.npmjs.com/package/browser-extension-capabilities
[npm-downloads-image]: https://img.shields.io/npm/dm/browser-extension-capabilities.svg?color=2ecc40
[npm-downloads-url]: https://www.npmjs.com/package/browser-extension-capabilities
[action-image]: https://github.com/cezaraugusto/browser-extension-capabilities/actions/workflows/ci.yml/badge.svg?branch=main
[action-url]: https://github.com/cezaraugusto/browser-extension-capabilities/actions

[![Version][npm-version-image]][npm-version-url] [![Downloads][npm-downloads-image]][npm-downloads-url] [![workflow][action-image]][action-url]

# browser-extension-capabilities

> Zero-dependency library for analyzing browser extension capabilities from manifest files

A lightweight, zero-dependency TypeScript library for analyzing browser extension manifests and extracting their capabilities. Useful for extension development tools, analysis tools, and browser extension marketplaces.

## What are Browser Extension Capabilities?

Browser extension capabilities represent the **functional interfaces and execution environments** that an extension can utilize. These are the different ways an extension can interact with the browser, web pages, and users. Each capability corresponds to specific manifest fields and defines where and how the extension's code can run.

For example:

- **Background Capability**: Allows the extension to run persistent code in the background
- **Content Scripts Capability**: Enables the extension to interact with web page content
- **Popup Capability**: Provides a user interface through browser toolbar buttons
- **Options Capability**: Offers configuration pages for user settings

## Features

- **Comprehensive Detection**: Detects all major browser extension capabilities and interfaces
- **User-Friendly Output**: Returns descriptive capability objects with explanations
- **Cross-Browser Support**: Works with Chrome, Firefox, Edge, and other Chromium-based browsers

## Installation

```bash
npm install browser-extension-capabilities
```

## Usage

```typescript
import {
  getExtensionCapabilities,
  getExtensionCapabilitiesAsync,
  analyzeExtensionManifest,
} from 'browser-extension-capabilities'

// 1) Sync (path)
const caps1 = getExtensionCapabilities('./path/to/extension/manifest.json', {
  includeFields: true,
  normalizeNames: true,
  includeCompatibility: true,
})

// 2) Async (path)
const caps2 = await getExtensionCapabilitiesAsync(
  './path/to/extension/manifest.json',
  { strict: true },
)

// 3) Direct object
import * as fs from 'fs'
const manifest = JSON.parse(fs.readFileSync('./path/to/manifest.json', 'utf8'))
const caps3 = analyzeExtensionManifest(manifest, { normalizeNames: true })

console.log(caps1)
// [
//   { capability: 'background', id: 'background', description: 'Background service worker or page for persistent functionality', fields: ['background.service_worker'] },
//   { capability: 'content_scripts', id: 'content_scripts', description: 'Content scripts that run on web pages to interact with page content', fields: ['content_scripts'] },
//   { capability: 'popup', id: 'action_popup', description: 'Toolbar popup UI', fields: ['action.default_popup'] },
// ]
```

## Supported Capabilities

| Capability                   | Description                                                         | Manifest Fields                                                                     |
| ---------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **background**               | Background service worker or page for persistent functionality      | `background.page`, `background.scripts`, `background.service_worker`                |
| **content_scripts**          | Content scripts that run on web pages to interact with page content | `content_scripts`                                                                   |
| **popup**                    | Toolbar popup UI                                                    | `action.default_popup`, `browser_action.default_popup`, `page_action.default_popup` |
| **sidebar**                  | Side panel UI                                                       | `side_panel.default_path`, `sidebar_action.default_panel`                           |
| **devtools**                 | Developer tools panel                                               | `devtools_page`                                                                     |
| **options**                  | Options page for user configuration                                 | `options_ui.page`, `options_page`                                                   |
| **newtab**                   | New tab page override                                               | `chrome_url_overrides.newtab`                                                       |
| **bookmarks**                | Custom bookmarks page replacement                                   | `chrome_url_overrides.bookmarks`                                                    |
| **history**                  | History page override                                               | `chrome_url_overrides.history`                                                      |
| **sandbox**                  | Sandboxed pages for isolated execution                              | `sandbox.pages`                                                                     |
| **web_resources**            | Web-accessible resources exposed to web pages                       | `web_accessible_resources`                                                          |
| **omnibox**                  | Omnibox keyword integration                                         | `omnibox.keyword`                                                                   |
| **commands**                 | Keyboard shortcuts and command actions                              | `commands`                                                                          |
| **settings_homepage**        | Browser settings override: homepage                                 | `chrome_settings_overrides.homepage`                                                |
| **settings_search_provider** | Browser settings override: search provider                          | `chrome_settings_overrides.search_provider`                                         |
| **settings_startup_pages**   | Browser settings override: startup pages                            | `chrome_settings_overrides.startup_pages`                                           |
| **declarative_net_request**  | Declarative network request rules                                   | `declarative_net_request.rule_resources`                                            |
| **tts_engine**               | Text-to-speech engine                                               | `tts_engine.voices`                                                                 |

## API Reference

### `getExtensionCapabilities(manifestPath: string, options?: GetCapabilitiesOptions): ExtensionCapability[]`

Analyzes a browser extension manifest from a file path and returns an array of capability objects.

#### Parameters

- `manifestPath` (string): Direct path to the extension's `manifest.json` file
- `options` (optional): See Options below

#### Returns

- `ExtensionCapability[]`: Array of capability objects with `capability`, `description`, and optionally `id` and `fields` when enabled via options

#### Example

```typescript
import { getExtensionCapabilities } from 'browser-extension-capabilities'

const capabilities = getExtensionCapabilities('./my-extension/manifest.json', {
  includeFields: true,
  normalizeNames: true,
})

capabilities.forEach(({ capability, id, description, fields }) => {
  console.log(`${id ?? capability}: ${description}`, fields ?? [])
})
```

### `getExtensionCapabilitiesAsync(manifestPath: string, options?: GetCapabilitiesOptions): Promise<ExtensionCapability[]>`

Async variant of the path-based API. Respects the same options and error handling semantics.

### `analyzeExtensionManifest(manifest: ExtensionManifest, options?: GetCapabilitiesOptions): ExtensionCapability[]`

Analyzes a manifest object directly without reading from disk.

### Types

```typescript
interface ExtensionCapability {
  capability: string
  description: string
  id?: string // normalized manifest-aligned name (e.g., "web_accessible_resources")
  fields?: string[] // manifest fields that triggered this capability
  compatibility?: {
    safari?: boolean
    notes?: string
    docs?: string
  }
}

interface GetCapabilitiesOptions {
  strict?: boolean // throw on missing/invalid manifest when true
  includeFields?: boolean // include manifest field paths in each capability
  normalizeNames?: boolean // include normalized id aligned with manifest naming
  includeCompatibility?: boolean // include Safari-focused compatibility metadata per capability
}
```

### Compatibility metadata (Safari-focused)

When `includeCompatibility: true` is set, each capability may include a `compatibility` object with conservative Safari support and notes.

Example output snippet:

```json
{
  "capability": "sidebar",
  "description": "Side panel UI",
  "id": "sidebar",
  "compatibility": {
    "safari": false,
    "notes": "Chromium uses side_panel; Firefox uses sidebar_action. Safari does not provide an equivalent sidebar UI API.",
    "docs": "https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/user_interface"
  }
}
```

## Error Handling

The library gracefully handles various error scenarios:

- **Missing manifest file**: Returns `[{ capability: "manifest", description: "Basic extension manifest configuration" }]` (or throws when `strict: true`)
- **Invalid JSON**: Returns fallback capability with error logging (or throws when `strict: true`)
- **Malformed manifest**: Attempts to extract available capabilities and falls back gracefully

## Use Cases

- **Extension Analysis Tools**: Analyze extension capabilities and permissions
- **Marketplace Validation**: Verify extension capabilities for store listings
- **Development Tools**: IDE plugins and development utilities
- **Security Analysis**: Understand extension execution environments
- **Documentation Generation**: Auto-generate extension documentation

## Browser Support

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome.svg" width="70"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge.svg" width="70"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox.svg" width="70"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera.svg" width="70"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari.svg" width="70"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/chromium/chromium.svg" width="70"> |
| :-----------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------: |
|                                              Chrome<br>✅                                               |                                             Edge<br>✅                                              |                                               Firefox<br>✅                                               |                                              Opera<br>✅                                              |                                              Safari<br>✅                                               |                                               Chromium<br>✅                                                |

## License

MIT (c) Cezar Augusto
