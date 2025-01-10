import { EventEmitter } from "events";
import readline from "readline";
import createServer from "./server.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new EventEmitter();
const server = createServer(client);

server.on("response", (resp) => {
  process.stdout.write("\u001B[2J\u001B[0;0f");
  process.stdout.write(resp);
  process.stdout.write("\n> ");
});

let command, args;
rl.on("line", (input) => {
  [command, ...args] = input.split(" ");
  client.emit("command", command, args);
});
