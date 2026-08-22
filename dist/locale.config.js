import { en, es, fr, ja } from './message/index.js';
export const locales = { en, es, fr, ja };
export const DEFAULT_LOCALE = 'en';
export function isSupportedLocale(locale) {
    return typeof locale === 'string' && locale in locales;
}
//# sourceMappingURL=locale.config.js.map