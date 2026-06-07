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
INSERT INTO "new_Profile" ("age", "alcohol", "bio", "children", "completed", "completionPct", "createdAt", "gender", "height", "id", "interests", "location", "lookingFor", "maritalStatus", "origin", "pets", "photoUrl", "profession", "profileTitle", "qualities", "religion", "secretAnswer", "secretQuestion", "seekingAgeMax", "seekingGender", "seekingHeightMax", "seekingLocation", "seekingMaritalStatus", "seekingOrigin", "seekingProfession", "seekingReligion", "smoking", "trustScore", "updatedAt", "userId", "verified") SELECT "age", "alcohol", "bio", "children", "completed", "completionPct", "createdAt", "gender", "height", "id", "interests", "location", "lookingFor", "maritalStatus", "origin", "pets", "photoUrl", "profession", "profileTitle", "qualities", "religion", "secretAnswer", "secretQuestion", "seekingAgeMax", "seekingGender", "seekingHeightMax", "seekingLocation", "seekingMaritalStatus", "seekingOrigin", "seekingProfession", "seekingReligion", "smoking", "trustScore", "updatedAt", "userId", "verified" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
