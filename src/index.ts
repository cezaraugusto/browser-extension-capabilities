import * as fs from 'fs'

import {CAP_COMPAT, PERMISSION_DESCRIPTIONS} from './data'
import {DETECTORS, hasNonEmptyStringArray, isNonEmptyString} from './detectors'

import type {
  ExtensionAnalysis,
  ExtensionCapability,
  ExtensionManifest,
  GetCapabilitiesOptions
} from './types'

export type {
  CapabilityCompatibility,
  ExtensionAnalysis,
  ExtensionCapability,
  ExtensionManifest,
  GetCapabilitiesOptions
} from './types'

function makeEntry (
  capability: string,
  description: string,
  opts: GetCapabilitiesOptions,
  fields?: string[],
  normalizedId?: string,
  compatKey?: string,
  optional?: boolean
): ExtensionCapability {
  const entry: ExtensionCapability = {capability, description}

  if (opts.includeFields && fields?.length) entry.fields = fields

  if (opts.normalizeNames && normalizedId) entry.id = normalizedId

  if (optional) entry.optional = true

  if (opts.includeCompatibility) {
    const compat = CAP_COMPAT[compatKey ?? normalizedId ?? capability]

    if (compat) entry.compatibility = compat
  }

  return entry
}

function collectPermissions (
  map: Map<string, ExtensionCapability>,
  manifest: ExtensionManifest,
  opts: GetCapabilitiesOptions
): void {
  const addList = (list: unknown, optional: boolean, prefix: string): void => {
    if (!Array.isArray(list)) return

    for (const name of list) {
      if (!isNonEmptyString(name)) continue

      const key = `${prefix}:${name}`

      if (map.has(key)) continue

      map.set(
        key,
        makeEntry(
          name,
          PERMISSION_DESCRIPTIONS[name] ?? `API permission: ${name}`,
          opts,
          undefined,
          `${prefix}.${name}`,
          name,
          optional
        )
      )
    }
  }

  addList(manifest.permissions, false, 'permissions')
  addList(manifest.optional_permissions, true, 'optional_permissions')

  const addHosts = (list: unknown, optional: boolean, id: string): void => {
    if (!hasNonEmptyStringArray(list)) return

    const entry: ExtensionCapability = {
      capability: id,
      description: optional
        ? 'Optional host access to web origins'
        : 'Host access to web origins',
      fields: (list as string[]).filter(isNonEmptyString)
    }

    if (opts.normalizeNames) entry.id = id

    if (optional) entry.optional = true

    map.set(id, entry)
  }

  addHosts(manifest.host_permissions, false, 'host_permissions')
  addHosts(manifest.optional_host_permissions, true, 'optional_host_permissions')
}

function manifestFallback (
  opts: GetCapabilitiesOptions
): ExtensionCapability[] {
  return [
    {
      capability: 'manifest',
      description: 'Basic extension manifest configuration',
      ...(opts.normalizeNames ? {id: 'manifest'} : {}),
      ...(opts.includeFields ? {fields: []} : {})
    }
  ]
}

function isManifestObject (value: unknown): value is ExtensionManifest {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Analyze a manifest object and return the capabilities it declares.
 *
 * Note: this is static analysis of the manifest only. Capabilities registered
 * at runtime (e.g. chrome.scripting / chrome.userScripts, dynamic/session DNR
 * rules) cannot be detected here, so an absent capability does not guarantee
 * the extension never uses it.
 */
export function analyzeExtensionManifest (
  manifest: ExtensionManifest,
  options?: GetCapabilitiesOptions
): ExtensionCapability[] {
  const opts = options ?? {}

  if (!isManifestObject(manifest)) {
    if (opts.strict !== false) {
      throw new TypeError('Invalid manifest: expected a non-null object')
    }

    return manifestFallback(opts)
  }

  const capabilityMap = new Map<string, ExtensionCapability>()

  for (const d of DETECTORS) {
    if (d.detect(manifest)) {
      capabilityMap.set(
        d.id,
        makeEntry(d.capability, d.description, opts, d.fields, d.id, d.id)
      )
    }
  }

  if (opts.includePermissions) collectPermissions(capabilityMap, manifest, opts)

  if (capabilityMap.size === 0) return manifestFallback(opts)

  return Array.from(capabilityMap.values()).sort((a, b) => {
    const ak = (a.id ?? a.capability).toLowerCase()
    const bk = (b.id ?? b.capability).toLowerCase()

    return ak.localeCompare(bk)
  })
}

/**
 * Analyze a manifest object and return capabilities alongside basic metadata
 * (manifest version and name).
 */
export function analyzeExtension (
  manifest: ExtensionManifest,
  options?: GetCapabilitiesOptions
): ExtensionAnalysis {
  const capabilities = analyzeExtensionManifest(manifest, options)

  return {
    manifestVersion: isManifestObject(manifest)
      ? manifest.manifest_version
      : undefined,
    name: isManifestObject(manifest) ? manifest.name : undefined,
    capabilities
  }
}

function parseManifest (
  manifestPath: string,
  content: string,
  options: GetCapabilitiesOptions
): ExtensionCapability[] {
  let manifest: unknown

  try {
    manifest = JSON.parse(content)
  } catch (error) {
    if (options.strict !== false) {
      throw new SyntaxError(
        `Invalid JSON in manifest at ${manifestPath}: ${
          (error as Error).message
        }`
      )
    }

    return manifestFallback(options)
  }

  return analyzeExtensionManifest(manifest as ExtensionManifest, options)
}

/**
 * Analyze a manifest from a file path (synchronous).
 *
 * By default (`strict` unset or `true`) a missing file, invalid JSON, or a
 * non-object manifest throws. Pass `strict: false` to receive the `manifest`
 * fallback capability instead.
 */
export function getExtensionCapabilities (
  manifestPath: string,
  options?: GetCapabilitiesOptions
): ExtensionCapability[] {
  const opts = options ?? {}

  if (!fs.existsSync(manifestPath)) {
    if (opts.strict !== false) {
      throw new Error(`Manifest file not found at: ${manifestPath}`)
    }

    return manifestFallback(opts)
  }

  const content = fs.readFileSync(manifestPath, 'utf8')

  return parseManifest(manifestPath, content, opts)
}

/**
 * Async variant of {@link getExtensionCapabilities}. Same options and error
 * semantics.
 */
export async function getExtensionCapabilitiesAsync (
  manifestPath: string,
  options?: GetCapabilitiesOptions
): Promise<ExtensionCapability[]> {
  const opts = options ?? {}

  try {
    await fs.promises.access(manifestPath, fs.constants.F_OK)
  } catch {
    if (opts.strict !== false) {
      throw new Error(`Manifest file not found at: ${manifestPath}`)
    }

    return manifestFallback(opts)
  }

  const content = await fs.promises.readFile(manifestPath, 'utf8')

  return parseManifest(manifestPath, content, opts)
}
