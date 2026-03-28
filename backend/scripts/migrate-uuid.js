import fs from 'fs';
import path from 'path';

const schemaDir = path.join(process.cwd(), 'src', 'db', 'schema');
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(schemaDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Change serial('id') to uuid('id').defaultRandom()
  content = content.replace(/serial\(['"]id['"]\)(?:\.primaryKey\(\))?/g, "uuid('id').defaultRandom().primaryKey()");

  // Change integer('anything_id') or integer('anything_by') pointing to foreign keys to uuid(...)
  // E.g., integer('created_by') -> uuid('created_by')
  content = content.replace(/integer\((['"][^'"]*(?:_id|_by)['"])\)/g, "uuid($1)");
  
  // also make sure to import uuid if needed, actually drizzle-orm/pg-core has uuid. check if 'serial' was replaced, then ensure 'uuid' is imported.
  if (content.includes("uuid('id')") || content.includes("uuid(")) {
    if (!content.includes('import {') || !content.includes('drizzle-orm/pg-core')) {
       // do nothing if no such import
    } else if (!content.includes(' uuid')) {
       // just add uuid to the imports of "drizzle-orm/pg-core"
       content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]drizzle-orm\/pg-core['"]/, (match, p1) => {
         if (!p1.includes('uuid')) {
            return `import { uuid, ${p1.trim()} } from 'drizzle-orm/pg-core'`;
         }
         return match;
       });
    }
    
    // Also remove serial if it's no longer used.
    if (!content.includes('serial(')) {
       content = content.replace(/serial,\s*/g, '');
       content = content.replace(/,\s*serial/g, '');
    }
  }

  // Check some specific fields that don't have _id but are integers, wait let me review grep.
  // Wait, I saw `level: integer('level')` this shouldn't be touched. The regex `_id` and `_by` protects it.
  // The grep showed:
  // created_by, updated_by, reversed_by, entry_id, source_id, user_id, journal_entry_id, supplier_id, subscriber_id, record_id
  // That all matches `_id` or `_by`. Perfect.

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${file}`);
}
