const assert = require('node:assert/strict');
const answers = require('./answers');

assert.deepEqual(answers.exercise2(), [20n, 37n, 51n, 41n]);
assert.deepEqual(answers.exercise4(), [23n, 68n, 63n]);
assert.deepEqual(answers.exercise5Unsorted(), [
  [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n, 17n, 18n],
  [0n, 3n, 6n, 9n, 12n, 15n, 18n, 2n, 5n, 8n, 11n, 14n, 17n, 1n, 4n, 7n, 10n, 13n, 16n],
  [0n, 7n, 14n, 2n, 9n, 16n, 4n, 11n, 18n, 6n, 13n, 1n, 8n, 15n, 3n, 10n, 17n, 5n, 12n],
  [0n, 13n, 7n, 1n, 14n, 8n, 2n, 15n, 9n, 3n, 16n, 10n, 4n, 17n, 11n, 5n, 18n, 12n, 6n],
  [0n, 18n, 17n, 16n, 15n, 14n, 13n, 12n, 11n, 10n, 9n, 8n, 7n, 6n, 5n, 4n, 3n, 2n, 1n],
]);

for (const sortedSet of answers.exercise5Sorted()) {
  assert.deepEqual(sortedSet, [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n, 17n, 18n]);
}

assert.deepEqual(answers.exercise7().map((values) => values.every((value) => value === 1n)), [true, true, true, true]);
assert.deepEqual(answers.exercise8(), [4n, 29n, 13n]);
assert.equal(answers.answer1NotEquals(), true);
assert.equal(answers.answer3Sub().toString(), 'FieldElement_31(25)');
assert.equal(answers.answer6Mul().toString(), 'FieldElement_31(22)');
assert.equal(answers.answer9Div().toString(), 'FieldElement_31(4)');

console.log('answers tests passed: exercises 1-9 match answers.py');
