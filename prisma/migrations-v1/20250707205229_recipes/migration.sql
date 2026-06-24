-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recipes" (
    "recipe_id" TEXT NOT NULL PRIMARY KEY,
    "recipe_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "owner_id" TEXT,
    "plugin_names" JSONB NOT NULL,
    "skip_required_plugins" BOOLEAN NOT NULL DEFAULT false,
    "skip_core" BOOLEAN NOT NULL DEFAULT false,
    "preload_store" BOOLEAN NOT NULL DEFAULT false,
    "custom_wiki" TEXT
);
INSERT INTO "new_recipes" ("description", "owner_id", "plugin_names", "recipe_id", "recipe_name", "skip_core", "skip_required_plugins") SELECT "description", "owner_id", "plugin_names", "recipe_id", "recipe_name", "skip_core", "skip_required_plugins" FROM "recipes";
DROP TABLE "recipes";
ALTER TABLE "new_recipes" RENAME TO "recipes";
CREATE UNIQUE INDEX "recipes_recipe_name_key" ON "recipes"("recipe_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
