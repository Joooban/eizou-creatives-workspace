-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('GRAPHIC', 'PHOTO', 'REEL');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PLANNED', 'IN_PRODUCTION', 'INTERNAL_REVIEW', 'CLIENT_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contractStart" TIMESTAMP(3) NOT NULL,
    "contractEnd" TIMESTAMP(3) NOT NULL,
    "driveFolder" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeliverablePlan" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "graphicsQuota" INTEGER NOT NULL,
    "photoQuota" INTEGER NOT NULL,
    "reelsQuota" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverablePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskPublishedLink" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "TaskPublishedLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamMember" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "assignedToId" INTEGER,
    "contentType" "public"."ContentType" NOT NULL,
    "platforms" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'PLANNED',
    "reviewRound" INTEGER NOT NULL DEFAULT 0,
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "deadline" TIMESTAMP(3),
    "scheduledPublishDate" TIMESTAMP(3),
    "actualPublishDate" TIMESTAMP(3),
    "caption" TEXT,
    "instructions" TEXT,
    "workingFileLink" TEXT,
    "driveLink" TEXT,
    "publishedPostLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliverablePlan_clientId_periodMonth_periodYear_key" ON "public"."DeliverablePlan"("clientId", "periodMonth", "periodYear");

-- CreateIndex
CREATE UNIQUE INDEX "TaskPublishedLink_taskId_platform_key" ON "public"."TaskPublishedLink"("taskId", "platform");

-- AddForeignKey
ALTER TABLE "public"."DeliverablePlan" ADD CONSTRAINT "DeliverablePlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskPublishedLink" ADD CONSTRAINT "TaskPublishedLink_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
