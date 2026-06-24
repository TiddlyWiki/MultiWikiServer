-- CreateTable
CREATE TABLE "bag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "bag_permission" (
    "bag_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "level" TEXT NOT NULL,

    PRIMARY KEY ("bag_id", "role_id"),
    CONSTRAINT "bag_permission_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tiddler" (
    "bag_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "revision" BIGINT NOT NULL DEFAULT 0,
    "fields" JSONB NOT NULL,

    PRIMARY KEY ("bag_id", "title"),
    CONSTRAINT "tiddler_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tiddler_event" (
    "seq" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bag_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "tiddler_event_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "definition" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    CONSTRAINT "recipe_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recipe_permission" (
    "recipe_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "level" TEXT NOT NULL,

    PRIMARY KEY ("recipe_id", "role_id"),
    CONSTRAINT "recipe_permission_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recipe_bag" (
    "recipe_id" TEXT NOT NULL,
    "bag_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "is_writable" BOOLEAN NOT NULL,
    "info" JSONB,

    PRIMARY KEY ("recipe_id", "bag_id"),
    CONSTRAINT "recipe_bag_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_bag_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "plugin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "is_draft" BOOLEAN NOT NULL DEFAULT false,
    "draft_of" TEXT
);

-- CreateTable
CREATE TABLE "recipe_plugin" (
    "recipe_id" TEXT NOT NULL,
    "plugin_id" TEXT NOT NULL,
    "resolved_version" TEXT NOT NULL,

    PRIMARY KEY ("recipe_id", "plugin_id"),
    CONSTRAINT "recipe_plugin_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_plugin_plugin_id_fkey" FOREIGN KEY ("plugin_id") REFERENCES "plugin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
CREATE TABLE "_RolesToUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RolesToUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "roles" ("role_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RolesToUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "bag_name_key" ON "bag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_slug_key" ON "recipe"("slug");

-- CreateIndex
CREATE INDEX "tiddler_title_idx" ON "tiddler"("title");

-- CreateIndex
CREATE INDEX "tiddler_event_bag_id_seq_idx" ON "tiddler_event"("bag_id", "seq");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_name_version_key" ON "plugin"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_RolesToUsers_AB_unique" ON "_RolesToUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_RolesToUsers_B_index" ON "_RolesToUsers"("B");
