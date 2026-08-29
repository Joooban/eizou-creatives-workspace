-- CreateIndex
CREATE INDEX "Task_clientId_idx" ON "public"."Task"("clientId");

-- CreateIndex
CREATE INDEX "Task_assignedToId_idx" ON "public"."Task"("assignedToId");

-- CreateIndex
CREATE INDEX "TaskRevision_taskId_idx" ON "public"."TaskRevision"("taskId");
