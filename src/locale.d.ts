import { locales } from "./locales.ts"

declare global {
    type LocaleLang = keyof typeof locales

    type AppLocale = typeof en

    type NestedKeys<T> = {
      [K in keyof T & string]: T[K] extends string
        ? K
        : T[K] extends Record<string, unknown>
          ? `${K}.${NestedKeys<T[K]>}`
          : never
    }[keyof T & string]

    type LocaleKey = NestedKeys<AppLocale>

    type LocaleParams = Record<string, string | number | boolean>
}

export {}