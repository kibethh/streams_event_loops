import logUpdate from "log-update";
//var logUpdate = require("log-update");

const toEmoji = () => "⌛";

var wait = (sec) =>
  new Promise((resolves) => {
    setTimeout(resolves, sec * 1000);
  });

var tasks = [
  wait(6),
  wait(9),
  wait(3),
  wait(4),
  wait(5),
  wait(3),
  wait(7),
  wait(5),
  wait(6),
  wait(10),
];

class PromiseQueue {
  constructor(promises = [], concurrentCount = 1) {
    this.concurrent = concurrentCount;
    this.total = promises.length;
    this.todo = promises;
    this.running = [];
    this.done = [];
  }

  get runNewTask() {
    return this.running.length < this.concurrent && this.todo.length;
  }

  logTasks() {
    const { todo, running, done } = this;
    logUpdate(`

    todo: [${todo.map(toEmoji)}]
    running: [${running.map(toEmoji)}]
    done: [${done.map(toEmoji)}]

    `);
  }

  run() {
    while (this.runNewTask) {
      const promise = this.todo.shift();
      this.running.push(promise);
      this.logTasks();

      promise
        .then(() => {
          this.done.push(promise);
        })
        .catch(console.error)
        .finally(() => {
          this.running = this.running.filter((p) => p !== promise);
          this.logTasks();
          this.run();
        });
    }
  }
}

var taskQueue = new PromiseQueue(tasks, 2);
taskQueue.run();

console.log('Before');

// Callback-based approach
//
// getUser(1, (user) => {
//   getRepositories(user.gitHubUsername, (repos) => {
//     getCommits(repos[0], (commits) => {
//       console.log(commits);
//     })
//   })
// });

// Promise-based approach
getUser(1)
  .then(user => getRepositories(user.gitHubUsername))
  .then(repos => getCommits(repos[0]))
  .then(commits => console.log('Commits', commits))
  .catch(err => console.log('Error', err.message));


console.log('After');

function getUser(id) {
  return new Promise((resolve, reject) => {
    // Kick off some async work 
    setTimeout(() => {
      console.log('Reading a user from a database...');
      resolve({ id: id, gitHubUsername: 'mosh' });
    }, 2000);
  });
}

function getRepositories(username) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Calling GitHub API...');
      resolve(['repo1', 'repo2', 'repo3']);
    }, 2000);  
  });
}

function getCommits(repo) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Calling GitHub API...');
      resolve(['commit']);
    }, 2000);
  });
}