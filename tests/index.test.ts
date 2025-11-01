import { expect, test, describe, beforeEach, afterEach } from 'vitest'
import {
  getExtensionCapabilities,
  analyzeExtensionManifest,
} from '../src/index'
import * as fs from 'fs'
import * as path from 'path'
import { vi } from 'vitest'

// Mock fs module
vi.mock('fs')
vi.mock('path')

describe('getExtensionCapabilities', () => {
  const mockFs = vi.mocked(fs)
  const mockPath = vi.mocked(path)

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock path.join to return a predictable path (no longer needed but keeping for compatibility)
    mockPath.join.mockReturnValue('/test/extension/manifest.json')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('should return background capability when background scripts are present', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      background: {
        service_worker: 'background.js',
      },
    }

    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(manifest))

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toContainEqual({
      capability: 'background',
      description:
        'Background service worker or page for persistent functionality',
    })
  })

  test('should return content_scripts capability when content scripts are present', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      content_scripts: [
        {
          matches: ['<all_urls>'],
          js: ['content.js'],
        },
      ],
    }

    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(manifest))

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toContainEqual({
      capability: 'content_scripts',
      description:
        'Content scripts that run on web pages to interact with page content',
    })
  })

  test('should return popup capability when action popup is present', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      action: {
        default_popup: 'popup.html',
      },
    }

    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(manifest))

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toContainEqual({
      capability: 'popup',
      description: 'Toolbar popup UI',
    })
  })

  test('should return sidebar capability when side panel is present', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      side_panel: {
        default_path: 'sidebar.html',
      },
    }

    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(manifest))

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toContainEqual({
      capability: 'sidebar',
      description: 'Side panel UI',
    })
  })

  test('should return devtools capability when devtools page is present', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      devtools_page: 'devtools.html',
    }

    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(manifest))

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toContainEqual({
      capability: 'devtools',
      description: 'Developer tools panel',
    })
  })

  test('should return options capability when options page is present', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      options_ui: {
        page: 'options.html',
      },
    }

    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(manifest))

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toContainEqual({
      capability: 'options',
      description: 'Options page for user configuration',
    })
  })

  test('should return newtab capability when newtab override is present', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      chrome_url_overrides: {
        newtab: 'newtab.html',
      },
    }

    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(manifest))

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toContainEqual({
      capability: 'newtab',
      description: 'New tab page override',
    })
  })

  test('should return sandbox capability when sandbox pages are present', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      sandbox: {
        pages: ['sandbox.html'],
      },
    }

    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(manifest))

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toContainEqual({
      capability: 'sandbox',
      description: 'Sandboxed pages for isolated execution',
    })
  })

  test('should return web_resources capability when web accessible resources are present', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      web_accessible_resources: [
        {
          resources: ['injected.js'],
          matches: ['<all_urls>'],
        },
      ],
    }

    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(manifest))

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toContainEqual({
      capability: 'web_resources',
      description: 'Web-accessible resources exposed to web pages',
    })
  })

  test('should return manifest capability when manifest file is not found', () => {
    mockFs.existsSync.mockReturnValue(false)

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toEqual([
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration',
      },
    ])
  })

  test('should return manifest capability when manifest JSON is invalid', () => {
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue('invalid json')

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toEqual([
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration',
      },
    ])
  })

  test('should return manifest capability when no specific capabilities are found', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
    }

    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(manifest))

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toEqual([
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration',
      },
    ])
  })

  test('should handle multiple capabilities in a single manifest', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      background: {
        service_worker: 'background.js',
      },
      content_scripts: [
        {
          matches: ['<all_urls>'],
          js: ['content.js'],
        },
      ],
      action: {
        default_popup: 'popup.html',
      },
    }

    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(manifest))

    const capabilities = getExtensionCapabilities(
      '/test/extension/manifest.json',
    )

    expect(capabilities).toHaveLength(3)
    expect(capabilities).toContainEqual({
      capability: 'background',
      description:
        'Background service worker or page for persistent functionality',
    })
    expect(capabilities).toContainEqual({
      capability: 'content_scripts',
      description:
        'Content scripts that run on web pages to interact with page content',
    })
    expect(capabilities).toContainEqual({
      capability: 'popup',
      description: 'Toolbar popup UI',
    })
  })

  test('should detect MV2 options_page and browser_action', () => {
    const manifest = {
      manifest_version: 2,
      name: 'Test Extension',
      version: '1.0.0',
      options_page: 'options.html',
      browser_action: { default_popup: 'popup.html' },
    }

    const capabilities = analyzeExtensionManifest(manifest as any)

    expect(capabilities).toEqual(
      expect.arrayContaining([
        {
          capability: 'options',
          description: 'Options page for user configuration',
        },
        { capability: 'popup', description: 'Toolbar popup UI' },
      ]),
    )
  })

  test('should detect MV2 web_accessible_resources as string array', () => {
    const manifest = {
      manifest_version: 2,
      name: 'Test Extension',
      version: '1.0.0',
      web_accessible_resources: ['a.js', 'b.css'],
    }

    const capabilities = analyzeExtensionManifest(manifest as any)
    expect(capabilities).toEqual(
      expect.arrayContaining([
        {
          capability: 'web_resources',
          description: 'Web-accessible resources exposed to web pages',
        },
      ]),
    )
  })

  test('should detect omnibox and commands capabilities', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      omnibox: { keyword: 'foo' },
      commands: { _execute_action: {} },
    }

    const capabilities = analyzeExtensionManifest(manifest as any)
    expect(capabilities).toEqual(
      expect.arrayContaining([
        { capability: 'omnibox', description: 'Omnibox keyword integration' },
        {
          capability: 'commands',
          description: 'Keyboard shortcuts and command actions',
        },
      ]),
    )
  })

  test('should detect settings overrides and declarative_net_request and tts_engine', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      chrome_settings_overrides: {
        homepage: 'https://example.com',
        search_provider: { name: 'Example' },
        startup_pages: ['https://a.com'],
      },
      declarative_net_request: {
        rule_resources: [{ id: 'rules', path: 'rules.json' }],
      },
      tts_engine: { voices: [{}] },
    }

    const capabilities = analyzeExtensionManifest(manifest as any)
    expect(capabilities).toEqual(
      expect.arrayContaining([
        {
          capability: 'settings_homepage',
          description: 'Browser settings override: homepage',
        },
        {
          capability: 'settings_search_provider',
          description: 'Browser settings override: search provider',
        },
        {
          capability: 'settings_startup_pages',
          description: 'Browser settings override: startup pages',
        },
        {
          capability: 'declarative_net_request',
          description: 'Declarative network request rules',
        },
        { capability: 'tts_engine', description: 'Text-to-speech engine' },
      ]),
    )
  })

  test('should include fields and normalized id when options are enabled', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      action: { default_popup: 'popup.html' },
    }

    const capabilities = analyzeExtensionManifest(manifest as any, {
      includeFields: true,
      normalizeNames: true,
    })

    const popup = capabilities.find((c) => c.capability === 'popup')!
    expect(popup.id).toBeDefined()
    expect(Array.isArray(popup.fields)).toBe(true)
    expect(popup.fields!.length).toBeGreaterThan(0)
  })

  test('should expose compatibility metadata when enabled', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      action: { default_popup: 'popup.html' },
    }

    const capabilities = analyzeExtensionManifest(manifest as any, {
      includeCompatibility: true,
      normalizeNames: true,
    })

    const popup = capabilities.find((c) => c.capability === 'popup')!
    expect(popup.compatibility).toBeDefined()
    expect(popup.compatibility?.safari).toBe(true)
  })

  test('should ignore whitespace-only string fields in detection', () => {
    const manifest = {
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      action: { default_popup: '   ' },
      devtools_page: '  ',
      options_ui: { page: '   ' },
      side_panel: { default_path: '  ' },
      sidebar_action: { default_panel: '   ' },
      chrome_url_overrides: { newtab: '  ', bookmarks: ' ', history: ' ' },
      background: { page: '  ', service_worker: ' ', scripts: ['   '] },
      web_accessible_resources: ['   '],
    }

    const capabilities = analyzeExtensionManifest(manifest as any)

    // Should fall back to manifest only, because nothing valid should be detected
    expect(capabilities).toEqual([
      {
        capability: 'manifest',
        description: 'Basic extension manifest configuration',
      },
    ])
  })
})
