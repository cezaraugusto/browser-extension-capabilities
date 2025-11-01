import * as fs from 'fs'

export interface ExtensionManifest {
  manifest_version: number
  name: string
  version: string
  description?: string

  // MV3/MV2 action UIs
  action?: {
    default_popup?: string
    default_title?: string
    default_icon?: string | Record<string, string>
  }
  browser_action?: {
    default_popup?: string
    default_title?: string
    default_icon?: string | Record<string, string>
  }
  page_action?: {
    default_popup?: string
    default_title?: string
    default_icon?: string | Record<string, string>
  }

  // Background
  background?: {
    page?: string
    scripts?: string[]
    service_worker?: string
  }

  // Content
  content_scripts?: Array<{
    matches: string[]
    js?: string[]
    css?: string[]
    run_at?: string
  }>

  // DevTools
  devtools_page?: string

  // Options
  options_ui?: {
    page: string
    open_in_tab?: boolean
  }
  options_page?: string // MV2

  // Sidebar/Side panel
  side_panel?: {
    default_path: string
    default_title?: string
  }
  sidebar_action?: {
    default_panel?: string
    default_title?: string
  }

  // Chrome URL overrides
  chrome_url_overrides?: {
    newtab?: string
    bookmarks?: string
    history?: string
  }

  // Sandbox
  sandbox?: {
    pages: string[]
  }

  // Web-accessible resources (MV2 + MV3)
  web_accessible_resources?: Array<
    | string
    | {
        resources: string[]
        matches?: string[]
        extension_ids?: string[]
        use_dynamic_url?: boolean
      }
  >

  // Common additional capabilities
  omnibox?: { keyword: string }
  commands?: Record<string, unknown>
  chrome_settings_overrides?: {
    homepage?: string
    search_provider?: Record<string, unknown>
    startup_pages?: string[]
  }
  declarative_net_request?: {
    rule_resources?: Array<{ id: string; enabled?: boolean; path: string }>
  }
  tts_engine?: {
    voices?: Array<Record<string, unknown>>
  }

  // Permissions/context (intentionally not used as “capabilities” here)
  permissions?: string[]
  host_permissions?: string[]
}

export interface ExtensionCapability {
  capability: string
  description: string
  id?: string
  fields?: string[]
  compatibility?: CapabilityCompatibility
}

export interface GetCapabilitiesOptions {
  strict?: boolean
  includeFields?: boolean
  normalizeNames?: boolean
  includeCompatibility?: boolean
}

export interface CapabilityCompatibility {
  safari?: boolean
  notes?: string
  docs?: string
}

