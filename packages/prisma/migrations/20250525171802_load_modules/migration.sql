-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recipe_bags" (
    "recipe_id" TEXT NOT NULL,
    "bag_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "with_acl" BOOLEAN NOT NULL DEFAULT false,
    "load_modules" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "recipe_bags_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bags" ("bag_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_bags_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recipe_bags" ("bag_id", "position", "recipe_id", "with_acl") SELECT "bag_id", "position", "recipe_id", "with_acl" FROM "recipe_bags";
DROP TABLE "recipe_bags";
ALTER TABLE "new_recipe_bags" RENAME TO "recipe_bags";
CREATE INDEX "recipe_bags_recipe_id_idx" ON "recipe_bags"("recipe_id");
CREATE UNIQUE INDEX "recipe_bags_recipe_id_bag_id_key" ON "recipe_bags"("recipe_id", "bag_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
