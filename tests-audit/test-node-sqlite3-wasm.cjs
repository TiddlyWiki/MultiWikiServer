//@ts-check
/** @type {import("node-sqlite3-wasm")} */
const { Database } = require('node-sqlite3-wasm');
const { rmSync } = require("fs");
rmSync("./test-node-sqlite3-wasm.db", { force: true, recursive: true });

const db = new Database("./test-node-sqlite3-wasm.db", {});

db.exec(`
  CREATE TABLE test (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL
  );
  INSERT INTO test (name, age) VALUES
    ('Alice', 30),
    ('Bob', 25),
    ('Charlie', 35);

  INSERT INTO test (name, age) VALUES
    ('Grace', 29),
    ('Heidi', 31),
    ('Ivan', 27);
  INSERT INTO test (name, age) VALUES
    ('Judy', 33),
    ('Karl', 26),
    ('Leo', 34);
`);
if(true) {
  // this locks the database on the file system level
  const stmt = db.prepare("SELECT * FROM test WHERE age > ?");
  const iter = stmt.iterate(30);
  iter.next(); // pull the first row
  throw "done";
}
if(true) {

  const stmt = db.prepare("SELECT * FROM test WHERE age > ?");
  const iter = stmt.iterate(30);
  iter.next(); // pull the first row
  // stmt.finalize(); // finalize the statement
  // const db2 = new Database("./test.db", {});
  // const stmt2 = db2.prepare("SELECT * FROM test WHERE age > ?");
  // const iter2 = stmt2.iterate(30);
  // console.log(Array.from(iter2)); // throws "database is locked"
}
// {
//   console.log(db.inTransaction);
//   const stmt = db.prepare(`
//     INSERT INTO test (name, age) VALUES
//       ('David', 40),
//       ('Eve', 28),
//       ('Frank', 32);
//   `);
//   stmt.run();
// }



// db.close();
