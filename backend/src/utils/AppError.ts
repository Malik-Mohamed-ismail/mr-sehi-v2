export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_ENTRY'
  | 'JOURNAL_UNBALANCED'
  | 'INSUFFICIENT_CASH'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'ENTRY_LOCKED'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMITED'

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_ERROR:   'بيانات غير صحيحة',
  DUPLICATE_ENTRY:    'هذا السجل موجود مسبقاً',
  JOURNAL_UNBALANCED: 'القيد غير متوازن — المدين لا يساوي الدائن',
  INSUFFICIENT_CASH:  'الرصيد النقدي غير كافٍ',
  UNAUTHORIZED:       'مطلوب تسجيل الدخول',
  FORBIDDEN:          'ليس لديك صلاحية للوصول',
  NOT_FOUND:          'السجل غير موجود',
  ENTRY_LOCKED:       'لا يمكن تعديل قيد مُعكوس',
  INTERNAL_ERROR:     'حدث خطأ غير متوقع',
  RATE_LIMITED:       'محاولات كثيرة — حاول لاحقاً',
}

export class AppError extends Error {
  constructor(
    public code:       ErrorCode,
    public statusCode: number,
    public messageAr:  string = ERROR_MESSAGES[code],
    public details?:   unknown[]
  ) {
    super(messageAr)
    this.name = 'AppError'
  }
}
