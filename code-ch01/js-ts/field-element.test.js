const assert = require("node:assert/strict");
const { FieldElement, modPow } = require("./field-element");

// Python 원본 ecc.py의 FieldElementTest와 같은 기대값을 검사한다.
// 실행: node code-ch01/js-ts/field-element.test.js

{
    const a = new FieldElement(2, 31);
    const b = new FieldElement(2, 31);
    const c = new FieldElement(15, 31);
    assert.equal(a.equals(b), true);
    assert.equal(a.notEquals(c), true);
    assert.equal(a.notEquals(b), false);
}

{
    const a = new FieldElement(2, 31);
    const b = new FieldElement(15, 31);
    assert.equal(a.add(b).equals(new FieldElement(17, 31)), true);

    const c = new FieldElement(17, 31);
    const d = new FieldElement(21, 31);
    assert.equal(c.add(d).equals(new FieldElement(7, 31)), true);
}

{
    const a = new FieldElement(29, 31);
    const b = new FieldElement(4, 31);
    assert.equal(a.sub(b).equals(new FieldElement(25, 31)), true);

    const c = new FieldElement(15, 31);
    const d = new FieldElement(30, 31);
    assert.equal(c.sub(d).equals(new FieldElement(16, 31)), true);
}

{
    const a = new FieldElement(24, 31);
    const b = new FieldElement(19, 31);
    assert.equal(a.mul(b).equals(new FieldElement(22, 31)), true);
}

{
    const a = new FieldElement(17, 31);
    assert.equal(a.pow(3).equals(new FieldElement(15, 31)), true);

    const b = new FieldElement(5, 31);
    const c = new FieldElement(18, 31);
    assert.equal(b.pow(5).mul(c).equals(new FieldElement(16, 31)), true);
}

{
    const a = new FieldElement(3, 31);
    const b = new FieldElement(24, 31);
    assert.equal(a.div(b).equals(new FieldElement(4, 31)), true);

    const c = new FieldElement(17, 31);
    assert.equal(c.pow(-3).equals(new FieldElement(29, 31)), true);

    const d = new FieldElement(4, 31);
    const e = new FieldElement(11, 31);
    assert.equal(d.pow(-4).mul(e).equals(new FieldElement(13, 31)), true);
}

// answers.py의 연습문제 계산도 함께 확인한다.
assert.equal((44 + 33) % 57, 20);
assert.equal((((9 - 29) % 57) + 57) % 57, 37);
assert.equal((17 + 42 + 49) % 57, 51);
assert.equal((((52 - 30 - 38) % 57) + 57) % 57, 41);

assert.equal((95 * 45 * 31) % 97, 23);
assert.equal((17 * 13 * 19 * 44) % 97, 68);
assert.equal(Number((12n ** 7n * 77n ** 49n) % 97n), 63);

for (const prime of [7n, 11n, 17n, 31n]) {
    const values = Array.from({ length: Number(prime - 1n) }, (_, i) => modPow(BigInt(i + 1), prime - 1n, prime));
    assert.deepEqual(values, Array(values.length).fill(1n));
}

console.log("field-element tests passed: equality, add, sub, mul, pow, div, and chapter exercise answers");
