import { eq } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { settings } from '../../db/schema/settings.js'
import { writeAuditLog } from '../../utils/auditLogger.js'

export async function getSettingByKey(key: string) {
  const [row] = await db.select().from(settings).where(eq(settings.key, key))
  return row ? row.value : null
}

export async function updateSetting(key: string, value: any, userId: string) {
  const [existing] = await db.select().from(settings).where(eq(settings.key, key))
  
  return db.transaction(async (tx) => {
    let result
    if (existing) {
      const [updated] = await tx.update(settings)
        .set({ value, updated_by: userId, updated_at: new Date() })
        .where(eq(settings.key, key)).returning()
      result = updated
      // Audit log
      await writeAuditLog(tx, {
        userId, action: 'UPDATE', tableName: 'settings', recordId: existing.id,
        oldValues: existing, newValues: updated
      })
    } else {
      const [inserted] = await tx.insert(settings)
        .values({ key, value, updated_by: userId }).returning()
      result = inserted
      await writeAuditLog(tx, {
        userId, action: 'CREATE', tableName: 'settings', recordId: inserted.id,
        newValues: inserted
      })
    }
    return result
  })
}
