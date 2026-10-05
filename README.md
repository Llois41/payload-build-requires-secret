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

# Not only `build`: every CLI command fails the same way, before one is even chosen.
pnpm exec payload --help
pnpm exec payload generate:importmap
pnpm exec payload generate:types
```

`payload build` imports `payload.config.ts` (via `runtime.getConfig()`, for the CLI
commands, `generateImportMap` and `generateTypes`) before it starts `vite build`, so the
build needs values it never uses. With `cp .env.example .env`, `pnpm build` succeeds — no
database has to be reachable.

The CLI loads the config while it starts up (`createCLIRuntime` → `getConfig()`, from
`loadCLICommands`), so a separate generate step — e.g. a CI job diffing the committed
`importMap.js` — needs the secrets too, and a `--skip-generate` flag alone would not help.
