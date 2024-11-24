// Time: 10 min

const fs = require("fs");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const promiseWriteFile = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

async function fetchData() {
  await sleep(1000);
  if (Math.random() < 0.2) throw new Error("fetch error");
  else return { fake: "data" };
}

async function processData(data) {
  await sleep(1000);
  if (Math.random() < 0.2) throw new Error("process error");
  else return { fake: "processed " + data.fake };
}

async function process() {
  const data = await fetchData();
  return processData(data);
}

(async () => {
  try {
    const data = await process();
    await promiseWriteFile("out.json", JSON.stringify(data));
    console.log("done");
  } catch (err) {
    console.error("Error processing data", err);
  }
})();
