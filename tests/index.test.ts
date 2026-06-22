import * as fs from 'fs'

import {expect, it, describe, beforeEach, afterEach, vi} from 'vitest'

import {
  getExtensionCapabilities,
  getExtensionCapabilitiesAsync,
  analyzeExtensionManifest,
  analyzeExtension
} from '../src/index'

vi.mock('fs')

const mockFs = vi.mocked(fs)

function mockFile (content: string): void {
  mockFs.existsSync.mockReturnValue(true)
  mockFs.readFileSync.mockReturnValue(content)
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('analyzeExtensionManifest: detection', () => {
  it('detects background from service_worker', () => {
    const caps = analyzeExtensionManifest({
      manifest_version: 3,
      name: 'x',
      version: '1',
      background: {service_worker: 'bg.js'}
    })

    expect(caps).toContainEqual({
      capability: 'background',
      description:
        'Background service worker or page for persistent functionality'
    })
  })

  it('detects content_scripts', () => {
    const caps = analyzeExtensionManifest({
      manifest_version: 3,
      name: 'x',
      version: '1',
      content_scripts: [{matches: ['<all_urls>'], js: ['c.js']}]
    })

    expect(caps.some((c) => c.capability === 'content_scripts')).toBe(true)
  })

  it('detects popup from action/browser_action/page_action', () => {
    expect(
      analyzeExtensionManifest({
        manifest_version: 3,
        name: 'x',
        version: '1',
        action: {default_popup: 'p.html'}
      }).some((c) => c.capability === 'popup')
    ).toBe(true)

    expect(
      analyzeExtensionManifest({
        manifest_version: 2,
        name: 'x',
        version: '1',
        browser_action: {default_popup: 'p.html'}
      } as never).some((c) => c.capability === 'popup')
    ).toBe(true)
  })

  it('splits side_panel (Chromium) and sidebar_action (Firefox)', () => {
    const sidePanel = analyzeExtensionManifest({
      manifest_version: 3,
      name: 'x',
      version: '1',
      side_panel: {default_path: 'panel.html'}
    })

    expect(sidePanel.some((c) => c.capability === 'side_panel')).toBe(true)
    expect(sidePanel.some((c) => c.capability === 'sidebar_action')).toBe(false)

    const firefox = analyzeExtensionManifest({
      manifest_version: 2,
      name: 'x',
      version: '1',
      sidebar_action: {default_panel: 'panel.html'}
    } as never)

    expect(firefox.some((c) => c.capability === 'sidebar_action')).toBe(true)
    expect(firefox.some((c) => c.capability === 'side_panel')).toBe(false)
  })

  it('detects newly-added capabilities', () => {
    const caps = analyzeExtensionManifest({
      manifest_version: 3,
      name: 'x',
      version: '1',
      user_scripts: {},
      externally_connectable: {matches: ['https://example.com/*']},
      content_security_policy: {extension_pages: "script-src 'self'"},
      incognito: 'split',
      storage: {managed_schema: 'schema.json'}
    } as never)

    const keys = caps.map((c) => c.capability)

    expect(keys).toContain('user_scripts')
    expect(keys).toContain('externally_connectable')
    expect(keys).toContain('content_security_policy')
    expect(keys).toContain('incognito')
    expect(keys).toContain('managed_storage')
  })

  it('detects MV2 options_page and string-array web_accessible_resources', () => {
    const caps = analyzeExtensionManifest({
      manifest_version: 2,
      name: 'x',
      version: '1',
      options_page: 'o.html',
      web_accessible_resources: ['a.js', 'b.css']
    } as never)

    const keys = caps.map((c) => c.capability)

    expect(keys).toContain('options')
    expect(keys).toContain('web_resources')
  })

  it('detects settings overrides, DNR, omnibox, commands, tts', () => {
    const caps = analyzeExtensionManifest({
      manifest_version: 3,
      name: 'x',
      version: '1',
      omnibox: {keyword: 'foo'},
      commands: {_execute_action: {}},
      chrome_settings_overrides: {
        homepage: 'https://e.com',
        search_provider: {name: 'E'},
        startup_pages: ['https://a.com']
      },
      declarative_net_request: {rule_resources: [{id: 'r', path: 'r.json'}]},
      tts_engine: {voices: [{}]}
    })

    const keys = caps.map((c) => c.capability)

    expect(keys).toEqual(
      expect.arrayContaining([
        'omnibox',
        'commands',
        'settings_homepage',
        'settings_search_provider',
        'settings_startup_pages',
        'declarative_net_request',
        'tts_engine'
      ])
    )
  })

  it('ignores whitespace-only fields and falls back to manifest', () => {
    const caps = analyzeExtensionManifest({
      manifest_version: 3,
      name: 'x',
      version: '1',
      action: {default_popup: '   '},
      devtools_page: '  ',
      options_ui: {page: '   '},
      side_panel: {default_path: '  '},
      sidebar_action: {default_panel: '   '},
      chrome_url_overrides: {newtab: '  ', bookmarks: ' ', history: ' '},
      background: {page: '  ', service_worker: ' ', scripts: ['   ']},
      web_accessible_resources: ['   ']
    } as never)

    expect(caps).toEqual([
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration'
      }
    ])
  })

  it('returns results sorted by id/capability', () => {
    const caps = analyzeExtensionManifest({
      manifest_version: 3,
      name: 'x',
      version: '1',
      omnibox: {keyword: 'z'},
      action: {default_popup: 'p.html'},
      background: {service_worker: 'b.js'}
    })

    const labels = caps.map((c) => c.id ?? c.capability)

    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)))
  })
})

