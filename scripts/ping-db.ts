import { db } from '../src/db'
import { sql } from 'drizzle-orm'

async function main() {
  const result = await db.execute(sql`SELECT 1 as ping`)
  console.log('DB connection OK:', result)
  process.exit(0)
}

main().catch((err) => {
  console.error('DB connection failed:', err)
  process.exit(1)
})
