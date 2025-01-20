import { createServer } from "http";
import { stat, createReadStream, createWriteStream } from "fs";
import { promisify } from "util";
const fileName = "./the-universe.mp4";
const fileInfo = promisify(stat);

const resopndeWithVideoStream = async (req, res) => {
  const { size } = await fileInfo(fileName);

  const range = req.headers.range;

  if (range) {
    let [start, end] = range.replace(/bytes=/, "").split("-");
    start = parseInt(start);
    end = end ? parseInt(end) : size - 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Range": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "video/mp4",
    });
    createReadStream(fileName, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { "Content-Length": size, "Content-Type": "video/mp4" });
    createReadStream(fileName).pipe(res);
  }
};

createServer((req, res) => {
  if (req.method === "POST") {
    req.pipe(res);
    req.pipe(createWriteStream("./test-upload.file"));
  } else if (req.url === "/video") {
    resopndeWithVideoStream(req, res);
  } else {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
        <form enctype="multipart/form-data" method="POST" action="/">
        <input type="file" name="upload-file" />
        <button>Upload</button>
        </form>
      `);
  }
}).listen(3000, () => console.log("server is running on 3000"));
