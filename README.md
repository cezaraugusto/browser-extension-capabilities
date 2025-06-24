[npm-version-image]: https://img.shields.io/npm/v/browser-extension-capabilities.svg?color=0971fe
[npm-version-url]: https://www.npmjs.com/package/browser-extension-capabilities
[npm-downloads-image]: https://img.shields.io/npm/dm/browser-extension-capabilities.svg?color=0971fe
[npm-downloads-url]: https://www.npmjs.com/package/browser-extension-capabilities
[action-image]: https://github.com/cezaraugusto/browser-extension-contexts/actions/workflows/ci.yml/badge.svg?branch=main
[action-url]: https://github.com/cezaraugusto/browser-extension-contexts/actions

# browser-extension-capabilities [![Version][npm-version-image]][npm-version-url] [![Downloads][npm-downloads-image]][npm-downloads-url] [![workflow][action-image]][action-url]

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
import { getExtensionCapabilities } from 'browser-extension-capabilities'

// Analyze an extension directory
const capabilities = getExtensionCapabilities('./path/to/extension')

// Returns array of capability objects
console.log(capabilities)
// [
//   {
//     capability: "background",
//     description: "Background service worker or page for persistent functionality"
//   },
//   {
//     capability: "content_scripts",
//     description: "Content scripts that run on web pages to interact with page content"
//   },
//   {
//     capability: "popup",
//     description: "Browser action popup or toolbar button functionality"
//   }
// ]
```

## Supported Capabilities

| Capability          | Description                                                         | Manifest Fields                                                      |
| ------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **background**      | Background service worker or page for persistent functionality      | `background.page`, `background.scripts`, `background.service_worker` |
| **content_scripts** | Content scripts that run on web pages to interact with page content | `content_scripts`                                                    |
| **popup**           | Browser action popup or toolbar button functionality                | `action.default_popup`                                               |
| **sidebar**         | Side panel interface for additional extension features              | `side_panel.default_path`, `sidebar_action.default_panel`            |
| **devtools**        | Developer tools panel for debugging and development                 | `devtools_page`                                                      |
| **options**         | Extension options page for user configuration                       | `options_ui.page`                                                    |
| **newtab**          | Custom new tab page replacement                                     | `chrome_url_overrides.newtab`                                        |
| **bookmarks**       | Custom bookmarks page replacement                                   | `chrome_url_overrides.bookmarks`                                     |
| **history**         | Custom history page replacement                                     | `chrome_url_overrides.history`                                       |
| **sandbox**         | Sandboxed pages with restricted permissions for security            | `sandbox.pages`                                                      |
| **web_resources**   | Web accessible resources for content script communication           | `web_accessible_resources`                                           |

## API Reference

### `getExtensionCapabilities(dataDir: string): ExtensionCapability[]`

Analyzes a browser extension manifest and returns an array of capability objects.

#### Parameters

- `dataDir` (string): Directory path containing the extension's `manifest.json` file

#### Returns

- `ExtensionCapability[]`: Array of capability objects with `capability` and `description` properties

#### Example

```typescript
import { getExtensionCapabilities } from 'browser-extension-capabilities'

try {
  const capabilities = getExtensionCapabilities('./my-extension')

  capabilities.forEach(({ capability, description }) => {
    console.log(`${capability}: ${description}`)
  })
} catch (error) {
  console.error('Failed to analyze extension:', error)
}
```

### Types

```typescript
interface ExtensionCapability {
  capability: string
  description: string
}
```

## Error Handling

The library gracefully handles various error scenarios:

- **Missing manifest file**: Returns `[{ capability: "manifest", description: "Basic extension manifest configuration" }]`
- **Invalid JSON**: Returns fallback capability with error logging
- **Malformed manifest**: Attempts to extract available capabilities and falls back gracefully

## Use Cases

- **Extension Analysis Tools**: Analyze extension capabilities and permissions
- **Marketplace Validation**: Verify extension capabilities for store listings
- **Development Tools**: IDE plugins and development utilities
- **Security Analysis**: Understand extension execution environments
- **Documentation Generation**: Auto-generate extension documentation

## Browser Support

- ✅ Chrome/Chromium (Manifest V2 & V3)
- ✅ Firefox (WebExtensions)
- ✅ Edge (Chromium-based)
- ✅ Opera (Chromium-based)
- ✅ Safari (WebExtensions)

## License

MIT (c) Cezar Augusto
