// Time: 30 min

const fs = require("node:fs");
const readline = require("node:readline");

const LOG_RE =
  /(?<date>\d{4}-\d{2}-\d{2})\s+(?<time>\d{2}:\d{2}:\d{2}.\d{3})(?<tz>(\+|-)\d{2}:\d{2})\s+(?<level>INFO|DEBUG|ERROR)\s(?<message>.*)/i;

function parse(logFile, levels = [], pattern) {
  const logLevels = levels.map((l) => l.toLowerCase());
  const readStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  rl.on("line", (line) => {
    const parsedLine = line.match(LOG_RE).groups;
    if (
      !logLevels.includes(parsedLine.level.toLowerCase()) ||
      (pattern && !pattern.test(parsedLine.message))
    )
      return;

    console.log(JSON.stringify(parsedLine, null, 2));
  });
}

async function* itaratorParse(logFile, levels = [], pattern) {
  const logLevels = levels.map((l) => l.toLowerCase());
  const readStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const parsedLine = line.match(LOG_RE).groups;
    if (
      !logLevels.includes(parsedLine.level.toLowerCase()) ||
      (pattern && !pattern.test(parsedLine.message))
    )
      continue;
    yield parsedLine;
  }
}

(async () => {
  for await (const s of itaratorParse("in1.log", ["error", "info"], /test/i)) {
    console.log(JSON.stringify(s, null, 2));
  }
})();
