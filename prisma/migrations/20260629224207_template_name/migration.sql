/*
  Warnings:

  - Added the required column `name` to the `template` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "definition" JSONB NOT NULL
);
INSERT INTO "new_template" ("definition", "id", "type") SELECT "definition", "id", "type" FROM "template";
DROP TABLE "template";
ALTER TABLE "new_template" RENAME TO "template";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
