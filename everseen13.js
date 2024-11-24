// Time: 20 min

const cluster = require("node:cluster");
const http = require("node:http");
const process = require("node:process");
const url = require("url");
const fs = require("node:fs");
const stream = require("stream");
const readline = require("node:readline");

const ENDPOINT = "/logparser";
const PORT = 3000;

const args = process.argv.slice(2);
let reqCounter = 0;

let maxReq = 50;
let workers = 4;

for (let i = 0; i < args.length - 1; i++) {
  if (args[i] === "-f") {
    files.push(args[i + 1]);
  } else if (args[i] === "-l") {
    levels.push(args[i + 1]);
  } else if (args[i] === "-s") {
    search = args[i + 1];
  }
}

const LOG_RE =
  /(?<date>\d{4}-\d{2}-\d{2})\s+(?<time>\d{2}:\d{2}:\d{2}.\d{3})(?<tz>(\+|-)\d{2}:\d{2})\s+(?<level>INFO|DEBUG|ERROR)\s(?<message>.*)/i;

// NOTE: from stackoverflow
async function* concat(readables) {
  for (const readable of readables) {
    for await (const chunk of readable) {
      yield chunk;
    }
  }
}

async function* parse(files, levels = [], pattern) {
  const logLevels = levels.map((l) => l.toLowerCase());
  const readStream = stream.Readable.from(
    concat(files.map((f) => fs.createReadStream(f)))
  );

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const parsedLine = line.match(LOG_RE).groups;
    if (
      (logLevels.length &&
        !logLevels.includes(parsedLine.level.toLowerCase())) ||
      (pattern && !pattern.test(parsedLine.message))
    )
      continue;
    yield parsedLine;
  }
}

function createServer() {
  const server = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);
    if (reqUrl.pathname === ENDPOINT && req.method === "POST") {
      console.log(
        "PID:" +
          process.pid +
          " Request type: " +
          req.method +
          " Endpoint: " +
          req.url
      );
      console.log(reqCounter);
      if (maxReq && reqCounter >= maxReq) {
        res.statusCode = 429;
        return res.end();
      }

      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        const { f, l, s } = JSON.parse(body || "{}");
        const search = s ? new RegExp(s, "i") : null;
        const files = f || [];
        const levels = l || [];

        if (!files.length) {
          res.statusCode = 400;
          return res.end();
        }

        res.setHeader("content-Type", "Application/json");
        res.statusCode = 201;

        res.write("[");

        const it = parse(files, levels, search);
        let next = await it.next();
        while (!next.done) {
          res.write(JSON.stringify(next.value, null, 2));
          next = await it.next();
          if (!next.done) {
            res.write(",");
          }
        }

        reqCounter++;
        res.end("]");
      });
    }
  });

  server.listen(PORT);
  setInterval(() => {
    reqCounter = 0;
  }, 2000);

  return server;
}

(async () => {
  if (require.main === module) {
    if (args.length) {
      for await (const s of parse(
        files,
        levels,
        s ? new RegExp(s, "i") : null
      )) {
        console.log(JSON.stringify(s, null, 2));
      }
    } else {
      if (cluster.isPrimary) {
        console.log(`Primary ${process.pid} is running`);

        for (let i = 0; i < workers; i++) {
          cluster.fork();
        }

        console.log(`Server running at http://localhost:${PORT}`);

        cluster.on("exit", (worker, code, signal) => {
          console.log(`worker ${worker.process.pid} died`);
        });
      } else {
        createServer(PORT);
        console.log(`Worker ${process.pid} started`);
      }
    }
  }
})();
