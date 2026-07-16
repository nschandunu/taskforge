import { PrismaClient, RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: RoleType.ADMIN },
    update: {},
    create: {
      name: RoleType.ADMIN,
    },
  });

  const projectManagerRole = await prisma.role.upsert({
    where: { name: RoleType.PROJECT_MANAGER },
    update: {},
    create: {
      name: RoleType.PROJECT_MANAGER,
    },
  });

  const teamMemberRole = await prisma.role.upsert({
    where: { name: RoleType.TEAM_MEMBER },
    update: {},
    create: {
      name: RoleType.TEAM_MEMBER,
    },
  });

  console.log('✅ Roles seeded');

  const password = await bcrypt.hash('Password@123', 10);

  // Admin
  await prisma.user.upsert({
    where: {
      email: 'admin@taskforge.com',
    },
    update: {},
    create: {
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@taskforge.com',
      password,
      roleId: adminRole.id,
    },
  });

  // Project Manager
  await prisma.user.upsert({
    where: {
      email: 'manager@taskforge.com',
    },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Manager',
      email: 'manager@taskforge.com',
      password,
      roleId: projectManagerRole.id,
    },
  });

  // Team Member
  await prisma.user.upsert({
    where: {
      email: 'member@taskforge.com',
    },
    update: {},
    create: {
      firstName: 'Jane',
      lastName: 'Member',
      email: 'member@taskforge.com',
      password,
      roleId: teamMemberRole.id,
    },
  });

  console.log('✅ Users seeded');

  console.log('🎉 Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });