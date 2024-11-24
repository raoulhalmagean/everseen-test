// Time: 10 min

function* counter(n, x) {
  let i = 0;
  for (let i = 0; i < n * x; i++) {
    yield i % n;
  }
}

for (const v of counter(5, 2)) {
  console.log(v);
}
