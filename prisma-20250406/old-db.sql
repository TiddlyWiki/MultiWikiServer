
		-- Users table
		CREATE TABLE IF NOT EXISTS users (
			user_id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			created_at TEXT DEFAULT (datetime('now')),
			last_login TEXT
		);

		-- User Session  table
		CREATE TABLE IF NOT EXISTS sessions (
			user_id INTEGER NOT NULL,
			session_id TEXT NOT NULL,
			created_at TEXT NOT NULL,
			last_accessed TEXT NOT NULL,
			PRIMARY KEY (session_id),
			FOREIGN KEY (user_id) REFERENCES users(user_id)
		);

		-- Groups table
		CREATE TABLE IF NOT EXISTS groups (
			group_id INTEGER PRIMARY KEY AUTOINCREMENT,
			group_name TEXT UNIQUE NOT NULL,
			description TEXT
		);

		-- Roles table
		CREATE TABLE IF NOT EXISTS roles (
			role_id INTEGER PRIMARY KEY AUTOINCREMENT,
			role_name TEXT UNIQUE NOT NULL,
			description TEXT
		);

		-- Permissions table
		CREATE TABLE IF NOT EXISTS permissions (
			permission_id INTEGER PRIMARY KEY AUTOINCREMENT,
			permission_name TEXT UNIQUE NOT NULL,
			description TEXT
		);

		-- User-Group association table
		CREATE TABLE IF NOT EXISTS user_groups (
			user_id INTEGER,
			group_id INTEGER,
			PRIMARY KEY (user_id, group_id),
			FOREIGN KEY (user_id) REFERENCES users(user_id),
			FOREIGN KEY (group_id) REFERENCES groups(group_id)
		);

		-- User-Role association table
		CREATE TABLE IF NOT EXISTS user_roles (
			user_id INTEGER,
			role_id INTEGER,
			PRIMARY KEY (user_id, role_id),
			FOREIGN KEY (user_id) REFERENCES users(user_id),
			FOREIGN KEY (role_id) REFERENCES roles(role_id)
		);

		-- Group-Role association table
		CREATE TABLE IF NOT EXISTS group_roles (
			group_id INTEGER,
			role_id INTEGER,
			PRIMARY KEY (group_id, role_id),
			FOREIGN KEY (group_id) REFERENCES groups(group_id),
			FOREIGN KEY (role_id) REFERENCES roles(role_id)
		);

		-- Role-Permission association table
		CREATE TABLE IF NOT EXISTS role_permissions (
			role_id INTEGER,
			permission_id INTEGER,
			PRIMARY KEY (role_id, permission_id),
			FOREIGN KEY (role_id) REFERENCES roles(role_id),
			FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
		);

		-- Bags have names and access control settings
		CREATE TABLE IF NOT EXISTS bags (
			bag_id INTEGER PRIMARY KEY AUTOINCREMENT,
			bag_name TEXT UNIQUE NOT NULL,
			accesscontrol TEXT NOT NULL,
			description TEXT NOT NULL
		);

		-- Recipes have names...
		CREATE TABLE IF NOT EXISTS recipes (
			recipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
			recipe_name TEXT UNIQUE NOT NULL,
			description TEXT NOT NULL,
			owner_id INTEGER,
			FOREIGN KEY (owner_id) REFERENCES users(user_id)
		);

		-- ...and recipes also have an ordered list of bags
		CREATE TABLE IF NOT EXISTS recipe_bags (
			recipe_id INTEGER NOT NULL,
			bag_id INTEGER NOT NULL,
			position INTEGER NOT NULL,
			FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON UPDATE CASCADE ON DELETE CASCADE,
			FOREIGN KEY (bag_id) REFERENCES bags(bag_id) ON UPDATE CASCADE ON DELETE CASCADE,
			UNIQUE (recipe_id, bag_id)
		);

		-- Tiddlers are contained in bags and have titles
		CREATE TABLE IF NOT EXISTS tiddlers (
			tiddler_id INTEGER PRIMARY KEY AUTOINCREMENT,
			bag_id INTEGER NOT NULL,
			title TEXT NOT NULL,
			is_deleted BOOLEAN NOT NULL,
			attachment_blob TEXT, -- null or the name of an attachment blob
			FOREIGN KEY (bag_id) REFERENCES bags(bag_id) ON UPDATE CASCADE ON DELETE CASCADE,
			UNIQUE (bag_id, title)
		);

		-- Tiddlers also have unordered lists of fields, each of which has a name and associated value
		CREATE TABLE IF NOT EXISTS fields (
			tiddler_id INTEGER,
			field_name TEXT NOT NULL,
			field_value TEXT NOT NULL,
			FOREIGN KEY (tiddler_id) REFERENCES tiddlers(tiddler_id) ON UPDATE CASCADE ON DELETE CASCADE,
			UNIQUE (tiddler_id, field_name)
		);

		-- ACL table (using bag/recipe ids directly)
		CREATE TABLE IF NOT EXISTS acl (
			acl_id INTEGER PRIMARY KEY AUTOINCREMENT,
			entity_name TEXT NOT NULL,
			entity_type TEXT NOT NULL CHECK (entity_type IN ('bag', 'recipe')),
			role_id INTEGER,
			permission_id INTEGER,
			FOREIGN KEY (role_id) REFERENCES roles(role_id),
			FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
		);

		-- Indexes for performance (we can add more as needed based on query patterns)
		CREATE INDEX IF NOT EXISTS idx_tiddlers_bag_id ON tiddlers(bag_id);

		CREATE INDEX IF NOT EXISTS idx_fields_tiddler_id ON fields(tiddler_id);

		CREATE INDEX IF NOT EXISTS idx_recipe_bags_recipe_id ON recipe_bags(recipe_id);

		CREATE INDEX IF NOT EXISTS idx_acl_entity_id ON acl(entity_name);
