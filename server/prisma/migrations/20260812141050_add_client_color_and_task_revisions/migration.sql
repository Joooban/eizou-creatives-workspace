-- AlterTable
ALTER TABLE "public"."Client" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#8B8B90';

-- CreateTable
CREATE TABLE "public"."TaskRevision" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "notes" TEXT,
    "fileLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskRevision_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TaskRevision" ADD CONSTRAINT "TaskRevision_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
