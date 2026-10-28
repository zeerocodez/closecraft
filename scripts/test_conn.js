const path = require('path');
const fs = require('fs');
const { PrismaClient } = require(path.resolve(process.cwd(), 'node_modules/@prisma/client'));

const dbUrl = process.env.DATABASE_URL;
console.log('Connecting with database URL host:', dbUrl.split('@')[1]?.split('/')[0]);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl.includes('?') ? `${dbUrl}&connect_timeout=30` : `${dbUrl}?connect_timeout=30`
    }
  }
});

async function main() {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`Connection attempt ${attempt}...`);
      await prisma.$connect();
      console.log('Connected!');
      const info = await prisma.$queryRaw`SELECT version();`;
      console.log('Version:', info[0].version.slice(0, 30));
      return;
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

main().finally(() => prisma.$disconnect());