describe('options', () => {
  it('includes fields and normalized id when enabled', () => {
    const popup = analyzeExtensionManifest(
      {manifest_version: 3, name: 'x', version: '1', action: {default_popup: 'p.html'}},
      {includeFields: true, normalizeNames: true}
    ).find((c) => c.capability === 'popup')!

    expect(popup.id).toBe('action_popup')
    expect(popup.fields!.length).toBeGreaterThan(0)
  })

  it('exposes multi-browser compatibility metadata', () => {
    const sidePanel = analyzeExtensionManifest(
      {manifest_version: 3, name: 'x', version: '1', side_panel: {default_path: 's.html'}},
      {includeCompatibility: true}
    ).find((c) => c.capability === 'side_panel')!

    expect(sidePanel.compatibility).toMatchObject({
      chrome: true,
      firefox: false,
      safari: false
    })
  })

  it('compatibility works without normalizeNames', () => {
    const newtab = analyzeExtensionManifest(
      {
        manifest_version: 3,
        name: 'x',
        version: '1',
        chrome_url_overrides: {newtab: 'n.html'}
      },
      {includeCompatibility: true}
    ).find((c) => c.capability === 'newtab')!

    expect(newtab.compatibility?.chrome).toBe(true)
    expect(newtab.id).toBeUndefined()
  })
})

describe('permissions (opt-in)', () => {
  const manifest = {
    manifest_version: 3,
    name: 'x',
    version: '1',
    permissions: ['storage', 'nativeMessaging', 'someFuturePermission'],
    optional_permissions: ['tabs'],
    host_permissions: ['https://*/*'],
    optional_host_permissions: ['https://opt.example.com/*']
  }

  it('is off by default', () => {
    const caps = analyzeExtensionManifest(manifest as never)

    expect(caps.some((c) => c.capability === 'storage')).toBe(false)
    expect(caps.some((c) => c.capability === 'host_permissions')).toBe(false)
  })

  it('surfaces permissions and host access when enabled', () => {
    const caps = analyzeExtensionManifest(manifest as never, {
      includePermissions: true,
      normalizeNames: true
    })

    const storage = caps.find((c) => c.capability === 'storage')!

    expect(storage.description).toBe('Persist data in extension storage')
    expect(storage.id).toBe('permissions.storage')

    const future = caps.find((c) => c.capability === 'someFuturePermission')!

    expect(future.description).toBe('API permission: someFuturePermission')

    const optTabs = caps.find((c) => c.capability === 'tabs')!

    expect(optTabs.optional).toBe(true)

    const hosts = caps.find((c) => c.capability === 'host_permissions')!

    expect(hosts.fields).toEqual(['https://*/*'])

    const optHosts = caps.find(
      (c) => c.capability === 'optional_host_permissions'
    )!

    expect(optHosts.optional).toBe(true)
  })
})

