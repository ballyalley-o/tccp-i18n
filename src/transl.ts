import { locales } from './locales.js'

export const DEFAULT_LOCALE: LocaleLang = 'en'

const getMessage = (obj: unknown, path: string) =>
  path.split('.').reduce((o: unknown, i: string) => (o && typeof o === 'object' && i in o ? (o as Record<string, unknown>)[i] : null), obj)

export const transl = (key: LocaleKey, params?: LocaleParams, locale: LocaleLang = DEFAULT_LOCALE): string => {
  const localeMessage   = getMessage(locales[locale], key)
  const fallbackMessage = getMessage(locales.en, key)
  const message         = localeMessage || fallbackMessage

  if (typeof message !== 'string') return key

  let result = message

  if (params) {
    Object.keys(params).forEach((param) => {
      result = result.replace(new RegExp(`{${param}}`, 'g'), String(params[param]))
    })
  }

  return result
}
