import { pipeline } from "node:stream/promises";
import { setTimeout } from "node:timers/promises";

async function* myReadable() {
  yield Buffer.from("I am ");
  await setTimeout(150);
  yield Buffer.from("Hkk.");
}

async function* myTransform(stream) {
  for await (const chunk of stream) {
    yield chunk.toString().toUpperCase();
  }
}

async function* myDuplex(stream) {
  let bytes = 0;
  const finalMessage = [];
  for await (const chunk of stream) {
    console.log("duplex: ", chunk);
    bytes += chunk.length;
    finalMessage.push(chunk);
  }

  yield `The final message is: ${finalMessage.join()}`;
  yield `Total bytes: ${bytes}`;
}

async function* myWritable(stream) {
  for await (const chunk of stream) {
    console.log("writable: ", chunk);
  }
}

await pipeline(myReadable, myTransform, myDuplex, myWritable);
