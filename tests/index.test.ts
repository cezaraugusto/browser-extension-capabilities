import { expect, test, describe, beforeEach, afterEach } from 'vitest'
import { getExtensionCapabilities } from '../src/index'
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
    // Mock path.join to return a predictable path
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

    const capabilities = getExtensionCapabilities('/test/extension')

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

    const capabilities = getExtensionCapabilities('/test/extension')

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

    const capabilities = getExtensionCapabilities('/test/extension')

    expect(capabilities).toContainEqual({
      capability: 'popup',
      description: 'Browser action popup or toolbar button functionality',
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

    const capabilities = getExtensionCapabilities('/test/extension')

    expect(capabilities).toContainEqual({
      capability: 'sidebar',
      description: 'Side panel interface for additional extension features',
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

    const capabilities = getExtensionCapabilities('/test/extension')

    expect(capabilities).toContainEqual({
      capability: 'devtools',
      description: 'Developer tools panel for debugging and development',
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

    const capabilities = getExtensionCapabilities('/test/extension')

    expect(capabilities).toContainEqual({
      capability: 'options',
      description: 'Extension options page for user configuration',
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

    const capabilities = getExtensionCapabilities('/test/extension')

    expect(capabilities).toContainEqual({
      capability: 'newtab',
      description: 'Custom new tab page replacement',
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

    const capabilities = getExtensionCapabilities('/test/extension')

    expect(capabilities).toContainEqual({
      capability: 'sandbox',
      description: 'Sandboxed pages with restricted permissions for security',
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

    const capabilities = getExtensionCapabilities('/test/extension')

    expect(capabilities).toContainEqual({
      capability: 'web_resources',
      description: 'Web accessible resources for content script communication',
    })
  })

  test('should return manifest capability when manifest file is not found', () => {
    mockFs.existsSync.mockReturnValue(false)

    const capabilities = getExtensionCapabilities('/test/extension')

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

    const capabilities = getExtensionCapabilities('/test/extension')

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

    const capabilities = getExtensionCapabilities('/test/extension')

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

    const capabilities = getExtensionCapabilities('/test/extension')

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
      description: 'Browser action popup or toolbar button functionality',
    })
  })
})
