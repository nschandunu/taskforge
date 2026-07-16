import { PrismaClient, RoleType, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: {
      name: RoleType.ADMIN,
    },
    update: {},
    create: {
      name: RoleType.ADMIN,
    },
  });

  const password = await bcrypt.hash('Password@123', 12);

  await prisma.user.upsert({
    where: {
      email: 'admin@taskforge.com',
    },
    update: {},
    create: {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@taskforge.com',
      password,
      status: UserStatus.ACTIVE,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Seed completed.');
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });