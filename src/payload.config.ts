import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Refuse to run on missing runtime configuration, instead of falling back to ''.
// `payload build` imports this file, so the build needs both values although it uses neither.
const missing = ['PAYLOAD_SECRET', 'DATABASE_URL'].filter((name) => !process.env[name])
if (missing.length > 0) {
  throw new Error(`Missing runtime configuration: ${missing.join(', ')}`)
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users],
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
    },
  }),
})
