import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { readFileSync, rmSync } from "fs";

try { rmSync("./test.sqlite"); } catch(e) {}

const adapter = new PrismaBetterSQLite3({ url: "file:test.sqlite" });

const libsql = await adapter.connect();
// load the sqlite migration file into this database
await libsql.executeScript(readFileSync("prisma/migrations/20250508171144_init/migration.sql", "utf8"));
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

const prisma = new PrismaClient({ adapter, log: ["query"] });

if(false) await prisma.$transaction(async prisma => {
  console.log("Can recipes be sorted in creation order? This checks UUIDv7 behavior.")
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
  console.log(rows);
  // should print true
  console.log("Sorted in creation order:", rows.reverse().every((e, i) => e.recipe_name === "test" + i))
});

await prisma.$transaction(async prisma => {
  console.log("Are we correctly checking bag acl for recipes?")
  const role = await prisma.roles.create({
    data: { role_name: "test1", }
  });
  const user = await prisma.users.create({
    data: {
      email: "", password: "", username: "test1",
      roles: { connect: { role_id: role.role_id } }
    }
  });
  const recipe1 = await prisma.recipes.create({
    data: { recipe_name: "test1", description: "", owner_id: user.owner_id },
  });
  const recipe2 = await prisma.recipes.create({
    data: { recipe_name: "test2", description: "", }
  });
  const bag1 = await prisma.bags.create({
    data: { bag_name: "test1", description: "", is_plugin: false }
  });
  const bag2 = await prisma.bags.create({
    data: { bag_name: "test2", description: "", is_plugin: false }
  });
  await prisma.recipe_bags.create({
    data: { position: 0, with_acl: false, bag_id: bag1.bag_id, recipe_id: recipe1.recipe_id }
  })
  await prisma.recipe_bags.create({
    data: { position: 0, with_acl: false, bag_id: bag2.bag_id, recipe_id: recipe2.recipe_id }
  })
  console.log(user.user_id, await prisma.recipes.findUnique({
    select: { recipe_id: true, recipe_name: true, owner_id: true },
    where: { recipe_name: "test2", recipe_bags: { every: { bag: { OR: [{ owner_id: user.user_id }] } } } }
  }));
});
await prisma.$disconnect(); // this will cleanup the wal and shm files
try { rmSync("./test.sqlite"); } catch(e) {}
