/*
  Warnings:

  - Made the column `recipe_id` on table `recipe_acl` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bag_acl" (
    "acl_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bag_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission" TEXT NOT NULL,
    CONSTRAINT "bag_acl_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bags" ("bag_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_bag_acl" ("acl_id", "bag_id", "permission", "role_id") SELECT "acl_id", "bag_id", "permission", "role_id" FROM "bag_acl";
DROP TABLE "bag_acl";
ALTER TABLE "new_bag_acl" RENAME TO "bag_acl";
CREATE TABLE "new_bags" (
    "bag_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bag_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_plugin" BOOLEAN NOT NULL,
    "owner_id" INTEGER
);
INSERT INTO "new_bags" ("bag_id", "bag_name", "description", "is_plugin", "owner_id") SELECT "bag_id", "bag_name", "description", "is_plugin", "owner_id" FROM "bags";
DROP TABLE "bags";
ALTER TABLE "new_bags" RENAME TO "bags";
CREATE UNIQUE INDEX "bags_bag_name_key" ON "bags"("bag_name");
CREATE TABLE "new_recipe_acl" (
    "acl_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role_id" INTEGER NOT NULL,
    "permission" TEXT NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    CONSTRAINT "recipe_acl_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recipe_acl" ("acl_id", "permission", "recipe_id", "role_id") SELECT "acl_id", "permission", "recipe_id", "role_id" FROM "recipe_acl";
DROP TABLE "recipe_acl";
ALTER TABLE "new_recipe_acl" RENAME TO "recipe_acl";
CREATE TABLE "new_recipes" (
    "recipe_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipe_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "owner_id" INTEGER
);
INSERT INTO "new_recipes" ("description", "owner_id", "recipe_id", "recipe_name") SELECT "description", "owner_id", "recipe_id", "recipe_name" FROM "recipes";
DROP TABLE "recipes";
ALTER TABLE "new_recipes" RENAME TO "recipes";
CREATE UNIQUE INDEX "recipes_recipe_name_key" ON "recipes"("recipe_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
