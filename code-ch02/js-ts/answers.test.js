const assert = require("node:assert/strict");
const answers = require("./answers");
const { Point } = require("./ecc");

assert.deepEqual(answers.exercise1(), [false, true, true, false]);
assert.equal(answers.answer2NotEquals(), true);
assert.equal(answers.answer3AdditiveInverse().equals(new Point(null, null, 5, 7)), true);
assert.deepEqual(answers.exercise4(), [3, -7]);
assert.equal(answers.answer5DifferentX().equals(new Point(3, -7, 5, 7)), true);
assert.deepEqual(answers.exercise6(), [18, 77]);
assert.equal(answers.answer7Doubling().equals(new Point(18, 77, 5, 7)), true);

console.log("answers tests passed: exercises 1-7 match answers.py");
