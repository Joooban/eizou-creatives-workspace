-- CreateTable
CREATE TABLE "TaskPublishedLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "TaskPublishedLink_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskPublishedLink_taskId_platform_key" ON "TaskPublishedLink"("taskId", "platform");
