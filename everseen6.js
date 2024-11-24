// Time: 10 min

const fs = require("node:fs");
const readline = require("node:readline");

const LOG_RE =
  /(?<date>\d{4}-\d{2}-\d{2})\s+(?<time>\d{2}:\d{2}:\d{2}.\d{3})(?<tz>(\+|-)\d{2}:\d{2})\s+(?<level>INFO|DEBUG|ERROR)\s(?<message>.*)/;

function parse(logFile) {
  const readStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  rl.on("line", (line) => {
    console.log(JSON.stringify(line.match(LOG_RE).groups, null, 2));
  });
}

parse("./in1.log");
