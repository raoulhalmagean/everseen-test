// Time: 20 min

const fs = require("node:fs");
const readline = require("node:readline");

const args = process.argv.slice(2);

let files = [];
let levels = [];
let search = null;
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

  rl.on("error", (err) => {
    console.error(err.message);
  });
}

module.exports = { parse };

if (require.main === module) {
  for (const file of files) {
    parse(file, levels, new RegExp(search, "i"));
  }
}
