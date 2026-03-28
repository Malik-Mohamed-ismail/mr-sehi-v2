import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from './env.js'
import { logger } from './logger.js'
import * as schema from '../db/schema/index.js'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected PostgreSQL pool error')
})

export const db = drizzle(pool, { schema })

export async function testConnection(): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('SELECT NOW()')
    logger.info('✅ PostgreSQL connection established')
  } finally {
    client.release()
  }
}

export { pool }
