/* eslint-disable @stylistic/max-len */
// AUTO-GENERATED — do not edit by hand.
// Source: browser-extension-compat-data@0.1.0 (MDN browser-compat-data).
// Regenerate with: pnpm data:build-compat
import type {CapabilityCompatibility} from '../types'

export const CAP_COMPAT: Record<string, CapabilityCompatibility> = {
  action_popup: {
    chrome: true,
    edge: true,
    firefox: true,
    safari: true,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action'
  },
  background: {
    chrome: true,
    edge: true,
    firefox: true,
    safari: true,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background'
  },
  'chrome_settings_overrides.homepage': {
    chrome: true,
    edge: true,
    firefox: true,
    safari: false,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_settings_overrides'
  },
  'chrome_settings_overrides.search_provider': {
    chrome: true,
    edge: true,
    firefox: true,
    safari: false,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_settings_overrides'
  },
  'chrome_settings_overrides.startup_pages': {
    chrome: true,
    edge: true,
    firefox: false,
    safari: false,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_settings_overrides'
  },
  'chrome_url_overrides.bookmarks': {
    chrome: true,
    edge: true,
    firefox: false,
    safari: false,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides'
  },
  'chrome_url_overrides.history': {
    chrome: true,
    edge: true,
    firefox: false,
    safari: false,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides'
  },
  'chrome_url_overrides.newtab': {
    chrome: true,
    edge: true,
    firefox: true,
    safari: true,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides'
  },
  commands: {
    chrome: true,
    edge: true,
    firefox: true,
    safari: true,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands'
  },
  content_scripts: {
    chrome: true,
    edge: true,
    firefox: true,
    safari: true,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts'
  },
  content_security_policy: {
    chrome: true,
    edge: true,
    firefox: true,
    safari: true,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_security_policy'
  },
  declarative_net_request: {
    chrome: true,
    edge: true,
    firefox: true,
    safari: true,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/declarative_net_request'
  },
  devtools_page: {
    chrome: true,
    edge: true,
    firefox: true,
    safari: true,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/devtools_page'
  },
  externally_connectable: {
    chrome: true,
    edge: true,
    firefox: false,
    safari: true,
    notes: 'Partial support in Safari.',
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/externally_connectable'
  },
  incognito: {
    chrome: true,
    edge: true,
    firefox: true,
    safari: true,
    notes: 'Partial support in Safari.',
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/incognito'
  },
  omnibox: {
    chrome: true,
    edge: true,
    firefox: true,
    safari: false,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/omnibox'
  },
  options: {
    chrome: true,
    edge: true,
    firefox: true,
    safari: true,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/options_ui'
  },
  sandbox: {
    chrome: true,
    edge: true,
    firefox: false,
    safari: false,
    notes: 'Not tracked by MDN browser-compat-data; best-effort. Sandboxed pages are Chromium-only.'
  },
  side_panel: {
    chrome: true,
    edge: true,
    firefox: false,
    safari: false,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/side_panel'
  },
  sidebar_action: {
    chrome: false,
    edge: false,
    firefox: true,
    safari: false,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/sidebar_action'
  },
  'storage.managed_schema': {
    chrome: true,
    edge: true,
    firefox: false,
    safari: false,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/storage'
  },
  tts_engine: {
    chrome: true,
    edge: true,
    firefox: false,
    safari: false,
    notes: 'Not tracked by MDN browser-compat-data; best-effort. TTS engine registration is Chromium-only.'
  },
  user_scripts: {
    chrome: false,
    edge: false,
    firefox: true,
    safari: false,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/user_scripts'
  },
  web_accessible_resources: {
    chrome: true,
    edge: true,
    firefox: true,
    safari: true,
    docs: 'https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/web_accessible_resources'
  }
}
