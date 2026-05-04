import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// DATABASE_URL is required at runtime; build-time analysis skips the connection
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const client = postgres(process.env.DATABASE_URL!, { prepare: false })
export const db = drizzle(client)
