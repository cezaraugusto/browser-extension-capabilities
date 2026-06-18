import type {ExtensionManifest} from './types'

export function isNonEmptyString (value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function hasNonEmptyString (arr: unknown): boolean {
  return Array.isArray(arr) && arr.some((v) => isNonEmptyString(v))
}

export function hasNonEmptyStringArray (value: unknown): value is string[] {
  return Array.isArray(value) && value.some((v) => isNonEmptyString(v))
}

export interface Detector {
  capability: string
  /** Normalized, manifest-aligned id (also used as the compatibility key). */
  id: string
  description: string
  fields: string[]
  detect: (m: ExtensionManifest) => boolean
}

export const DETECTORS: Detector[] = [
  {
    capability: 'background',
    id: 'background',
    description:
      'Background service worker or page for persistent functionality',
    fields: [
      'background.page',
      'background.scripts',
      'background.service_worker'
    ],
    detect: (m) =>
      !!m.background &&
      (isNonEmptyString(m.background.page) ||
        isNonEmptyString(m.background.service_worker) ||
        hasNonEmptyString(m.background.scripts))
  },
  {
    capability: 'content_scripts',
    id: 'content_scripts',
    description:
      'Content scripts that run on web pages to interact with page content',
    fields: ['content_scripts'],
    detect: (m) =>
      Array.isArray(m.content_scripts) && m.content_scripts.length > 0
  },
  {
    capability: 'user_scripts',
    id: 'user_scripts',
    description: 'Registration and execution of arbitrary user scripts',
    fields: ['user_scripts'],
    detect: (m) => !!m.user_scripts && typeof m.user_scripts === 'object'
  },
  {
    capability: 'popup',
    id: 'action_popup',
    description: 'Toolbar popup UI',
    fields: [
      'action.default_popup',
      'browser_action.default_popup',
      'page_action.default_popup'
    ],
    detect: (m) =>
      isNonEmptyString(m.action?.default_popup) ||
      isNonEmptyString(m.browser_action?.default_popup) ||
      isNonEmptyString(m.page_action?.default_popup)
  },
  {
    capability: 'side_panel',
    id: 'side_panel',
    description: 'Side panel UI (Chromium)',
    fields: ['side_panel.default_path'],
    detect: (m) => isNonEmptyString(m.side_panel?.default_path)
  },
  {
    capability: 'sidebar_action',
    id: 'sidebar_action',
    description: 'Sidebar UI (Firefox)',
    fields: ['sidebar_action.default_panel'],
    detect: (m) => isNonEmptyString(m.sidebar_action?.default_panel)
  },
  {
    capability: 'devtools',
    id: 'devtools_page',
    description: 'Developer tools panel',
    fields: ['devtools_page'],
    detect: (m) => isNonEmptyString(m.devtools_page)
  },
  {
    capability: 'options',
    id: 'options',
    description: 'Options page for user configuration',
    fields: ['options_ui.page', 'options_page'],
    detect: (m) =>
      isNonEmptyString(m.options_ui?.page) || isNonEmptyString(m.options_page)
  },
  {
    capability: 'newtab',
    id: 'chrome_url_overrides.newtab',
    description: 'New tab page override',
    fields: ['chrome_url_overrides.newtab'],
    detect: (m) => isNonEmptyString(m.chrome_url_overrides?.newtab)
  },
  {
    capability: 'bookmarks',
    id: 'chrome_url_overrides.bookmarks',
    description: 'Bookmarks page override',
    fields: ['chrome_url_overrides.bookmarks'],
    detect: (m) => isNonEmptyString(m.chrome_url_overrides?.bookmarks)
  },
  {
    capability: 'history',
    id: 'chrome_url_overrides.history',
    description: 'History page override',
    fields: ['chrome_url_overrides.history'],
    detect: (m) => isNonEmptyString(m.chrome_url_overrides?.history)
  },
  {
    capability: 'sandbox',
    id: 'sandbox',
    description: 'Sandboxed pages for isolated execution',
    fields: ['sandbox.pages'],
    detect: (m) => hasNonEmptyStringArray(m.sandbox?.pages)
  },
  {
    capability: 'web_resources',
    id: 'web_accessible_resources',
    description: 'Web-accessible resources exposed to web pages',
    fields: ['web_accessible_resources'],
    detect: (m) => {
      const war = m.web_accessible_resources

      return (
        Array.isArray(war) &&
        war.some(
          (item) =>
            (typeof item === 'string' && isNonEmptyString(item)) ||
            (typeof item === 'object' &&
              item !== null &&
              hasNonEmptyStringArray((item as {resources?: unknown}).resources))
        )
      )
    }
  },
  {
    capability: 'omnibox',
    id: 'omnibox',
    description: 'Omnibox keyword integration',
    fields: ['omnibox.keyword'],
    detect: (m) => isNonEmptyString(m.omnibox?.keyword)
  },
  {
    capability: 'commands',
    id: 'commands',
    description: 'Keyboard shortcuts and command actions',
    fields: ['commands'],
    detect: (m) => !!m.commands && Object.keys(m.commands).length > 0
  },
  {
    capability: 'settings_homepage',
    id: 'chrome_settings_overrides.homepage',
    description: 'Browser settings override: homepage',
    fields: ['chrome_settings_overrides.homepage'],
    detect: (m) => isNonEmptyString(m.chrome_settings_overrides?.homepage)
  },
  {
    capability: 'settings_search_provider',
    id: 'chrome_settings_overrides.search_provider',
    description: 'Browser settings override: search provider',
    fields: ['chrome_settings_overrides.search_provider'],
    detect: (m) => !!m.chrome_settings_overrides?.search_provider
  },
  {
    capability: 'settings_startup_pages',
    id: 'chrome_settings_overrides.startup_pages',
    description: 'Browser settings override: startup pages',
    fields: ['chrome_settings_overrides.startup_pages'],
    detect: (m) =>
      Array.isArray(m.chrome_settings_overrides?.startup_pages) &&
      m.chrome_settings_overrides!.startup_pages!.length > 0
  },
  {
    capability: 'declarative_net_request',
    id: 'declarative_net_request',
    description: 'Declarative network request rules',
    fields: ['declarative_net_request.rule_resources'],
    detect: (m) =>
      Array.isArray(m.declarative_net_request?.rule_resources) &&
      m.declarative_net_request!.rule_resources!.length > 0
  },
  {
    capability: 'tts_engine',
    id: 'tts_engine',
    description: 'Text-to-speech engine',
    fields: ['tts_engine.voices'],
    detect: (m) =>
      Array.isArray(m.tts_engine?.voices) && m.tts_engine!.voices!.length > 0
  },
  {
    capability: 'externally_connectable',
    id: 'externally_connectable',
    description: 'Messaging endpoint for web pages and other extensions',
    fields: ['externally_connectable.matches', 'externally_connectable.ids'],
    detect: (m) =>
      !!m.externally_connectable &&
      (hasNonEmptyStringArray(m.externally_connectable.matches) ||
        hasNonEmptyStringArray(m.externally_connectable.ids))
  },
  {
    capability: 'content_security_policy',
    id: 'content_security_policy',
    description: 'Custom Content Security Policy',
    fields: ['content_security_policy'],
    detect: (m) => {
      const csp = m.content_security_policy

      return (
        isNonEmptyString(csp) ||
        (typeof csp === 'object' &&
          csp !== null &&
          Object.values(csp).some((v) => isNonEmptyString(v)))
      )
    }
  },
  {
    capability: 'incognito',
    id: 'incognito',
    description: 'Declared incognito (private browsing) behavior',
    fields: ['incognito'],
    detect: (m) => isNonEmptyString(m.incognito)
  },
  {
    capability: 'managed_storage',
    id: 'storage.managed_schema',
    description: 'Managed storage schema for enterprise policy',
    fields: ['storage.managed_schema'],
    detect: (m) => isNonEmptyString(m.storage?.managed_schema)
  }
]
