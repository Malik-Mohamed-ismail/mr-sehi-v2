import fs from 'fs';
import path from 'path';

const schemaDir = path.join(process.cwd(), 'src', 'db', 'schema');
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(schemaDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Check if uuid is actually used
  if (content.match(/\buuid\(/) && !content.match(/\buuid\b[\s,]*}/) && content.includes('drizzle-orm/pg-core')) {
     // replace the first `import {` with `import { uuid,` for drizzle-orm/pg-core
     content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]drizzle-orm\/pg-core['"]/, (match, p1) => {
         return `import { uuid, ${p1.trim()} } from 'drizzle-orm/pg-core'`;
     });
     fs.writeFileSync(filePath, content, 'utf-8');
     console.log(`Added uuid import to ${file}`);
  }
}
