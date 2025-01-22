import sqlite3 from "sqlite3";
import { promisify } from "node:util";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { createWriteStream } from "node:fs";

const connection = sqlite3.verbose();
const db = new connection.Database("db");
const promisifiedSerialize = promisify(db.serialize.bind(db));
const promisifiedRun = promisify(db.run.bind(db));
const promisifiedAll = promisify(db.all.bind(db));

await promisifiedSerialize();

async function* findAllStream() {
  let pageLimit = 10;
  let skip = 0;
  while (true) {
    const data = await promisifiedAll(
      `SELECT * FROM users LIMIT ${pageLimit} OFFSET ${skip}`
    );
    skip += pageLimit;
    if (!data.length) break;
    for (const item of data) yield item;
  }
}

const stream = Readable.from(findAllStream())
  .filter(({ age }) => age > 30 && age < 40)
  .map(async (item) => {
    const name = await Promise.resolve(item.name.toUpperCase());
    return {
      ...item,
      name,
      editedAt: new Date().toISOString(),
    };
  })
  .map((item) => {
    return JSON.stringify(item).concat("\n");
  });

await pipeline(stream, createWriteStream("output.json"));

// stream.forEach((item) => console.log(item));
// for await (const item of stream) {
//   console.log(item);
// }
