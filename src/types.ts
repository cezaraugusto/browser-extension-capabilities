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
    type?: string
    persistent?: boolean
  }

  // Content
  content_scripts?: Array<{
    matches: string[]
    js?: string[]
    css?: string[]
    run_at?: string
  }>

  // User scripts (Firefox manifest key / API registration)
  user_scripts?: Record<string, unknown>

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
    | string |
    {
      resources: string[]
      matches?: string[]
      extension_ids?: string[]
      use_dynamic_url?: boolean
    }
  >

  // Common additional capabilities
  omnibox?: {keyword: string}
  commands?: Record<string, unknown>
  chrome_settings_overrides?: {
    homepage?: string
    search_provider?: Record<string, unknown>
    startup_pages?: string[]
  }
  declarative_net_request?: {
    rule_resources?: Array<{id: string; enabled?: boolean; path: string}>
  }
  tts_engine?: {
    voices?: Array<Record<string, unknown>>
  }

  // Messaging from web pages / other extensions
  externally_connectable?: {
    matches?: string[]
    ids?: string[]
    accepts_tls_channel_id?: boolean
  }

  // Content Security Policy (string in MV2, object in MV3)
  content_security_policy?: string | Record<string, string>

  // Incognito behavior
  incognito?: string

  // Managed storage schema
  storage?: {
    managed_schema?: string
  }

  // Permissions/context, surfaced only when includePermissions is enabled
  permissions?: string[]
  optional_permissions?: string[]
  host_permissions?: string[]
  optional_host_permissions?: string[]
}

export interface CapabilityCompatibility {
  chrome?: boolean
  edge?: boolean
  firefox?: boolean
  safari?: boolean
  notes?: string
  docs?: string
}

export interface ExtensionCapability {
  capability: string
  description: string
  id?: string
  fields?: string[]
  /** True when requested optionally (optional_permissions/host). */
  optional?: boolean
  compatibility?: CapabilityCompatibility
}

export interface ExtensionAnalysis {
  manifestVersion?: number
  name?: string
  capabilities: ExtensionCapability[]
}

export interface GetCapabilitiesOptions {
  /**
   * Throw on missing files, invalid JSON, or non-object manifests.
   * Defaults to `true`. Set `strict: false` to return the `manifest`
   * fallback instead of throwing.
   */
  strict?: boolean
  includeFields?: boolean
  normalizeNames?: boolean
  includeCompatibility?: boolean
  /** Surface permissions and host access as capabilities. */
  includePermissions?: boolean
}
