-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Encounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "userAConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "userBConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "userASecretCorrect" BOOLEAN NOT NULL DEFAULT false,
    "userBSecretCorrect" BOOLEAN NOT NULL DEFAULT false,
    "userAResponse" TEXT,
    "userBResponse" TEXT,
    "mutuallyVerifiedAt" DATETIME,
    "archivedAt" DATETIME,
    "disputed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Encounter" ("createdAt", "id", "updatedAt", "userAConfirmed", "userAId", "userASecretCorrect", "userBConfirmed", "userBId", "userBSecretCorrect") SELECT "createdAt", "id", "updatedAt", "userAConfirmed", "userAId", "userASecretCorrect", "userBConfirmed", "userBId", "userBSecretCorrect" FROM "Encounter";
DROP TABLE "Encounter";
ALTER TABLE "new_Encounter" RENAME TO "Encounter";
CREATE UNIQUE INDEX "Encounter_userAId_userBId_key" ON "Encounter"("userAId", "userBId");
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gender" TEXT,
    "seekingGender" TEXT,
    "age" INTEGER,
    "height" INTEGER,
    "profession" TEXT,
    "religion" TEXT,
    "origin" TEXT,
    "maritalStatus" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "qualities" TEXT,
    "interests" TEXT,
    "profileTitle" TEXT,
    "lookingFor" TEXT,
    "children" TEXT,
    "alcohol" TEXT,
    "smoking" TEXT,
    "pets" TEXT,
    "secretQuestion" TEXT,
    "secretAnswer" TEXT,
    "trustScore" INTEGER NOT NULL DEFAULT 0,
    "verifiedEncounterCount" INTEGER NOT NULL DEFAULT 0,
    "photoUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completionPct" INTEGER NOT NULL DEFAULT 0,
    "discoverVisible" BOOLEAN NOT NULL DEFAULT true,
    "seekingAgeMax" INTEGER,
    "seekingHeightMax" INTEGER,
    "seekingProfession" TEXT,
    "seekingReligion" TEXT,
    "seekingOrigin" TEXT,
    "seekingMaritalStatus" TEXT,
    "seekingLocation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("age", "alcohol", "bio", "children", "completed", "completionPct", "createdAt", "discoverVisible", "gender", "height", "id", "interests", "location", "lookingFor", "maritalStatus", "origin", "pets", "photoUrl", "profession", "profileTitle", "qualities", "religion", "secretAnswer", "secretQuestion", "seekingAgeMax", "seekingGender", "seekingHeightMax", "seekingLocation", "seekingMaritalStatus", "seekingOrigin", "seekingProfession", "seekingReligion", "smoking", "trustScore", "updatedAt", "userId", "verified") SELECT "age", "alcohol", "bio", "children", "completed", "completionPct", "createdAt", "discoverVisible", "gender", "height", "id", "interests", "location", "lookingFor", "maritalStatus", "origin", "pets", "photoUrl", "profession", "profileTitle", "qualities", "religion", "secretAnswer", "secretQuestion", "seekingAgeMax", "seekingGender", "seekingHeightMax", "seekingLocation", "seekingMaritalStatus", "seekingOrigin", "seekingProfession", "seekingReligion", "smoking", "trustScore", "updatedAt", "userId", "verified" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE TABLE "new_ProfileTestimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "publishAt" DATETIME,
    "moderatedAt" DATETIME,
    "moderatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfileTestimonial_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfileTestimonial_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfileTestimonial_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfileTestimonial_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProfileTestimonial" ("authorId", "content", "createdAt", "encounterId", "id", "targetUserId") SELECT "authorId", "content", "createdAt", "encounterId", "id", "targetUserId" FROM "ProfileTestimonial";
DROP TABLE "ProfileTestimonial";
ALTER TABLE "new_ProfileTestimonial" RENAME TO "ProfileTestimonial";
CREATE INDEX "ProfileTestimonial_status_publishAt_idx" ON "ProfileTestimonial"("status", "publishAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
