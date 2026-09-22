import fs                                       from 'node:fs/promises'
import path                                     from 'node:path'
import { pathToFileURL }                        from 'node:url'
import { getLocaleCliConfig, localeExportName } from './locale.config.js'
import { translateText }                        from '../dist/google-translate.lib.js'

type LocaleObject = Record<string, LocaleObject | string>

const { sourceLocale, targetLocales, messagesDir } = await getLocaleCliConfig()
const sourceModule                                 = await import(pathToFileURL(path.join(messagesDir, `${sourceLocale}.ts`)).href)
const sourceMessages                               = sourceModule[localeExportName(sourceLocale)] as LocaleObject

async function loadLocale(lang: string): Promise<LocaleObject> {
  const filePath = path.join(messagesDir, `${lang}.ts`)

  try {
    const module = await import(`${pathToFileURL(filePath).href}?ts=${Date.now()}`)
    return module[localeExportName(lang)] || {}
  } catch {
    return {}
  }
}

async function syncKeys(base: LocaleObject, current: LocaleObject, lang: string, keyPath: string[] = []): Promise<LocaleObject> {
  const result: LocaleObject = { ...current }

  for (const key of Object.keys(base)) {
    const baseValue    = base[key]
    const currentValue = current[key]
    const nextPath     = [...keyPath, key]

    if (typeof baseValue === 'string') {
      if (typeof currentValue !== 'string' || currentValue.length === 0 || currentValue === '__MISSING__') {
        try {
          result[key] = await translateText(baseValue, lang)
          console.log(`[${lang}] ${nextPath.join('.')}`)
        } catch {
          result[key] = '__MISSING__'
          console.error(`[${lang}] failed: ${nextPath.join('.')}`)
        }
      }

      continue
    }

    result[key] = await syncKeys(baseValue, typeof currentValue === 'object' && currentValue !== null ? currentValue : {}, lang, nextPath)
  }

  return result
}

async function writeLocale(lang: string, data: LocaleObject) {
  const filePath = path.join(messagesDir, `${lang}.ts`)
  const content  = `export const ${localeExportName(lang)} = ${JSON.stringify(data, null, 2)} as const\n`

  await fs.writeFile(filePath, content, 'utf8')
}

for (const lang of targetLocales) {
  const current = await loadLocale(lang)
  const updated = await syncKeys(sourceMessages, current, lang)

  await writeLocale(lang, updated)
  console.log(`updated ${lang}.ts`)
}
