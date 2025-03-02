// Time: 20 min

const log = `
2020-01-02 01:02:03.100+05:00 DEBUG This is a dummy DEBUG message
2020-01-02 01:02:03.200+05:00 INFO This is a random INFO message
2020-01-02 01:02:03.300+05:00 ERROR This is an test ERROR message
2020-01-02 01:02:03.400+05:00 INFO This is a another random INFO message
2020-01-02 01:02:03.500+05:00 ERROR This is an different test ERROR message
2020-01-02 01:02:03.600+05:00 DEBUG This is a dummy test DEBUG message
`;

const LOG_RE =
  /(?<date>\d{4}-\d{2}-\d{2})\s+(?<time>\d{2}:\d{2}:\d{2}.\d{3})(?<tz>(\+|-)\d{2}:\d{2})\s+(?<level>INFO|DEBUG|ERROR)\s(?<message>.*)/;

log
  .split("\n")
  .filter((r) => r)
  .map((r) => {
    console.log(JSON.stringify(r.match(LOG_RE).groups));
  });
