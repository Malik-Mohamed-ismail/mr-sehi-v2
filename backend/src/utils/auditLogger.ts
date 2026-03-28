import { auditLog } from '../db/schema/auditLog.js'

export interface AuditParams {
  userId: string
  action:    'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT'
  tableName: string
  recordId?: string
  oldValues?: unknown
  newValues?: unknown
  ipAddress?: string
  userAgent?: string
}

/**
 * Write an audit trail record.
 * Always called inside the same database transaction as the business operation.
 */
export async function writeAuditLog(tx: any, params: AuditParams): Promise<void> {
  await tx.insert(auditLog).values({
    user_id:    params.userId,
    action:     params.action,
    table_name: params.tableName,
    record_id:  params.recordId,
    old_values: params.oldValues ?? null,
    new_values: params.newValues ?? null,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
  })
}
