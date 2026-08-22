# @tccp/i18n

Type-safe shared localization contract for TCCP client UI copy and server API messages.

Use this package to keep message keys, placeholder params, and translation lookup behavior consistent across TCCP apps without coupling the shared package to React, Express, or any specific runtime framework.

## Ownership

- `client.*` keys are for UI text owned by the frontend.
- `server.*` keys are for API, validation, auth, email, and system messages owned by the backend.
- `en` is the source of truth.
- Other locale files are generated or checked against `en`.

## Usage

```ts
import { transl } from '@tccp/i18n'

transl('server.response.error.invalid_credential', undefined, 'en')
transl('server.response.error.not_found_course', { id: 'abc' }, 'en')
```

## Scripts

```bash
npm run locsync
npm run locale:check
npm run build
```

Locale scripts use this order:

1. CLI flags, for example `npm run locsync -- --locales=es,fr,ja`
2. `package.json` `tccpI18n.targetLocales`
3. Auto-discovery from `src/message/*.ts`, excluding the source locale and `index.ts`

Configure explicit targets when you want a stable publish gate:

```json
{
  "tccpI18n": {
    "sourceLocale": "en",
    "targetLocales": ["es", "fr", "ja"]
  }
}
```

If `targetLocales` is empty, adding `src/message/de.ts` automatically makes `de` part of `locsync` and `locale:check`.

Publish privately with:

```bash
npm publish --access restricted
```
