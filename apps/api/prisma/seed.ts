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
  const admin = await prisma.user.upsert({
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
  const manager = await prisma.user.upsert({
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
  const member = await prisma.user.upsert({
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

  // ======================
  // Projects
  // ======================

  const project1 = await prisma.project.create({
    data: {
      name: 'TaskForge Backend API',
      description: 'Backend development using NestJS and Prisma.',
      ownerId: manager.id,
      status: 'ACTIVE',
      priority: 'HIGH',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'TaskForge Frontend',
      description: 'Next.js dashboard.',
      ownerId: manager.id,
      status: 'PLANNING',
      priority: 'MEDIUM',
    },
  });

  console.log('✅ Projects seeded');
  await prisma.projectMember.createMany({
    data: [
      {
        projectId: project1.id,
        userId: manager.id,
        role: 'OWNER',
      },
      {
        projectId: project1.id,
        userId: member.id,
        role: 'MEMBER',
      },
      {
        projectId: project2.id,
        userId: manager.id,
        role: 'OWNER',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Members seeded');
  await prisma.task.createMany({
    data: [
      {
        title: 'Design database schema',
        projectId: project1.id,
        creatorId: manager.id,
        assigneeId: member.id,
        priority: 'HIGH',
        status: 'DONE',
      },
      {
        title: 'Implement JWT authentication',
        projectId: project1.id,
        creatorId: manager.id,
        assigneeId: member.id,
        priority: 'HIGH',
        status: 'DONE',
      },
      {
        title: 'Build Dashboard API',
        projectId: project1.id,
        creatorId: manager.id,
        assigneeId: member.id,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
      },
      {
        title: 'Create Next.js Layout',
        projectId: project2.id,
        creatorId: manager.id,
        assigneeId: member.id,
        priority: 'MEDIUM',
        status: 'TODO',
      },
      {
        title: 'Implement Kanban Board',
        projectId: project2.id,
        creatorId: manager.id,
        assigneeId: member.id,
        priority: 'HIGH',
        status: 'TODO',
      },
    ],
  });

  console.log('✅ Tasks seeded');
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