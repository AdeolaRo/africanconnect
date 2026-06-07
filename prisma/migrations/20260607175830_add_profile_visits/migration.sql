-- CreateTable
CREATE TABLE "ProfileVisit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorId" TEXT NOT NULL,
    "visitedUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfileVisit_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfileVisit_visitedUserId_fkey" FOREIGN KEY ("visitedUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProfileVisit_visitedUserId_createdAt_idx" ON "ProfileVisit"("visitedUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileVisit_visitorId_visitedUserId_key" ON "ProfileVisit"("visitorId", "visitedUserId");
