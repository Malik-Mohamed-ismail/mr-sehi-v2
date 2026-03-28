import fs from 'fs';
import path from 'path';

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walkSync(p, callback);
    } else {
      callback(p);
    }
  }
}

const backendSrcDir = path.join(process.cwd(), 'src');

walkSync(backendSrcDir, (filePath) => {
  if (!filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Handles `userId?: number`, `recordId?: number`, etc.
  content = content.replace(/\b(id|userId|recordId|created_by|updated_by|supplier_id|entry_id|journal_entry_id|source_id|subscriber_id)\??:\s*number/g, (match) => {
    return match.replace(/number/, 'string');
  });

  // Replaces req.params.id casting in routes: Number(req.params.id) etc. was done.
  // There might be `parseInt(req.params.id)` or similar. Let's check:
  content = content.replace(/parseInt\(([^)]*req\.params[^)]*)\)/g, '$1');

  // Some schemas might have `z.number().int()` alone if they are just `.optional()` or `.nullable()`.
  content = content.replace(/z\.number\(\)\.int\(\)\.optional\(\)/g, "z.string().optional()");
  content = content.replace(/z\.number\(\)\.int\(\)\.nullable\(\)/g, "z.string().nullable()");
  content = content.replace(/z\.number\(\)\.optional\(\)/g, "z.string().optional()");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated backend file ${filePath}`);
  }
});
