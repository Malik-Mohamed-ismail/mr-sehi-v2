import { Request, Response, NextFunction } from 'express';
import * as svc from './lookups.service.js';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type as string;
    const data = await svc.getLookups(type);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.createLookup(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) { next(e); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const data = await svc.updateLookup(id, req.body);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    await svc.deleteLookup(id);
    res.json({ success: true, data: { id } });
  } catch (e) { next(e); }
};
