import path                                     from 'node:path'
import { pathToFileURL }                        from 'node:url'
import { getLocaleCliConfig, localeExportName } from './locale.config.js'

type LocaleObject = Record<string, LocaleObject | string>

const { sourceLocale, targetLocales, messagesDir } = await getLocaleCliConfig()
const sourceModule                                 = await import(pathToFileURL(path.join(messagesDir, `${sourceLocale}.ts`)).href)
const sourceMessages                               = sourceModule[localeExportName(sourceLocale)] as LocaleObject

const placeholders = (value: string) => Array.from(new Set(value.match(/\{[A-Za-z0-9_]+\}/g) || [])).sort()

function collectMissing(base: LocaleObject, target: LocaleObject, keyPath: string[] = [], missing: string[] = [], placeholderIssues: string[] = []) {
  for (const key of Object.keys(base)) {
    const baseValue   = base[key]
    const targetValue = target[key]
    const nextPath    = [...keyPath, key]

    if (typeof baseValue === 'string') {
      if (typeof targetValue !== 'string' || targetValue.length === 0 || targetValue === '__MISSING__') {
        missing.push(nextPath.join('.'))
        continue
      }

      const baseParams   = placeholders(baseValue).join(',')
      const targetParams = placeholders(targetValue).join(',')

      if (baseParams !== targetParams) {
        placeholderIssues.push(`${nextPath.join('.')} expected [${baseParams}] got [${targetParams}]`)
      }

      continue
    }

    collectMissing(baseValue, typeof targetValue === 'object' && targetValue !== null ? targetValue : {}, nextPath, missing, placeholderIssues)
  }

  return { missing, placeholderIssues }
}

let hasIssue = false

for (const lang of targetLocales) {
  const filePath                       = path.join(messagesDir, `${lang}.ts`)
  const module                         = await import(pathToFileURL(filePath).href)
  const target                         = module[localeExportName(lang)] || {}
  const { missing, placeholderIssues } = collectMissing(sourceMessages, target)

  if (missing.length > 0 || placeholderIssues.length > 0) {
    hasIssue = true
    console.error(`\n${lang}`)
    missing.forEach((key) => console.error(`missing: ${key}`))
    placeholderIssues.forEach((issue) => console.error(`placeholder: ${issue}`))
  }
}

if (hasIssue) {
  process.exit(1)
}

console.log('locale files are in sync')
