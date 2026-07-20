const assert = require("node:assert/strict");
const { FieldElement, Point } = require("./ecc");

// Python 원본 ecc.py의 FieldElementTest와 PointTest를 Node assert로 옮긴 테스트다.
// 실행: node code-ch02/js-ts/ecc.test.js

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

{
    const a = new Point(3, -7, 5, 7);
    const b = new Point(18, 77, 5, 7);
    assert.equal(a.notEquals(b), true);
    assert.equal(a.notEquals(a), false);
}

{
    const a = new Point(null, null, 5, 7);
    const b = new Point(2, 5, 5, 7);
    const c = new Point(2, -5, 5, 7);
    assert.equal(a.add(b).equals(b), true);
    assert.equal(b.add(a).equals(b), true);
    assert.equal(b.add(c).equals(a), true);
}

{
    const a = new Point(3, 7, 5, 7);
    const b = new Point(-1, -1, 5, 7);
    assert.equal(a.add(b).equals(new Point(2, -5, 5, 7)), true);
}

{
    const a = new Point(-1, -1, 5, 7);
    assert.equal(a.add(a).equals(new Point(18, 77, 5, 7)), true);
}

assert.throws(() => new Point(-1, -2, 5, 7), /is not on the curve/);

console.log("ecc tests passed: FieldElement and Point behavior match chapter 2 Python tests");
