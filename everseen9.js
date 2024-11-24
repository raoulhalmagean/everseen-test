// Time: 30 min

const http = require("http");
const url = require("url");
const fs = require("node:fs");
const stream = require("stream");
const readline = require("node:readline");

const ENDPOINT = "/logparser";
const PORT = 3000;

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

if (require.main === module) {
  const server = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);
    if (reqUrl.pathname === ENDPOINT && req.method === "POST") {
      console.log("Request type: " + req.method + " Endpoint: " + req.url);

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
          res.setHeader("content-Type", "Application/json");
          res.statusCode = 400;
          return res.end();
        }

        res.setHeader("content-Type", "Application/json");
        res.statusCode = 201;

        res.write("[");

        const it = parse(files, levels, search);
        let next;
        do {
          next = await it.next();
          if (next.value) res.write(JSON.stringify(next.value, null, 2));
          if (!next.done) {
            res.write(",");
          }
        } while (!next.done);

        res.end("]");
      });
    }
  });

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
