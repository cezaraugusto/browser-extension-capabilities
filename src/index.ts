import * as fs from 'fs'

// Types for better type safety
interface ExtensionManifest {
  manifest_version: number
  name: string
  version: string
  description?: string
  action?: {
    default_popup?: string
    default_title?: string
    default_icon?: string | Record<string, string>
  }
  background?: {
    page?: string
    scripts?: string[]
    service_worker?: string
    'chromium:service_worker'?: string
    'gecko:scripts'?: string[]
  }
  content_scripts?: Array<{
    matches: string[]
    js?: string[]
    css?: string[]
    run_at?: string
  }>
  devtools_page?: string
  options_ui?: {
    page: string
    open_in_tab?: boolean
  }
  side_panel?: {
    default_path: string
    default_title?: string
  }
  sidebar_action?: {
    default_panel?: string
    default_title?: string
  }
  chrome_url_overrides?: {
    newtab?: string
    bookmarks?: string
    history?: string
  }
  sandbox?: {
    pages: string[]
  }
  web_accessible_resources?: Array<{
    resources: string[]
    matches: string[]
  }>
  permissions?: string[]
  host_permissions?: string[]
}

interface ExtensionCapability {
  capability: string
  description: string
}

/**
 * Gets extension capabilities as an array of objects with capability and description.
 * Analyzes a browser extension manifest to extract all possible interfaces/capabilities
 * where the extension can run or interact with the browser.
 *
 * @param manifestPath - Direct path to the extension's manifest.json file
 * @returns Array of capability objects with descriptions
 *
 * @example
 * ```typescript
 * const capabilities = getExtensionCapabilities('./extension/manifest.json');
 * // Returns: [
 * //   { capability: "background", description: "Background service worker for persistent functionality" },
 * //   { capability: "content_scripts", description: "Content scripts that run on web pages" },
 * //   { capability: "popup", description: "Browser action popup or toolbar button functionality" }
 * // ]
 * ```
 */
export function getExtensionCapabilities(
  manifestPath: string,
): ExtensionCapability[] {
  try {
    if (!fs.existsSync(manifestPath)) {
      console.warn(`Manifest file not found at: ${manifestPath}`)
      return [
        {
          capability: 'manifest',
          description: 'Basic extension manifest configuration',
        },
      ]
    }

    const manifestContent = fs.readFileSync(manifestPath, 'utf8')
    const manifest: ExtensionManifest = JSON.parse(manifestContent)

    const capabilityMap = new Map<string, ExtensionCapability>()

    // Background capabilities
    if (manifest.background) {
      if (
        manifest.background.page ||
        manifest.background.scripts?.length ||
        manifest.background.service_worker ||
        manifest.background['chromium:service_worker'] ||
        manifest.background['gecko:scripts']?.length
      ) {
        capabilityMap.set('background', {
          capability: 'background',
          description:
            'Background service worker or page for persistent functionality',
        })
      }
    }

    // Content scripts
    if (manifest.content_scripts && manifest.content_scripts.length > 0) {
      capabilityMap.set('content_scripts', {
        capability: 'content_scripts',
        description:
          'Content scripts that run on web pages to interact with page content',
      })
    }

    // Action popup
    if (manifest.action?.default_popup) {
      capabilityMap.set('popup', {
        capability: 'popup',
        description: 'Browser action popup or toolbar button functionality',
      })
    }

    // Side panel
    if (
      manifest.side_panel?.default_path ||
      manifest.sidebar_action?.default_panel
    ) {
      capabilityMap.set('sidebar', {
        capability: 'sidebar',
        description: 'Side panel interface for additional extension features',
      })
    }

    // DevTools
    if (manifest.devtools_page) {
      capabilityMap.set('devtools', {
        capability: 'devtools',
        description: 'Developer tools panel for debugging and development',
      })
    }

    // Options page
    if (manifest.options_ui?.page) {
      capabilityMap.set('options', {
        capability: 'options',
        description: 'Extension options page for user configuration',
      })
    }

    // Chrome URL overrides
    if (manifest.chrome_url_overrides) {
      if (manifest.chrome_url_overrides.newtab) {
        capabilityMap.set('newtab', {
          capability: 'newtab',
          description: 'Custom new tab page replacement',
        })
      }
      if (manifest.chrome_url_overrides.bookmarks) {
        capabilityMap.set('bookmarks', {
          capability: 'bookmarks',
          description: 'Custom bookmarks page replacement',
        })
      }
      if (manifest.chrome_url_overrides.history) {
        capabilityMap.set('history', {
          capability: 'history',
          description: 'Custom history page replacement',
        })
      }
    }

    // Sandbox pages
    if (manifest.sandbox?.pages && manifest.sandbox.pages.length > 0) {
      capabilityMap.set('sandbox', {
        capability: 'sandbox',
        description: 'Sandboxed pages with restricted permissions for security',
      })
    }

    // Web accessible resources (indicates content script interaction)
    if (
      manifest.web_accessible_resources &&
      manifest.web_accessible_resources.length > 0
    ) {
      capabilityMap.set('web_resources', {
        capability: 'web_resources',
        description:
          'Web accessible resources for content script communication',
      })
    }

    // If no specific interfaces found, return manifest as fallback
    return capabilityMap.size > 0
      ? Array.from(capabilityMap.values())
      : [
          {
            capability: 'manifest',
            description: 'Basic extension manifest configuration',
          },
        ]
  } catch (error) {
    console.error('Error analyzing extension manifest:', error)
    return [
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration',
      },
    ]
  }
}
