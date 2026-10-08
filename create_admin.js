const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@zeerocodes.com';
  const password = 'password123';
  
  // Find or create org
  let org = await prisma.organization.findFirst({
    where: { slug: 'zeerocodes' }
  });
  
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Zeerocodes HQ',
        slug: 'zeerocodes',
        plan: 'SCALE'
      }
    });
    console.log('Created Zeerocodes org.');
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    // Ensure they have a password
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });
    console.log(`Updated existing user ${email} with password: ${password}`);
  } else {
    // Create new user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Zeerocodes Admin',
        passwordHash,
        memberships: {
          create: {
            role: 'ADMIN',
            organizationId: org.id
          }
        }
      }
    });
    console.log(`Created new admin user ${email} with password: ${password}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
