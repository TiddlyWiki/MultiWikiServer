//@ts-check
/** @type {import("better-sqlite3")} */
const Database = require('better-sqlite3');
const { rmSync } = require("fs");
const dbfile = "./test-better-sqlite3.db";
rmSync(dbfile, { force: true, recursive: true });

const db = new Database(dbfile, {});

// https://www.sqlite.org/pragma.html#pragma_journal_mode


if(true)
  db.pragma('journal_mode = WAL');
else
  // TRUNCATE and PRESERVE require keeping the rollback journal with the database file
  //better performance than delete
  db.pragma('journal_mode = TRUNCATE');

// https://www.sqlite.org/pragma.html#pragma_synchronous
db.pragma('synchronous = FULL');

db.pragma('foreign_keys = ON'); // enable foreign key constraints
// db.pragma('cache_size = 10000'); // set cache size to 10MB
// db.pragma('temp_store = MEMORY'); // use memory for temporary tables
// db.pragma('locking_mode = EXCLUSIVE'); // set locking mode to EXCLUSIVE
// db.pragma('busy_timeout = 5000'); // set busy timeout to 5 seconds
// db.pragma('cache_spill = 0'); // disable cache spill
// db.pragma('auto_vacuum = FULL'); // enable auto-vacuum mode
// db.pragma('page_size = 4096'); // set page size to 4KB
// db.pragma('secure_delete = ON'); // enable secure delete
// db.pragma('journal_size_limit = 1000000'); // set journal size limit to 1MB
// db.pragma('mmap_size = 100000000'); // set mmap size to 100MB
// db.pragma('wal_autocheckpoint = 1000'); // set WAL auto-checkpoint to 1000 pages
// db.pragma('wal_checkpoint = TRUNCATE'); // set WAL checkpoint mode to TRUNCATE
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
if(false) {
  // in better-sqlite3, this does not lock the database permenantly if we crash here.
  // the script can be run repeatedly without needing to delete the database file.
  const stmt = db.prepare("SELECT * FROM test WHERE age > ?");
  const iter = stmt.iterate(30);
  iter.next(); // pull the first row
  throw "done";
}
if(false) {
  // this checks what happens when we try to insert a row while a select statement is iterating
  // it throws "This database connection is busy executing a query"
  const stmt2 = db.prepare("SELECT * FROM test WHERE age > ?");
  console.log(1);
  const iter2 = stmt2.iterate(30);
  console.log(2);
  iter2.next(); // pull the first row
  console.log(3);
  const stmt1 = db.prepare(`INSERT INTO test (name, age) VALUES (@name, @age)`);
  console.log(4);
  stmt1.run({ name: 'David', age: 40 });
  console.log(5);
}
if(true) {
  // testing transaction behavior
  const insert = db.prepare('INSERT INTO test (name, age) VALUES (@name, @age)');
  const insertMany = db.transaction((people) => {
    for(const person of people) {
      insert.run(person);
      {
        // a separate connection will not see these changes until after the transaction is committed
        const db3 = new Database(dbfile, {});
        const stmt3 = db3.prepare("SELECT * FROM test WHERE age > ?");
        const iter3 = stmt3.iterate(30);
        console.log("c2", Array.from(iter3), db3.inTransaction);
      }
      {
        // but the same connection will see the changes
        const stmt3 = db.prepare("SELECT * FROM test WHERE age > ?");
        const iter3 = stmt3.iterate(30);
        console.log("c1", Array.from(iter3), db.inTransaction);
      }
      // this starts an infinite loop, of course
      // insertMany([
      //   { name: 'Joey', age: 37 },
      //   { name: 'Sally', age: 36 },
      //   { name: 'Junior', age: 35 },
      // ]);
    }
  });
  insertMany([
    { name: 'Joey', age: 37 },
    { name: 'Sally', age: 36 },
    { name: 'Junior', age: 35 },
  ]);
}
{
  const db3 = new Database(dbfile, {});
  const stmt3 = db3.prepare("SELECT * FROM test WHERE age > ?");
  const iter3 = stmt3.iterate(30);
  console.log("c1", Array.from(iter3));
}




// db.close();
