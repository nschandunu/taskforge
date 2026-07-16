/*
  Warnings:

  - Added the required column `updatedAt` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "invitationStatus" "InvitationStatus" NOT NULL DEFAULT 'ACCEPTED',
ADD COLUMN     "role" "ProjectMemberRole" NOT NULL DEFAULT 'MEMBER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "projectId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_creatorId_idx" ON "Task"("creatorId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
