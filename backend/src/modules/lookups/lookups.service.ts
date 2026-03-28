import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { lookups, NewLookup } from '../../db/schema/lookups.js';

export const getLookups = async (type?: string) => {
  if (type) {
    return db.select().from(lookups).where(eq(lookups.type, type)).orderBy(lookups.name_ar);
  }
  return db.select().from(lookups).orderBy(lookups.name_ar);
};

export const createLookup = async (data: NewLookup) => {
  const [created] = await db.insert(lookups).values(data).returning();
  return created;
};

export const updateLookup = async (id: string, data: Partial<NewLookup>) => {
  const [updated] = await db.update(lookups).set({ ...data, updated_at: undefined } as any).where(eq(lookups.id, id)).returning();
  return updated;
};

export const deleteLookup = async (id: string) => {
  const [deleted] = await db.delete(lookups).where(eq(lookups.id, id)).returning();
  return deleted;
};
