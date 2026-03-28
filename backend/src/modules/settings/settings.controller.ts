import { Request, Response, NextFunction } from 'express'
import * as svc from './settings.service.js'

export async function getSetting(req: Request, res: Response, next: NextFunction) {
  try {
    const value = await svc.getSettingByKey(req.params.key)
    res.json({ success: true, data: value })
  } catch (err) { next(err) }
}

export async function updateSetting(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.updateSetting(req.params.key, req.body, req.user.id)
    res.json({ success: true, data, message: 'تم حفظ الإعدادات بنجاح' })
  } catch (err) { next(err) }
}
