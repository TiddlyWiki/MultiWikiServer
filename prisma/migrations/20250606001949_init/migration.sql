-- CreateTable
CREATE TABLE "recipes" (
    "recipe_id" TEXT NOT NULL PRIMARY KEY,
    "recipe_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "owner_id" TEXT,
    "plugin_names" JSONB NOT NULL,
    "skip_required_plugins" BOOLEAN NOT NULL DEFAULT false,
    "skip_core" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "recipe_acl" (
    "acl_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role_id" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    CONSTRAINT "recipe_acl_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recipe_bags" (
    "recipe_id" TEXT NOT NULL,
    "bag_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "with_acl" BOOLEAN NOT NULL DEFAULT false,
    "load_modules" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "recipe_bags_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bags" ("bag_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_bags_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bags" (
    "bag_id" TEXT NOT NULL PRIMARY KEY,
    "bag_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "owner_id" TEXT
);

-- CreateTable
CREATE TABLE "bag_acl" (
    "acl_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bag_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    CONSTRAINT "bag_acl_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bags" ("bag_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tiddlers" (
    "revision_id" TEXT NOT NULL PRIMARY KEY,
    "bag_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL,
    "attachment_hash" TEXT,
    CONSTRAINT "tiddlers_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bags" ("bag_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fields" (
    "revision_id" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_value" TEXT NOT NULL,

    PRIMARY KEY ("revision_id", "field_name"),
    CONSTRAINT "fields_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "tiddlers" ("revision_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "groups" (
    "group_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "group_name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" TEXT NOT NULL PRIMARY KEY,
    "role_name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" DATETIME
);

-- CreateTable
CREATE TABLE "sessions" (
    "session_id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_accessed" DATETIME NOT NULL,
    "session_key" TEXT,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "_GroupsToRoles" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GroupsToRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "groups" ("group_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GroupsToRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "roles" ("role_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GroupsToUsers" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GroupsToUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "groups" ("group_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GroupsToUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RolesToUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RolesToUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "roles" ("role_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RolesToUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "recipes_recipe_name_key" ON "recipes"("recipe_name");

-- CreateIndex
CREATE INDEX "recipe_bags_recipe_id_idx" ON "recipe_bags"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_bags_recipe_id_bag_id_key" ON "recipe_bags"("recipe_id", "bag_id");

-- CreateIndex
CREATE UNIQUE INDEX "bags_bag_name_key" ON "bags"("bag_name");

-- CreateIndex
CREATE INDEX "tiddlers_bag_id_idx" ON "tiddlers"("bag_id");

-- CreateIndex
CREATE UNIQUE INDEX "tiddlers_bag_id_title_key" ON "tiddlers"("bag_id", "title");

-- CreateIndex
CREATE INDEX "fields_revision_id_idx" ON "fields"("revision_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_group_name_key" ON "groups"("group_name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupsToRoles_AB_unique" ON "_GroupsToRoles"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupsToRoles_B_index" ON "_GroupsToRoles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupsToUsers_AB_unique" ON "_GroupsToUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupsToUsers_B_index" ON "_GroupsToUsers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RolesToUsers_AB_unique" ON "_RolesToUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_RolesToUsers_B_index" ON "_RolesToUsers"("B");
