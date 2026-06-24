/*
  Warnings:

  - You are about to drop the `_GroupsToRoles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupsToUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `groups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_GroupsToRoles";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_GroupsToUsers";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "groups";
PRAGMA foreign_keys=on;
