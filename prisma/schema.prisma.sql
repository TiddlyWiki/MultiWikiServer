-- CreateTable
CREATE TABLE "config" (
    "realm_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "allowReads" BOOLEAN NOT NULL,
    "allowWrites" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "acl" (
    "acl_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entity_name" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    CONSTRAINT "acl_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions" ("permission_id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "acl_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "bags" (
    "bag_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bag_name" TEXT NOT NULL,
    "accesscontrol" TEXT,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "groups" (
    "group_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "group_name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "permissions" (
    "permission_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "permission_name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "recipe_bags" (
    "recipe_id" INTEGER NOT NULL,
    "bag_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "recipe_bags_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bags" ("bag_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_bags_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recipes" (
    "recipe_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipe_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "owner_id" INTEGER,
    CONSTRAINT "recipes_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role_name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "sessions" (
    "session_id" TEXT NOT NULL PRIMARY KEY,
    "created_at" TEXT NOT NULL,
    "last_accessed" TEXT NOT NULL,
    "session_login_state" TEXT,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "tiddlers" (
    "tiddler_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bag_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL,
    "attachment_blob" TEXT,
    CONSTRAINT "tiddlers_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bags" ("bag_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fields" (
    "tiddler_id" INTEGER NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_value" TEXT NOT NULL,

    PRIMARY KEY ("tiddler_id", "field_name"),
    CONSTRAINT "fields_tiddler_id_fkey" FOREIGN KEY ("tiddler_id") REFERENCES "tiddlers" ("tiddler_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT 'datetime(''now'')',
    "last_login" TEXT
);

-- CreateTable
CREATE TABLE "_groupsToroles" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_groupsToroles_A_fkey" FOREIGN KEY ("A") REFERENCES "groups" ("group_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_groupsToroles_B_fkey" FOREIGN KEY ("B") REFERENCES "roles" ("role_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_groupsTousers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_groupsTousers_A_fkey" FOREIGN KEY ("A") REFERENCES "groups" ("group_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_groupsTousers_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_permissionsToroles" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_permissionsToroles_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions" ("permission_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_permissionsToroles_B_fkey" FOREIGN KEY ("B") REFERENCES "roles" ("role_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_rolesTousers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_rolesTousers_A_fkey" FOREIGN KEY ("A") REFERENCES "roles" ("role_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_rolesTousers_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "acl_entity_name_idx" ON "acl"("entity_name");

-- CreateIndex
CREATE UNIQUE INDEX "bags_bag_name_key" ON "bags"("bag_name");

-- CreateIndex
CREATE UNIQUE INDEX "groups_group_name_key" ON "groups"("group_name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_permission_name_key" ON "permissions"("permission_name");

-- CreateIndex
CREATE INDEX "recipe_bags_recipe_id_idx" ON "recipe_bags"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_bags_recipe_id_bag_id_key" ON "recipe_bags"("recipe_id", "bag_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_recipe_name_key" ON "recipes"("recipe_name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE INDEX "tiddlers_bag_id_idx" ON "tiddlers"("bag_id");

-- CreateIndex
CREATE UNIQUE INDEX "tiddlers_bag_id_title_key" ON "tiddlers"("bag_id", "title");

-- CreateIndex
CREATE INDEX "fields_tiddler_id_idx" ON "fields"("tiddler_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_groupsToroles_AB_unique" ON "_groupsToroles"("A", "B");

-- CreateIndex
CREATE INDEX "_groupsToroles_B_index" ON "_groupsToroles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_groupsTousers_AB_unique" ON "_groupsTousers"("A", "B");

-- CreateIndex
CREATE INDEX "_groupsTousers_B_index" ON "_groupsTousers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_permissionsToroles_AB_unique" ON "_permissionsToroles"("A", "B");

-- CreateIndex
CREATE INDEX "_permissionsToroles_B_index" ON "_permissionsToroles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_rolesTousers_AB_unique" ON "_rolesTousers"("A", "B");

-- CreateIndex
CREATE INDEX "_rolesTousers_B_index" ON "_rolesTousers"("B");