const CAP_COMPAT: Record<string, CapabilityCompatibility> = {
  background: { safari: true },
  content_scripts: { safari: true },
  popup: { safari: true },
  action_popup: { safari: true },
  sidebar: {
    safari: false,
    notes:
      'Chromium uses side_panel; Firefox uses sidebar_action. Safari does not provide an equivalent sidebar UI API.',
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/user_interface',
  },
  devtools_page: { safari: true },
  options: { safari: true },
  web_accessible_resources: { safari: true },
  commands: { safari: true },
  omnibox: {
    safari: false,
    notes: 'Safari does not support Omnibox keyword for WebExtensions.',
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/omnibox',
  },
  'chrome_url_overrides.newtab': {
    safari: false,
    notes: 'Safari does not support chrome_url_overrides.',
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides',
  },
  'chrome_url_overrides.bookmarks': {
    safari: false,
    notes:
      'Safari does not support bookmarks/history overrides via chrome_url_overrides.',
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides',
  },
  'chrome_url_overrides.history': {
    safari: false,
    notes:
      'Safari does not support bookmarks/history overrides via chrome_url_overrides.',
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides',
  },
  declarative_net_request: {
    safari: false,
    notes:
      'Safari uses a different content blocking model; DNR is not supported.',
    docs: 'https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/',
  },
  tts_engine: {
    safari: false,
    notes: 'Speech engine APIs are not available for Safari WebExtensions.',
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/tts_engine',
  },
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function hasNonEmptyString(arr: unknown): boolean {
  return Array.isArray(arr) && arr.some((v) => isNonEmptyString(v))
}

function pushCapability(
  map: Map<string, ExtensionCapability>,
  key: string,
  description: string,
  opts?: GetCapabilitiesOptions,
  fields?: string[],
  normalizedId?: string,
) {
  const entry: ExtensionCapability = {
    capability: key,
    description,
  }
  if (opts?.includeFields && fields?.length) entry.fields = fields
  if (opts?.normalizeNames && normalizedId) entry.id = normalizedId
  if (opts?.includeCompatibility) {
    const compatKey = normalizedId ?? key
    const compat = CAP_COMPAT[compatKey]
    if (compat) entry.compatibility = compat
  }
  map.set(key, entry)
}

export function analyzeExtensionManifest(
  manifest: ExtensionManifest,
  options?: GetCapabilitiesOptions,
): ExtensionCapability[] {
  const capabilityMap = new Map<string, ExtensionCapability>()
  const opts = options ?? {}

  // Background
  if (manifest.background) {
    const hasBg =
      isNonEmptyString(manifest.background.page) ||
      isNonEmptyString(manifest.background.service_worker) ||
      hasNonEmptyString(manifest.background.scripts)

    if (hasBg) {
      pushCapability(
        capabilityMap,
        'background',
        'Background service worker or page for persistent functionality',
        opts,
        ['background.page', 'background.scripts', 'background.service_worker'],
        'background',
      )
    }
  }

  // Content scripts
  if (
    Array.isArray(manifest.content_scripts) &&
    manifest.content_scripts.length
  ) {
    pushCapability(
      capabilityMap,
      'content_scripts',
      'Content scripts that run on web pages to interact with page content',
      opts,
      ['content_scripts'],
      'content_scripts',
    )
  }

  // Popup (action, browser_action, page_action)
  if (
    isNonEmptyString(manifest.action?.default_popup) ||
    isNonEmptyString(manifest.browser_action?.default_popup) ||
    isNonEmptyString(manifest.page_action?.default_popup)
  ) {
    pushCapability(
      capabilityMap,
      'popup',
      'Toolbar popup UI',
      opts,
      [
        'action.default_popup',
        'browser_action.default_popup',
        'page_action.default_popup',
      ],
      'action_popup',
    )
  }

  // Sidebar / Side panel
  if (
    isNonEmptyString(manifest.side_panel?.default_path) ||
    isNonEmptyString(manifest.sidebar_action?.default_panel)
  ) {
    pushCapability(
      capabilityMap,
      'sidebar',
      'Side panel UI',
      opts,
      ['side_panel.default_path', 'sidebar_action.default_panel'],
      'sidebar',
    )
  }

  // DevTools
  if (isNonEmptyString(manifest.devtools_page)) {
    pushCapability(
      capabilityMap,
      'devtools',
      'Developer tools panel',
      opts,
      ['devtools_page'],
      'devtools_page',
    )
  }

  // Options (options_ui.page or options_page)
  if (
    isNonEmptyString(manifest.options_ui?.page) ||
    isNonEmptyString(manifest.options_page)
  ) {
    pushCapability(
      capabilityMap,
      'options',
      'Options page for user configuration',
      opts,
      ['options_ui.page', 'options_page'],
      'options',
    )
  }

  // Chrome URL overrides
  if (manifest.chrome_url_overrides) {
    if (isNonEmptyString(manifest.chrome_url_overrides.newtab)) {
      pushCapability(
        capabilityMap,
        'newtab',
        'New tab page override',
        opts,
        ['chrome_url_overrides.newtab'],
        'chrome_url_overrides.newtab',
      )
    }
    if (isNonEmptyString(manifest.chrome_url_overrides.bookmarks)) {
      pushCapability(
        capabilityMap,
        'bookmarks',
        'Bookmarks page override',
        opts,
        ['chrome_url_overrides.bookmarks'],
        'chrome_url_overrides.bookmarks',
      )
    }
    if (isNonEmptyString(manifest.chrome_url_overrides.history)) {
      pushCapability(
        capabilityMap,
        'history',
        'History page override',
        opts,
        ['chrome_url_overrides.history'],
        'chrome_url_overrides.history',
      )
    }
  }

  // Sandbox
  if (
    Array.isArray(manifest.sandbox?.pages) &&
    manifest.sandbox!.pages!.some((p) => isNonEmptyString(p))
  ) {
    pushCapability(
      capabilityMap,
      'sandbox',
      'Sandboxed pages for isolated execution',
      opts,
      ['sandbox.pages'],
      'sandbox',
    )
  }

  // Web-accessible resources (MV2 + MV3)
  const war = manifest.web_accessible_resources
  const hasWAR =
    Array.isArray(war) &&
    war.length > 0 &&
    war.some(
      (item) =>
        (typeof item === 'string' && isNonEmptyString(item)) ||
        (typeof item === 'object' &&
          item &&
          Array.isArray((item as any).resources) &&
          (item as any).resources.some((r: unknown) => isNonEmptyString(r))),
    )
  if (hasWAR) {
    pushCapability(
      capabilityMap,
      'web_resources',
      'Web-accessible resources exposed to web pages',
      opts,
      ['web_accessible_resources'],
      'web_accessible_resources',
    )
  }

  // Omnibox
  if (manifest.omnibox?.keyword) {
    pushCapability(
      capabilityMap,
      'omnibox',
      'Omnibox keyword integration',
      opts,
      ['omnibox.keyword'],
      'omnibox',
    )
  }

  // Commands
  if (manifest.commands && Object.keys(manifest.commands).length > 0) {
    pushCapability(
      capabilityMap,
      'commands',
      'Keyboard shortcuts and command actions',
      opts,
      ['commands'],
      'commands',
    )
  }

  // Settings overrides
  if (manifest.chrome_settings_overrides) {
    if (manifest.chrome_settings_overrides.homepage) {
      pushCapability(
        capabilityMap,
        'settings_homepage',
        'Browser settings override: homepage',
        opts,
        ['chrome_settings_overrides.homepage'],
        'chrome_settings_overrides.homepage',
      )
    }
    if (manifest.chrome_settings_overrides.search_provider) {
      pushCapability(
        capabilityMap,
        'settings_search_provider',
        'Browser settings override: search provider',
        opts,
        ['chrome_settings_overrides.search_provider'],
        'chrome_settings_overrides.search_provider',
      )
    }
    if (
      Array.isArray(manifest.chrome_settings_overrides.startup_pages) &&
      manifest.chrome_settings_overrides.startup_pages.length > 0
    ) {
      pushCapability(
        capabilityMap,
        'settings_startup_pages',
        'Browser settings override: startup pages',
        opts,
        ['chrome_settings_overrides.startup_pages'],
        'chrome_settings_overrides.startup_pages',
      )
    }
  }

  // Declarative Net Request (MV3)
  if (
    manifest.declarative_net_request?.rule_resources &&
    manifest.declarative_net_request.rule_resources.length > 0
  ) {
    pushCapability(
      capabilityMap,
      'declarative_net_request',
      'Declarative network request rules',
      opts,
      ['declarative_net_request.rule_resources'],
      'declarative_net_request',
    )
  }

  // TTS Engine
  if (
    Array.isArray(manifest.tts_engine?.voices) &&
    manifest.tts_engine!.voices!.length > 0
  ) {
    pushCapability(
      capabilityMap,
      'tts_engine',
      'Text-to-speech engine',
      opts,
      ['tts_engine.voices'],
      'tts_engine',
    )
  }

  return capabilityMap.size > 0
    ? Array.from(capabilityMap.values()).sort((a, b) => {
        const ak = (a.id ?? a.capability).toLowerCase()
        const bk = (b.id ?? b.capability).toLowerCase()
        return ak.localeCompare(bk)
      })
    : [
        {
          capability: 'manifest',
          description: 'Basic extension manifest configuration',
          ...(opts.normalizeNames ? { id: 'manifest' } : {}),
          ...(opts.includeFields ? { fields: [] } : {}),
        },
      ]
}

export function getExtensionCapabilities(
  manifestPath: string,
  options?: GetCapabilitiesOptions,
): ExtensionCapability[] {
  try {
    if (!fs.existsSync(manifestPath)) {
      if (options?.strict)
        throw new Error(`Manifest file not found at: ${manifestPath}`)
      console.warn(`Manifest file not found at: ${manifestPath}`)
      return [
        {
          capability: 'manifest',
          description: 'Basic extension manifest configuration',
          ...(options?.normalizeNames ? { id: 'manifest' } : {}),
          ...(options?.includeFields ? { fields: [] } : {}),
        },
      ]
    }
    const manifestContent = fs.readFileSync(manifestPath, 'utf8')
    const manifest = JSON.parse(manifestContent) as ExtensionManifest
    return analyzeExtensionManifest(manifest, options)
  } catch (error) {
    if (options?.strict) throw error
    console.error('Error analyzing extension manifest:', error)
    return [
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration',
        ...(options?.normalizeNames ? { id: 'manifest' } : {}),
        ...(options?.includeFields ? { fields: [] } : {}),
      },
    ]
  }
}

export async function getExtensionCapabilitiesAsync(
  manifestPath: string,
  options?: GetCapabilitiesOptions,
): Promise<ExtensionCapability[]> {
  try {
    await fs.promises.access(manifestPath, fs.constants.F_OK)
  } catch {
    if (options?.strict)
      throw new Error(`Manifest file not found at: ${manifestPath}`)
    console.warn(`Manifest file not found at: ${manifestPath}`)
    return [
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration',
        ...(options?.normalizeNames ? { id: 'manifest' } : {}),
        ...(options?.includeFields ? { fields: [] } : {}),
      },
    ]
  }

  try {
    const manifestContent = await fs.promises.readFile(manifestPath, 'utf8')
    const manifest = JSON.parse(manifestContent) as ExtensionManifest
    return analyzeExtensionManifest(manifest, options)
  } catch (error) {
    if (options?.strict) throw error
    console.error('Error analyzing extension manifest:', error)
    return [
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration',
        ...(options?.normalizeNames ? { id: 'manifest' } : {}),
        ...(options?.includeFields ? { fields: [] } : {}),
      },
    ]
  }
}