describe('analyzeExtension: metadata', () => {
  it('returns manifest version, name, and capabilities', () => {
    const result = analyzeExtension({
      manifest_version: 3,
      name: 'My Extension',
      version: '1',
      action: {default_popup: 'p.html'}
    })

    expect(result.manifestVersion).toBe(3)
    expect(result.name).toBe('My Extension')
    expect(result.capabilities.some((c) => c.capability === 'popup')).toBe(true)
  })
})

describe('error semantics', () => {
  it('throws on a non-object manifest by default', () => {
    expect(() => analyzeExtensionManifest(null as never)).toThrow(TypeError)
    expect(() => analyzeExtensionManifest(42 as never)).toThrow(TypeError)
    expect(() => analyzeExtensionManifest([] as never)).toThrow(TypeError)
  })

  it('returns the fallback for a non-object manifest when strict:false', () => {
    expect(analyzeExtensionManifest(null as never, {strict: false})).toEqual([
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration'
      }
    ])
  })

  it('getExtensionCapabilities throws on missing file by default', () => {
    mockFs.existsSync.mockReturnValue(false)
    expect(() => getExtensionCapabilities('/nope.json')).toThrow(
      /not found/
    )
  })

  it('getExtensionCapabilities returns fallback on missing file when strict:false', () => {
    mockFs.existsSync.mockReturnValue(false)
    expect(getExtensionCapabilities('/nope.json', {strict: false})).toEqual([
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration'
      }
    ])
  })

  it('getExtensionCapabilities throws SyntaxError on invalid JSON by default', () => {
    mockFile('not json')
    expect(() => getExtensionCapabilities('/m.json')).toThrow(SyntaxError)
  })

  it('getExtensionCapabilities returns fallback on invalid JSON when strict:false', () => {
    mockFile('not json')
    expect(getExtensionCapabilities('/m.json', {strict: false})).toEqual([
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration'
      }
    ])
  })

  it('reads and analyzes a valid manifest from disk', () => {
    mockFile(
      JSON.stringify({
        manifest_version: 3,
        name: 'x',
        version: '1',
        background: {service_worker: 'b.js'}
      })
    )
    const caps = getExtensionCapabilities('/m.json')

    expect(caps.some((c) => c.capability === 'background')).toBe(true)
  })
})

describe('async variant', () => {
  it('analyzes a valid manifest', async () => {
    mockFs.promises = {
      access: vi.fn().mockResolvedValue(undefined),
      readFile: vi.fn().mockResolvedValue(
        JSON.stringify({
          manifest_version: 3,
          name: 'x',
          version: '1',
          action: {default_popup: 'p.html'}
        })
      )
    } as never

    const caps = await getExtensionCapabilitiesAsync('/m.json')

    expect(caps.some((c) => c.capability === 'popup')).toBe(true)
  })

  it('throws on missing file by default', async () => {
    mockFs.promises = {
      access: vi.fn().mockRejectedValue(new Error('ENOENT'))
    } as never

    await expect(getExtensionCapabilitiesAsync('/nope.json')).rejects.toThrow(
      /not found/
    )
  })

  it('returns fallback on missing file when strict:false', async () => {
    mockFs.promises = {
      access: vi.fn().mockRejectedValue(new Error('ENOENT'))
    } as never

    await expect(
      getExtensionCapabilitiesAsync('/nope.json', {strict: false})
    ).resolves.toEqual([
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration'
      }
    ])
  })
})
