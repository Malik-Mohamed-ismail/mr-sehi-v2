import { seedAccounts }              from './01_accounts.js'
import { seedSuppliers, seedAdminUser } from './02_suppliers.js'
import { logger } from '../../config/logger.js'

async function run() {
  console.log('🌱 Running database seeds...')
  try {
    await seedAccounts()
    await seedSuppliers()
    await seedAdminUser()
    console.log('✅ All seeds completed successfully')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  }
}

run()
