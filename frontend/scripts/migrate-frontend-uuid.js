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

  // 1. Change deleteId state
  content = content.replace(/useState<number\s*\|\s*null>/g, 'useState<string | null>');

  // 2. Change mutationFn: (id: number) to mutationFn: (id: string)
  content = content.replace(/mutationFn:\s*\((.*?id.*?):\s*number\s*\)/g, 'mutationFn: ($1: string)');
  content = content.replace(/mutationFn:\s*\({(.*?)id(.*?)}:\s*{(.*?)id:\s*number(.*?)}\)/g, 'mutationFn: ({$1id$2}: {$3id: string$4})');

  // 3. Implement optimistic UI for deletion (inject onMutate into deleteMutation)
  if (content.includes('const deleteMutation = useMutation({') && !content.includes('onMutate:')) {
    const optimisticSnippet = `
    onMutate: async (deletedId) => {
      qc.setQueriesData({ type: 'active' }, (old: any) => {
        if (Array.isArray(old)) return old.filter((item: any) => item?.id !== deletedId);
        if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.filter((item: any) => item?.id !== deletedId) };
        return old;
      });
    },`;
    
    // Check if it's called deleteId or just id. The mutationFn usually gets `id`, but we intercept it as `deletedId`.
    // We will just inject it right after `useMutation({`.
    content = content.replace(/const deleteMutation = useMutation\(\{/, `const deleteMutation = useMutation({${optimisticSnippet}`);
  }

  // Handle Edit states if any ID is typed as number
  content = content.replace(/useState<number>\(0\)/g, "useState<string>('')");
  content = content.replace(/id:\s*number/g, 'id: string');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated front-end file ${filePath}`);
  }
});
