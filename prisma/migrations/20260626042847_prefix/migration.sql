/*
  Warnings:

  - The primary key for the `recipe_bag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `prefix` to the `recipe_bag` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recipe_bag" (
    "recipe_id" TEXT NOT NULL,
    "bag_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "is_writable" BOOLEAN NOT NULL,
    "prefix" TEXT NOT NULL,
    "info" JSONB NOT NULL,

    PRIMARY KEY ("recipe_id", "bag_id", "prefix"),
    CONSTRAINT "recipe_bag_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_bag_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_recipe_bag" ("bag_id", "info", "is_writable", "priority", "recipe_id") SELECT "bag_id", "info", "is_writable", "priority", "recipe_id" FROM "recipe_bag";
DROP TABLE "recipe_bag";
ALTER TABLE "new_recipe_bag" RENAME TO "recipe_bag";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
