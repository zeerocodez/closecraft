const fs = require('fs');
const path = require('path');
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('import { prisma } from "@/lib/prisma"')) {
        fs.writeFileSync(fullPath, content.replace(/import \{ prisma \} from "@\/lib\/prisma";/g, 'import { db as prisma } from "@/lib/db";'));
        console.log('Fixed', fullPath);
      }
    }
  }
}
walk('./src');
