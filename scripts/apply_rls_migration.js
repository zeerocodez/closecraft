const path = require('path');
const fs = require('fs');
const { PrismaClient } = require(path.resolve(process.cwd(), 'node_modules/@prisma/client'));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let dollarTag = '';

  const lines = sql.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    // Skip comment lines when starting a statement
    if (!current.trim() && (trimmedLine.startsWith('--') || !trimmedLine)) {
      continue;
    }

    let i = 0;
    while (i < line.length) {
      if (!inDollarQuote) {
        // Check for start of dollar quote (e.g. $$ or $tag$)
        if (line[i] === '$') {
          const match = line.slice(i).match(/^\$([A-Za-z0-9_]*)\$/);
          if (match) {
            inDollarQuote = true;
            dollarTag = match[0];
            current += dollarTag;
            i += dollarTag.length;
            continue;
          }
        }
        // Check for line comment
        if (line[i] === '-' && line[i + 1] === '-') {
          current += line.slice(i);
          break;
        }
        // Check for semicolon
        if (line[i] === ';') {
          current += ';';
          if (current.trim()) {
            statements.push(current.trim());
          }
          current = '';
          i++;
          continue;
        }
        current += line[i];
        i++;
      } else {
        // Inside dollar quote, search for matching end tag
        if (line[i] === '$' && line.slice(i).startsWith(dollarTag)) {
          current += dollarTag;
          i += dollarTag.length;
          inDollarQuote = false;
          dollarTag = '';
          continue;
        }
        current += line[i];
        i++;
      }
    }
    current += '\n';
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

async function applyMigration() {
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${maxAttempts}] Connecting to database...`);
      await prisma.$connect();
      console.log('Connected to database!');
      break;
    } catch (err) {
      console.log(`Connection attempt ${attempt} failed: ${err.message}. Retrying in 2s...`);
      if (attempt === maxAttempts) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  const migrationSqlPath = path.resolve(process.cwd(), 'prisma/migrations/20261028_enable_rls/migration.sql');
  const fullSql = fs.readFileSync(migrationSqlPath, 'utf8');

  const statements = splitSqlStatements(fullSql);
  console.log(`Parsed ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await prisma.$executeRawUnsafe(stmt);
    } catch (err) {
      console.error(`Error executing statement ${i + 1}:\n${stmt.slice(0, 150)}...\nError:`, err.message);
      throw err;
    }
  }

  console.log('All migration statements executed successfully!');

  // Verify RLS status on tables
  const rlsStatus = await prisma.$queryRaw`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `;
  const enabled = rlsStatus.filter(t => t.rowsecurity).map(t => t.tablename);
  console.log(`Total tables with RLS enabled: ${enabled.length} / ${rlsStatus.length}`);
  console.log('Enabled tables:', enabled);

  // Verify policies
  const policies = await prisma.$queryRaw`
    SELECT tablename, policyname, cmd 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    ORDER BY tablename, policyname;
  `;
  console.log(`Total RLS policies created: ${policies.length}`);
}

applyMigration()
  .catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
