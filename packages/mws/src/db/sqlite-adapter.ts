import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { ArgType, SqlDriverAdapter, SqlMigrationAwareDriverAdapterFactory, SqlQuery } from "@prisma/driver-adapter-utils";
import { readdir, readFile } from "fs/promises";
import { createHash, randomUUID } from "crypto";
import { existsSync, writeFileSync } from "fs";
import { dist_resolve } from "@tiddlywiki/server";
import { dirname } from "path";

const INIT_0_0 = "20250406213424_init";
const INIT_0_1 = "20250606001949_init";

export class SqliteAdapter {
  constructor(private databasePath: string, private isDevMode: boolean) {
    this.adapter = new PrismaBetterSqlite3({ url: "file:" + this.databasePath });
  }

  adapter!: SqlMigrationAwareDriverAdapterFactory;
  async init() {
    const libsql = await this.adapter.connect();

    // this is used to test the upgrade path
    if (process.env.RUN_FIRST_MWS_DB_SETUP_FOR_TESTING_0_0) {
      throw new Error("this is disabled");
      await libsql.executeScript(await readFile(dist_resolve(
        "../prisma-20250406/migrations/" + INIT_0_0 + "/migration.sql"
      ), "utf8"));
    } else if (process.env.RUN_FIRST_MWS_DB_SETUP_FOR_TESTING_0_1) {
      await libsql.executeScript(await readFile(dist_resolve(
        "../prisma/migrations/" + INIT_0_1 + "/migration.sql"
      ), "utf8"));
    }

    const tables = await libsql.queryRaw({
      sql: `SELECT tbl_name FROM sqlite_master WHERE type='table'`,
      args: [],
      argTypes: [],
    }).then(e => e?.rows as [string][] | undefined);

    const hasExisting = !!tables?.length;

    const hasMigrationsTable = !!tables?.length && !!tables?.some((e) => e[0] === "_prisma_migrations");

    if (hasExisting && !hasMigrationsTable) {
      console.log("Your database already contains tables. This is not supported.");
      console.log("If you expected this database to be empty, then make sure you specified the right database!");
      console.log("If this database is from the multi-wiki-support branch, you cannot use it with @tiddlywiki/mws.");
      console.log("If you upgraded from an old version of @tiddlwiki/mws 0.0.x, please install the latest 0.0 version instead.");
      process.exit(1);
    }

    if (!hasMigrationsTable) await this.createMigrationsTable(libsql);

    const applied_migrations = new Set(
      await libsql.queryRaw({
        sql: `Select migration_name from _prisma_migrations`,
        args: [],
        argTypes: [],
      }).then(e => e.rows.map(e => e[0] as string))
    );

    if (applied_migrations.has(INIT_0_0)) {
      console.log([
        "=======================================================================================",
        "The database you are trying to open is from a previous version of MWS.",
        "This version of MWS is no longer supported. It is an alpha version",
        "and you shouldn't be using it in production anyway. Please export any",
        "wikis you want to keep by opening them and downloading them as single-file",
        "wikis by clicking on the cloud status icon and then 'save snapshot for offline use'.",
        "",
        "To return to a usable version of this wiki, you may run ",
        "",
        "npm install @tiddlywiki/mws@0.0",
        "=======================================================================================",
      ].join("\n"))
      await this.checkMigrationsTable(libsql, hasExisting && !hasMigrationsTable, applied_migrations, "prisma-20250406", INIT_0_0);
      console.log("Your database is updated to the final version for 0.0.x");
      console.log("This database is for a previous version of MWS. We will now exit to prevent data loss.");
      console.log("=======================================================================================");
      process.exit(1);
    } else if (!applied_migrations.size || applied_migrations.has(INIT_0_1)) {
      await this.checkMigrationsTable(libsql, hasExisting && !hasMigrationsTable, applied_migrations, "prisma", INIT_0_1);
    } else if (this.isDevMode) {
      console.log([
        "===============================================================",
        "The database does not match the configured migrations. ",
        "Since you are in dev mode, you probably just need to ",
        "delete the store folder and init a new database.",
      ].join("\n"));
      process.exit(1);
    } else {
      console.log([
        "===============================================================",
        "Unknown migrations have been found in the database. ",
        "There is no way to guarentee the integrity of the database ",
        "under these conditions. The only way I know of that you ",
        "could be seeing this message is if you installed this verion ",
        "of MWS in a project either from the PR branch or from a newer ",
        "version of MWS. Please revert back to the version you had ",
        "installed before. The sqlite database can be opened manually ",
        "with any third-party SQLite tool to retrieve your data. ",
        "",
        "If you do this, make sure you keep all the files in the ",
        "store folder together, as they are all an integral part ",
        "of your sqlite database and deleting any of them manually ",
        "is very likely to cause data loss.",
        "===============================================================",
      ].join("\n"));

      process.exit(1);
    }

    await libsql.dispose();
  }
  async createMigrationsTable(libsql: SqlDriverAdapter) {
    await libsql.executeScript(
      'CREATE TABLE "_prisma_migrations" (\n' +
      '    "id"                    TEXT PRIMARY KEY NOT NULL,\n' +
      '    "checksum"              TEXT NOT NULL,\n' +
      '    "finished_at"           DATETIME,\n' +
      '    "migration_name"        TEXT NOT NULL,\n' +
      '    "logs"                  TEXT,\n' +
      '    "rolled_back_at"        DATETIME,\n' +
      '    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,\n' +
      '    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0\n' +
      ')',
    )
  }


