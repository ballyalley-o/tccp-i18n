import { DEFAULT_LOCALE, locales } from './locale.config.js';
const getMessage = (obj, path) => path.split('.').reduce((o, i) => (o && typeof o === 'object' && i in o ? o[i] : null), obj);
export const transl = (key, params, locale = DEFAULT_LOCALE) => {
    const localeMessage = getMessage(locales[locale], key);
    const fallbackMessage = getMessage(locales.en, key);
    const message = localeMessage || fallbackMessage;
    if (typeof message !== 'string')
        return key;
    let result = message;
    if (params) {
        Object.keys(params).forEach((param) => {
            result = result.replace(new RegExp(`{${param}}`, 'g'), String(params[param]));
        });
    }
    return result;
};
//# sourceMappingURL=transl.js.map