import {
  getExtensionCapabilities,
  type ExtensionCapability,
  type GetCapabilitiesOptions
} from './index'

const HELP = `browser-extension-capabilities

Analyze a browser extension manifest and list its capabilities.

Usage:
  browser-extension-capabilities [path] [options]

Arguments:
  path                 Path to manifest.json (default: ./manifest.json)

Options:
  --fields             Include the manifest field paths that triggered each capability
  --names              Include normalized, manifest-aligned ids
  --compat             Include cross-browser compatibility metadata
  --permissions        Include permissions and host access as capabilities
  --all                Shorthand for --fields --names --compat --permissions
  --json               Output JSON instead of a human-readable list
  --no-strict          Print the fallback capability instead of erroring on bad input
  -h, --help           Show this help
`

interface ParsedArgs {
  path: string
  options: GetCapabilitiesOptions
  json: boolean
  help: boolean
}

function parseArgs (argv: string[]): ParsedArgs {
  const options: GetCapabilitiesOptions = {}
  let path = './manifest.json'
  let json = false
  let help = false

  for (const arg of argv) {
    switch (arg) {
      case '-h':
      case '--help':
        help = true
        break
      case '--fields':
        options.includeFields = true
        break
      case '--names':
        options.normalizeNames = true
        break
      case '--compat':
        options.includeCompatibility = true
        break
      case '--permissions':
        options.includePermissions = true
        break
      case '--all':
        options.includeFields = true
        options.normalizeNames = true
        options.includeCompatibility = true
        options.includePermissions = true
        break
      case '--json':
        json = true
        break
      case '--no-strict':
        options.strict = false
        break
      default:
        if (arg.startsWith('-')) {
          throw new Error(`Unknown option: ${arg}`)
        }

        path = arg
    }
  }

  return {path, options, json, help}
}

function formatBrowsers (compat: ExtensionCapability['compatibility']): string {
  if (!compat) return ''

  const flag = (v: boolean | undefined): string => {
    if (v === true) return '✓'

    if (v === false) return '✗'

    return '?'
  }

  return ` [chrome ${flag(compat.chrome)} · edge ${flag(
    compat.edge
  )} · firefox ${flag(compat.firefox)} · safari ${flag(compat.safari)}]`
}

function printList (capabilities: ExtensionCapability[]): void {
  for (const cap of capabilities) {
    const label = cap.id ?? cap.capability
    const optional = cap.optional ? ' (optional)' : ''

    process.stdout.write(
      `• ${label}${optional} — ${cap.description}${formatBrowsers(
        cap.compatibility
      )}\n`
    )

    if (cap.fields?.length) {
      process.stdout.write(`    fields: ${cap.fields.join(', ')}\n`)
    }

    if (cap.compatibility?.notes) {
      process.stdout.write(`    note: ${cap.compatibility.notes}\n`)
    }
  }
}

export function run (argv: string[] = process.argv.slice(2)): number {
  let parsed: ParsedArgs

  try {
    parsed = parseArgs(argv)
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n\n${HELP}`)

    return 2
  }

  if (parsed.help) {
    process.stdout.write(HELP)

    return 0
  }

  try {
    const capabilities = getExtensionCapabilities(parsed.path, parsed.options)

    if (parsed.json) {
      process.stdout.write(`${JSON.stringify(capabilities, null, 2)}\n`)
    } else {
      printList(capabilities)
    }
    return 0
  } catch (error) {
    process.stderr.write(`Error: ${(error as Error).message}\n`)

    return 1
  }
}

// Gracefully ignore EPIPE so piping into `head`, `less`, etc. doesn't crash.
const onStreamError = (error: NodeJS.ErrnoException): void => {
  if (error.code !== 'EPIPE') throw error
}

process.stdout.on('error', onStreamError)
process.stderr.on('error', onStreamError)

process.exitCode = run()
