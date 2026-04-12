import { migrate } from 'drizzle-orm/node-postgres/migrator'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './index.js'
import { drizzle } from 'drizzle-orm/node-postgres'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const d = drizzle(pool)
  await migrate(d, { migrationsFolder: path.join(__dirname, 'migrations') })
  console.log('Migrations applied.')
  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
