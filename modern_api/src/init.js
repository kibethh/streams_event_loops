import { faker } from "@faker-js/faker";
import sqlite3 from "sqlite3";
import { promisify } from "node:util";

const connection = sqlite3.verbose();
// const db = new connection.Database(":memory:");
const db = new connection.Database("db");

const promisifiedSerialize = promisify(db.serialize.bind(db));
const promisifiedRun = promisify(db.run.bind(db));

console.time("database-insert");

await promisifiedSerialize;

await promisifiedRun("CREATE TABLE users (name TEXT, age NUMBER)");

function buildFakeUser() {
  const user = {
    name: faker.internet.displayName(),
    age: faker.number.int({ min: 22, max: 120 }),
  };

  return [user.name, user.age];
}

const promises = [];
for (let i = 0; i < 100; i++) {
  const user = buildFakeUser();
  promises.push(
    promisifiedRun(
      `INSERT INTO users(name, age) VALUES(${user.map((_) => "?").join(",")})`,
      user
    )
  );
}

await Promise.all(promises);

db.all("SELECT COUNT(rowid) as counter FROM users", (err, row) => {
  if (err) {
    console.error("Error reading from database", err);
    return;
  }
  console.log(row);
});

console.timeEnd("database-insert");
