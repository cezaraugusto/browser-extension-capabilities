// Cross-browser compatibility is generated from `browser-extension-compat-data`
// (MDN browser-compat-data). Regenerate with: pnpm data:build-compat
export {CAP_COMPAT} from './generated/compat'

/** Short descriptions for notable API permissions (security-relevant first). */
export const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  nativeMessaging: 'Communicate with native host applications',
  webRequest: 'Observe and analyze network traffic',
  webRequestBlocking: 'Block or modify network requests synchronously',
  declarativeNetRequest: 'Block or modify requests via declarative rules',
  declarativeNetRequestWithHostAccess:
    'Declarative request rules with host access',
  scripting: 'Inject and execute scripts at runtime',
  userScripts: 'Register and run arbitrary user scripts',
  tabs: 'Access privileged tab properties (URL, title, favicon)',
  cookies: 'Read and modify browser cookies',
  history: 'Read and modify the browsing history',
  bookmarks: 'Read and modify bookmarks',
  downloads: 'Manage the browser download list',
  management: 'Manage other installed extensions',
  debugger: 'Attach to the Chrome DevTools Protocol',
  proxy: 'Control browser proxy settings',
  privacy: 'Read and modify privacy-related settings',
  clipboardRead: 'Read data from the clipboard',
  clipboardWrite: 'Write data to the clipboard',
  geolocation: 'Access the user location',
  notifications: 'Create system notifications',
  storage: 'Persist data in extension storage',
  unlimitedStorage: 'Use storage without quota limits',
  alarms: 'Schedule code to run periodically',
  contextMenus: 'Add items to the browser context menu',
  identity: 'Obtain OAuth2 tokens and user identity',
  webNavigation: 'Observe navigation events across tabs',
  '<all_urls>': 'Host access to every site'
}
