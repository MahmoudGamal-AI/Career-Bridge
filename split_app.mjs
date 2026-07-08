import fs from 'fs';
import path from 'path';

const appTsxPath = path.join(process.cwd(), 'src/app/App.tsx');
const content = fs.readFileSync(appTsxPath, 'utf8');

const sections = content.split(/\/\/\s*───\s*(.*?)\s*───+/);

const outDir = path.join(process.cwd(), 'src/split_output');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, '00_preamble.tsx'), sections[0]);

for (let i = 1; i < sections.length; i += 2) {
  const sectionName = sections[i].trim().replace(/[^a-zA-Z0-9]/g, '_');
  const sectionContent = sections[i + 1];
  
  fs.writeFileSync(path.join(outDir, `${sectionName}.tsx`), sectionContent);
}

console.log("Splitting done. Check src/split_output.");
