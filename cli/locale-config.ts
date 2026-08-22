import fs                from 'node:fs/promises'
import path              from 'node:path'
import { fileURLToPath } from 'node:url'

type PackageJson = {
  tccpI18n?: {
    sourceLocale ?: string
    targetLocales?: string[]
    messagesDir  ?: string
  }
}

export type LocaleCliConfig = {
  sourceLocale : string
  targetLocales: string[]
  messagesDir  : string
}

const __filename  = fileURLToPath(import.meta.url)
const __dirname   = path.dirname(__filename)
const packageRoot = path.resolve(__dirname, '..')

const parseListArg = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const readPackageConfig = async (): Promise<PackageJson['tccpI18n']> => {
  const raw = await fs.readFile(path.join(packageRoot, 'package.json'), 'utf8')
  const pkg = JSON.parse(raw) as PackageJson

  return pkg.tccpI18n || {}
}

const readArgs = () => {
  const args = process.argv.slice(2)
  const config: Partial<LocaleCliConfig> = {}

  args.forEach((arg) => {
    const [name, value] = arg.split('=')

    if (!value) return

    if (name === '--source') config.sourceLocale = value
    if (name === '--locales') config.targetLocales = parseListArg(value)
    if (name === '--messages-dir') config.messagesDir = path.resolve(packageRoot, value)
  })

  return config
}

const discoverTargetLocales = async (messagesDir: string, sourceLocale: string) => {
  const files = await fs.readdir(messagesDir)

  return files
    .filter((file) => file.endsWith('.ts'))
    .filter((file) => file !== 'index.ts')
    .map((file) => path.basename(file, '.ts'))
    .filter((locale) => locale !== sourceLocale)
    .sort()
}

export const localeExportName = (locale: string) => locale.replace(/-/g, '_')

export async function getLocaleCliConfig(): Promise<LocaleCliConfig> {
  const packageConfig     = await readPackageConfig()
  const argConfig         = readArgs()
  const sourceLocale      = argConfig.sourceLocale || packageConfig.sourceLocale || 'en'
  const messagesDir       = argConfig.messagesDir || path.resolve(packageRoot, packageConfig.messagesDir || 'src/message')
  const configuredTargets = argConfig.targetLocales || packageConfig.targetLocales || []
  const targetLocales     = configuredTargets.length > 0 ? configuredTargets : await discoverTargetLocales(messagesDir, sourceLocale)

  return {
    sourceLocale,
    targetLocales,
    messagesDir
  }
}
