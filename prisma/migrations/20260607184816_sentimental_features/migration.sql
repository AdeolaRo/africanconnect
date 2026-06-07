-- CreateTable
CREATE TABLE "UserPass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPass_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserPass_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "userAConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "userBConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "userASecretCorrect" BOOLEAN NOT NULL DEFAULT false,
    "userBSecretCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EncounterValidation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "encounterId" TEXT NOT NULL,
    "validatorId" TEXT NOT NULL,
    "validatedUserId" TEXT NOT NULL,
    "badges" TEXT NOT NULL,
    "trustIncrement" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EncounterValidation_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EncounterValidation_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EncounterValidation_validatedUserId_fkey" FOREIGN KEY ("validatedUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfileTestimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfileTestimonial_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfileTestimonial_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfileTestimonial_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "photoUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completionPct" INTEGER NOT NULL DEFAULT 0,
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
INSERT INTO "new_Profile" ("age", "bio", "completed", "completionPct", "createdAt", "gender", "height", "id", "interests", "location", "maritalStatus", "origin", "photoUrl", "profession", "qualities", "religion", "seekingAgeMax", "seekingGender", "seekingHeightMax", "seekingLocation", "seekingMaritalStatus", "seekingOrigin", "seekingProfession", "seekingReligion", "updatedAt", "userId", "verified") SELECT "age", "bio", "completed", "completionPct", "createdAt", "gender", "height", "id", "interests", "location", "maritalStatus", "origin", "photoUrl", "profession", "qualities", "religion", "seekingAgeMax", "seekingGender", "seekingHeightMax", "seekingLocation", "seekingMaritalStatus", "seekingOrigin", "seekingProfession", "seekingReligion", "updatedAt", "userId", "verified" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserPass_fromUserId_toUserId_key" ON "UserPass"("fromUserId", "toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Encounter_userAId_userBId_key" ON "Encounter"("userAId", "userBId");

-- CreateIndex
CREATE UNIQUE INDEX "EncounterValidation_encounterId_validatorId_key" ON "EncounterValidation"("encounterId", "validatorId");
