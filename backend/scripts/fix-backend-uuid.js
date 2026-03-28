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

  // Fix controllers: Number(req.params.id) -> req.params.id
  content = content.replace(/Number\(req\.params\.id\)/g, 'req.params.id');
  
  // Fix services: (id: number) -> (id: string), (..., id: number, ...) -> (..., id: string, ...), etc.
  content = content.replace(/(id|userId|recordId|created_by|updated_by|supplier_id|entry_id|journal_entry_id):\s*number/g, '$1: string');

  // Fix schemas: z.number().int().positive(...) -> z.string().min(1, ...)
  content = content.replace(/z\.number\(\)\.int\(\)\.positive\('([^']+)'\)/g, "z.string().min(1, '$1')");
  content = content.replace(/z\.number\(\)\.int\(\)\.positive\("([^"]+)"\)/g, 'z.string().min(1, "$1")');
  content = content.replace(/z\.number\(\)\.int\(\)\.positive\(\)/g, "z.string().min(1)");
  
  // Fix schemas: z.coerce.number().int().optional() -> z.string().optional()
  content = content.replace(/z\.coerce\.number\(\)\.int\(\)\.optional\(\)/g, "z.string().optional()");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated backend file ${filePath}`);
  }
});
