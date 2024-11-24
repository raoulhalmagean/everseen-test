// Time: 10 min

String.prototype.add = function () {
  return this.split(",")
    .map((n) => Number(n))
    .reduce((acc, n) => acc + n, 0);
};

String.prototype.mul = function () {
  return this.split(",")
    .map((n) => Number(n))
    .reduce((acc, n) => acc * n, 1);
};

console.log("1,2,3,4".add());
console.log("1,2,3,4".mul());
