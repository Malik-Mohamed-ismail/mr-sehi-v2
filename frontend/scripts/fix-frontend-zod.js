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

const frontendSrcDir = path.join(process.cwd(), 'src');

walkSync(frontendSrcDir, (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Fix Zod schemas in Frontend
  // e.g., supplier_id: z.coerce.number().positive(...)
  // e.g., subscriber_id: z.coerce.number().positive(...)
  content = content.replace(/(supplier_id|subscriber_id|journal_entry_id|source_id|entry_id|account_id):\s*z\.(?:coerce\.)?number\(\)(?:\.int\(\))?(?:\.positive\([^)]*\))?/g, (match, param1) => {
      // Find what's inside the .positive(...) if it exists to preserve the error message
      const msgMatch = match.match(/\.positive\(([^)]*)\)/);
      const msg = msgMatch ? `, ${msgMatch[1]}` : '';
      return `${param1}: z.string().min(1${msg})`;
  });
  
  // What if it doesn't have positive() but has min() or just .optional()?
  content = content.replace(/(supplier_id|subscriber_id|journal_entry_id|source_id|entry_id|account_id):\s*z\.(?:coerce\.)?number\(\)[a-zA-Z0-9.()]*\.optional\(\)/g, '$1: z.string().optional()');
  content = content.replace(/(supplier_id|subscriber_id|journal_entry_id|source_id|entry_id|account_id):\s*z\.(?:coerce\.)?number\(\)[a-zA-Z0-9.()]*(?![a-zA-Z0-9])/g, '$1: z.string().min(1)');

  // Fix Number(suppId) or Number(id) when looking up in arrays
  // Example: s.id === Number(suppId)  --> s.id === suppId
  content = content.replace(/===\s*Number\(([a-zA-Z0-9_]+)\)/g, '=== $1');
  
  // Example: Number(watch('supplier_id')) or similar -> just string
  content = content.replace(/Number\((watch\([^)]+\))\)/g, '$1');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated front-end Zod/Casting file: ${filePath}`);
  }
});
