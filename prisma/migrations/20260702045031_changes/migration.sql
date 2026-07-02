/*
  Warnings:

  - Added the required column `updated` to the `bag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `compiledAt` to the `recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated` to the `recipe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated` to the `settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated` to the `template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated` to the `tiddler` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "template_permission" (
    "template_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "level" TEXT NOT NULL,

    PRIMARY KEY ("template_id", "role_id"),
    CONSTRAINT "template_permission_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    "description" TEXT NOT NULL
);
INSERT INTO "new_bag" ("description", "id", "name") SELECT "description", "id", "name" FROM "bag";
DROP TABLE "bag";
ALTER TABLE "new_bag" RENAME TO "bag";
CREATE UNIQUE INDEX "bag_name_key" ON "bag"("name");
CREATE TABLE "new_recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    "template_id" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "plugins" JSONB NOT NULL,
    "compiledAt" DATETIME NOT NULL,
    CONSTRAINT "recipe_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_recipe" ("definition", "id", "plugins", "slug", "template_id") SELECT "definition", "id", "plugins", "slug", "template_id" FROM "recipe";
DROP TABLE "recipe";
ALTER TABLE "new_recipe" RENAME TO "recipe";
CREATE UNIQUE INDEX "recipe_slug_key" ON "recipe"("slug");
CREATE TABLE "new_settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updated" DATETIME NOT NULL
);
INSERT INTO "new_settings" ("key", "value") SELECT "key", "value" FROM "settings";
DROP TABLE "settings";
ALTER TABLE "new_settings" RENAME TO "settings";
CREATE TABLE "new_template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "definition" JSONB NOT NULL
);
INSERT INTO "new_template" ("definition", "id", "name", "type") SELECT "definition", "id", "name", "type" FROM "template";
DROP TABLE "template";
ALTER TABLE "new_template" RENAME TO "template";
CREATE UNIQUE INDEX "template_name_key" ON "template"("name");
CREATE TABLE "new_tiddler" (
    "bag_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    "revision" BIGINT NOT NULL DEFAULT 0,
    "fields" JSONB NOT NULL,

    PRIMARY KEY ("bag_id", "title"),
    CONSTRAINT "tiddler_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tiddler" ("bag_id", "fields", "revision", "title") SELECT "bag_id", "fields", "revision", "title" FROM "tiddler";
DROP TABLE "tiddler";
ALTER TABLE "new_tiddler" RENAME TO "tiddler";
CREATE INDEX "tiddler_title_idx" ON "tiddler"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
