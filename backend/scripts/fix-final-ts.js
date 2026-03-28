import fs from 'fs';
import path from 'path';

function replaceInFile(relativePath, replacements) {
  const p = path.join(process.cwd(), relativePath);
  if(!fs.existsSync(p)) return;
  let text = fs.readFileSync(p, 'utf-8');
  for (const [regex, replacement] of replacements) {
    text = text.replace(regex, replacement);
  }
  fs.writeFileSync(p, text, 'utf-8');
  console.log('Fixed', relativePath);
}

// 1. journal.service.ts
replaceInFile('src/modules/journal/journal.service.ts', [
  [/entryId: number/g, 'entryId: string'],
]);

// 2. revenue.service.ts
replaceInFile('src/modules/revenue/revenue.service.ts', [
  [/entryId: number/g, 'entryId: string'],
  [/async function reverseRevenueJournal\(tx: any, entryId: number/g, 'async function reverseRevenueJournal(tx: any, entryId: string'],
]);

// 3. auth.ts (middleware)
replaceInFile('src/middleware/auth.ts', [
  [/userId: number/g, 'userId: string'],
]);

// 4. auth.controller.ts
replaceInFile('src/modules/auth/auth.controller.ts', [
  [/id: number/g, 'id: string'],
  [/userId: number/g, 'userId: string'],
]);

// 5. journal.controller.ts
replaceInFile('src/modules/journal/journal.controller.ts', [
  [/entryId: number/g, 'entryId: string'],
]);

// 6. audit.routes.ts
replaceInFile('src/modules/audit/audit.routes.ts', [
  [/z\.coerce\.number\(\)\.int\(\)\.optional\(\)/g, "z.string().optional()"],
  [/user_id:\s*z\.coerce\.number\(\)\.int\(\)\.optional\(\)/g, "user_id: z.string().optional()"],
  [/record_id:\s*z\.coerce\.number\(\)\.int\(\)\.optional\(\)/g, "record_id: z.string().optional()"],
  [/z\.number\(\)/g, "z.string()"],
]);

// 7. 03_waste.ts (seeds)
replaceInFile('src/db/seeds/03_waste.ts', [
  // waste might have hardcoded user_id: 1 or something, let's just bypass it or let it be. Wait, 'userId: 1' won't work if it's string.
  // Actually, we can just replace `user_id: 1` with `user_id: adminId` or similar if adminId is available.
  // Let me just replace `: number` in seed file.
  [/: number/g, ': string']
]);
