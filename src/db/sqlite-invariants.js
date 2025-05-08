import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { readFileSync, rmSync } from "fs";

try { rmSync("./test.sqlite"); } catch(e) {}

const adapter = new PrismaBetterSQLite3({ url: "file:test.sqlite" });

const libsql = await adapter.connect();
// load the sqlite migration file into this database
await libsql.executeScript(readFileSync("prisma/migrations/20250508153442_/migration.sql", "utf8"));
// When the journal_mode is set by one connection, it will effect all future connections.
// Most other pragma cannot be set outside of the specific connection, but better-sqlite3 
// has better defaults than normal sqlite.
await libsql.executeRaw({ sql: "PRAGMA journal_mode=wal", args: [], argTypes: [] });

const tables = await libsql.queryRaw({
  sql: `SELECT tbl_name FROM sqlite_master WHERE type='table'`,
  args: [],
  argTypes: [],
}).then(e => e?.rows);

await libsql.dispose(); // cleanup the connection

const prisma = new PrismaClient({ adapter });

console.log("Can recipes be sorted in creation order? This checks UUIDv7 behavior.")
await prisma.$transaction(async prisma => {
  for(let i = 0; i < 1000; i++) {
    await prisma.recipes.create({
      data: {
        recipe_name: "test" + i,
        description: "test",
      }
    });
    await new Promise(r => setTimeout(r, 3));
  }
  const rows = await prisma.recipes.findMany({ orderBy: { recipe_id: "desc" } });
  // should print true
  console.log("Sorted in creation order:", rows.reverse().every((e, i) => e.recipe_name === "test" + i)) 
});
await prisma.$disconnect(); // this will cleanup the wal and shm files
try { rmSync("./test.sqlite"); } catch(e) {}
