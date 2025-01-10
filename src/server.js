import { EventEmitter } from "events";

class Server extends EventEmitter {
  constructor(client) {
    super();
    this.tasks = {};
    // unique counter for todo
    this.taskId = 1;
    process.nextTick(() => {
      this.emit("response", "Type a command (help)");
    });

    this.client = client;
    client.on("command", (command, args) => {
      switch (command) {
        case "help":
        case "ls":
        case "add":
        case "delete":
          this[command](args);
          break;
        default:
          this.emit("response", "Command not found.");
      }
    });
  }

  help() {
    this.emit(
      "response",
      ` Commands:
      add todo
      ls
      delete :id
      `
    );
  }

  tasksString() {
    return Object.keys(this.tasks)
      .map((key) => {
        return `${key}: ${this.tasks[key]}`;
      })
      .join("\n");
  }

  add(args) {
    this.tasks[this.taskId] = args.join(" ");
    this.emit("response", `Added todo task ${this.taskId}`);
    this.taskId++;
  }

  ls() {
    this.emit("response", `Tasks:\n${this.tasksString()}`);
  }

  delete(args) {
    delete this.tasks[args[0]];
    this.emit("response", `Deleted task ${args[0]}`);
  }
}

const createServer = (client) => new Server(client);

export default createServer;
