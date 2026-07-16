import { PrismaClient, RoleType, ProjectStatus, ProjectPriority, TaskStatus, TaskPriority, NotificationType, ProjectMemberRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const projectTemplates = [
  { name: 'Authentication Service', desc: 'Migrate legacy auth to OAuth2.0 and OIDC standard with JWT support.', statuses: ['ACTIVE', 'COMPLETED', 'PLANNING'] },
  { name: 'API Gateway', desc: 'Centralized API gateway for rate limiting, auth, and routing using Kong.', statuses: ['ACTIVE', 'PLANNING'] },
  { name: 'Customer Portal', desc: 'Next.js based frontend dashboard for customer self-service.', statuses: ['ACTIVE', 'ON_HOLD'] },
  { name: 'Website Redesign', desc: 'Overhaul corporate marketing site with new branding guidelines.', statuses: ['COMPLETED', 'ACTIVE'] },
  { name: 'Mobile Banking App', desc: 'React Native application for iOS and Android retail banking.', statuses: ['ACTIVE', 'PLANNING'] },
  { name: 'Analytics Dashboard', desc: 'Internal BI tool for tracking user engagement and retention.', statuses: ['ACTIVE'] },
  { name: 'Notification Service', desc: 'Kafka-based microservice for email, SMS, and push notifications.', statuses: ['ACTIVE', 'PLANNING'] },
  { name: 'Infrastructure Migration', desc: 'Move on-prem workloads to AWS EKS and establish CI/CD.', statuses: ['ACTIVE', 'ON_HOLD'] },
  { name: 'AI Assistant', desc: 'Integration of LLM capabilities into the primary customer support chat.', statuses: ['PLANNING'] },
  { name: 'Internal Admin Portal', desc: 'Backoffice tool for CSRs to manage user accounts and billing.', statuses: ['ACTIVE', 'COMPLETED'] },
];

const taskTitles = [
  'Setup CI/CD pipeline', 'Design database schema', 'Implement rate limiting', 'Write unit tests', 
  'Create Dockerfile', 'Update API documentation', 'Refactor authentication middleware', 'Fix memory leak in worker', 
  'Conduct security audit', 'Configure Redis caching', 'Implement WebSocket transport', 'Optimize SQL queries', 
  'Design Figma mockups', 'Set up Datadog monitoring', 'Write E2E tests with Cypress', 'Migrate to TypeScript',
  'Implement dark mode', 'Review PR #442', 'Update dependency vulnerabilities', 'Configure load balancer'
];

const commentsPool = [
  'I reviewed this and it looks good. Approved.', 'Can we optimize this query? It seems slow on large datasets.',
  'Blocked on the DevOps team provisioning the staging environment.', 'I will pick this up tomorrow morning.',
  'The design team updated the Figma file, we need to adjust the padding.', 'Tested on mobile, looks perfect.',
  'Failing CI on Node 18, investigating.', 'Just deployed this to staging. Please QA.', 'Looks great! Merging now.'
];

async function main() {
  console.log('🌱 Seeding database with realistic engineering data...');

  // Roles
  const adminRole = await prisma.role.upsert({ where: { name: RoleType.ADMIN }, update: {}, create: { name: RoleType.ADMIN } });
  const pmRole = await prisma.role.upsert({ where: { name: RoleType.PROJECT_MANAGER }, update: {}, create: { name: RoleType.PROJECT_MANAGER } });
  const devRole = await prisma.role.upsert({ where: { name: RoleType.TEAM_MEMBER }, update: {}, create: { name: RoleType.TEAM_MEMBER } });

  const password = await bcrypt.hash('Password@123', 10);

  // Users
  const usersData = [
    { email: 'admin@taskforge.com', first: 'System', last: 'Admin', role: adminRole.id },
    { email: 'sarah.manager@taskforge.com', first: 'Sarah', last: 'Connor', role: pmRole.id },
    { email: 'david.lead@taskforge.com', first: 'David', last: 'Wallace', role: pmRole.id },
    { email: 'john.dev@taskforge.com', first: 'John', last: 'Carmack', role: devRole.id },
    { email: 'ada.engineer@taskforge.com', first: 'Ada', last: 'Lovelace', role: devRole.id },
    { email: 'linus.systems@taskforge.com', first: 'Linus', last: 'Torvalds', role: devRole.id },
  ];

  const users = await Promise.all(usersData.map(u => 
    prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { firstName: u.first, lastName: u.last, email: u.email, password, roleId: u.role }
    })
  ));

  // Clear existing to avoid duplicates in demo (optional, but safe for clean slate)
  await prisma.project.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();

  // Generate Projects
  console.log(`Generating ${projectTemplates.length} projects...`);
  const createdProjects = [];
  for (const template of projectTemplates) {
    const owner = randomElement(users);
    const p = await prisma.project.create({
      data: {
        name: template.name,
        description: template.desc,
        ownerId: owner.id,
        status: randomElement(template.statuses) as ProjectStatus,
        priority: randomElement(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']) as ProjectPriority,
        startDate: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + randomInt(10, 60) * 24 * 60 * 60 * 1000),
      }
    });
    createdProjects.push(p);

    // Add 3-5 random members to each project
    const projectMembers = users.sort(() => 0.5 - Math.random()).slice(0, randomInt(3, 5));
    if (!projectMembers.find(m => m.id === owner.id)) projectMembers.push(owner);

    await prisma.projectMember.createMany({
      data: projectMembers.map(m => ({
        projectId: p.id,
        userId: m.id,
        role: m.id === owner.id ? ProjectMemberRole.OWNER : ProjectMemberRole.MEMBER
      })),
      skipDuplicates: true
    });
  }

  // Generate Tasks
  console.log(`Generating tasks for projects...`);
  const createdTasks = [];
  for (const project of createdProjects) {
    const numTasks = randomInt(4, 8);
    const projectMembers = await prisma.projectMember.findMany({ where: { projectId: project.id } });
    
    for (let i = 0; i < numTasks; i++) {
      const assignee = randomElement(projectMembers);
      const creator = randomElement(projectMembers);
      
      const t = await prisma.task.create({
        data: {
          title: randomElement(taskTitles),
          description: `Detailed requirements for ${project.name} task.`,
          projectId: project.id,
          creatorId: creator.userId,
          assigneeId: assignee.userId,
          priority: randomElement(['LOW', 'MEDIUM', 'HIGH', 'URGENT']) as TaskPriority,
          status: randomElement(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']) as TaskStatus,
          dueDate: new Date(Date.now() + randomInt(-5, 20) * 24 * 60 * 60 * 1000),
        }
      });
      createdTasks.push(t);
    }
  }

  // Generate Comments
  console.log(`Generating 25 comments...`);
  for (let i = 0; i < 25; i++) {
    const task = randomElement(createdTasks);
    const author = randomElement(users);
    await prisma.taskComment.create({
      data: {
        content: randomElement(commentsPool),
        taskId: task.id,
        authorId: author.id,
        createdAt: new Date(Date.now() - randomInt(1, 48) * 60 * 60 * 1000)
      }
    });
  }

  // Generate Notifications
  console.log(`Generating 35 notifications...`);
  
  const notificationTemplates = [
    { title: 'Task Assigned', type: 'INFO', msg: (t: string) => `You have been assigned to the task: ${t}` },
    { title: 'Task Completed', type: 'SUCCESS', msg: (t: string) => `The task "${t}" has been marked as DONE.` },
    { title: 'Comment Added', type: 'INFO', msg: (t: string) => `A new comment was added on "${t}".` },
    { title: 'Project Created', type: 'SUCCESS', msg: (t: string) => `A new project workspace has been initialized.` },
    { title: 'Deadline Approaching', type: 'WARNING', msg: (t: string) => `The deadline for "${t}" is approaching in 2 days.` },
    { title: 'Invitation Accepted', type: 'SUCCESS', msg: (t: string) => `A new member has joined your project.` },
    { title: 'Project Archived', type: 'WARNING', msg: (t: string) => `A legacy project was successfully archived.` }
  ];

  for (let i = 0; i < 35; i++) {
    const user = randomElement(users);
    const template = randomElement(notificationTemplates);
    const taskName = randomElement(taskTitles);
    
    await prisma.notification.create({
      data: {
        title: template.title,
        message: template.msg(taskName),
        type: template.type as NotificationType,
        isRead: Math.random() > 0.6,
        userId: user.id,
        createdAt: new Date(Date.now() - randomInt(1, 72) * 60 * 60 * 1000)
      }
    });
  }

  // Generate Activities
  console.log(`Generating 40 activity logs...`);
  const actions = ['Created Project', 'Updated Task', 'Resolved Issue', 'Deployed to Staging', 'Assigned Task'];
  for (let i = 0; i < 40; i++) {
    const user = randomElement(users);
    await prisma.activityLog.create({
      data: {
        action: randomElement(actions),
        entity: randomElement(['Project', 'Task', 'System']),
        userId: user.id,
        createdAt: new Date(Date.now() - randomInt(1, 100) * 60 * 60 * 1000)
      }
    });
  }

  console.log('🎉 Realistic engineering seed completed successfully!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });