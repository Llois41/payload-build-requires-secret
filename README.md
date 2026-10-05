# Reproduction: `payload build` requires runtime secrets

The `blank-tanstack` template (`create-payload-app@4.0.0-canary.37`), cut down to what
`payload build` needs, with one addition: `src/payload.config.ts` throws when
`PAYLOAD_SECRET` or `DATABASE_URL` is missing — the way an app validates its runtime
configuration on import.

```sh
pnpm install
rm -f .env              # a CI build has no runtime secrets

pnpm build              # fails: Error: Missing runtime configuration: PAYLOAD_SECRET, DATABASE_URL
pnpm build:vite         # succeeds: the framework build itself never loads the config
```

`payload build` imports `payload.config.ts` (via `runtime.getConfig()`, for the CLI
commands, `generateImportMap` and `generateTypes`) before it starts `vite build`, so the
build needs values it never uses. With `cp .env.example .env`, `pnpm build` succeeds — no
database has to be reachable.