  // prisma/migrations/20250508171144_init/migration.sql
  async checkMigrationsTable(
    libsql: SqlDriverAdapter,
    migrateExisting: boolean,
    applied_migrations: Set<string>,
    prismaFolder: string,
    initMigration: string
  ) {

    const migrations = await readdir(dist_resolve("../" + prismaFolder + "/migrations"));
    migrations.sort();

    const new_migrations = migrations.filter(m => !applied_migrations.has(m) && m !== "migration_lock.toml");
    if (!new_migrations.length) return;

    function generateChecksum(fileContent: string) {
      return createHash('sha256').update(fileContent).digest('hex');
    }

    console.log("New migrations found", new_migrations);

    for (const migration of new_migrations) {
      const migration_path = dist_resolve(`../${prismaFolder}/migrations/${migration}/migration.sql`);
      if (!existsSync(migration_path)) continue;

      const fileContent = await readFile(migration_path, 'utf-8');
      // this is the hard-coded name of the first migration.
      if (migrateExisting && migration === initMigration) {
        console.log("Existing migration", migration, "is already applied");
      } else {
        console.log("Applying migration", migration);
        await libsql.executeScript(fileContent);
      }

      await libsql.executeRaw(InsertStatement("_prisma_migrations", [
        {
          name: "id", value: randomUUID(),
          arity: "scalar", scalarType: "string", dbType: "TEXT",
        },
        {
          name: "migration_name", value: migration,
          arity: "scalar", scalarType: "string", dbType: "TEXT",
        },
        {
          name: "checksum", value: generateChecksum(fileContent),
          arity: "scalar", scalarType: "string", dbType: "TEXT",
        },
        {
          name: "finished_at", value: Date.now(),
          arity: "scalar", scalarType: "datetime", dbType: "DATETIME",
        },
        {
          name: "logs", value: null,
          arity: "scalar", scalarType: "string", dbType: "TEXT",
        },
        {
          name: "rolled_back_at", value: null,
          arity: "scalar", scalarType: "datetime", dbType: "DATETIME",
        },
        {
          name: "started_at", value: Date.now(),
          arity: "scalar", scalarType: "datetime", dbType: "DATETIME",
        },
        {
          name: "applied_steps_count", value: 1,
          arity: "scalar", scalarType: "int", dbType: "INTEGER",
        },
      ]));

    }
    console.log("Migrations applied", new_migrations);
  }

}

interface InsertArg extends ArgType {
  name: string;
  value: any;
}

function InsertStatement(table: string, args: InsertArg[]): SqlQuery {
  return {
    sql: 'INSERT INTO ' + table + ' (' +
      args.map(e => `"${e.name}"`).join(', ') +
      ') VALUES (' +
      args.map(() => `?`).join(', ') +
      ')',
    args: args.map(e => e.value),
    argTypes: args.map(({ arity, scalarType, dbType }) => {
      return { arity, scalarType, dbType, }
    }),
  }
}

