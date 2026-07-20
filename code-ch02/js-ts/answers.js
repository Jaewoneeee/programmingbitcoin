const { Point } = require("./ecc");

function onCurve(x, y) {
    // Exercise 1: y^2 = x^3 + 5x + 7을 직접 대입해 곡선 위의 점인지 확인한다.
    return y ** 2 === x ** 3 + 5 * x + 7;
}

function exercise1() {
    // Python 답과 같은 순서: (2,4), (-1,-1), (18,77), (5,7).
    return [
        onCurve(2, 4),
        onCurve(-1, -1),
        onCurve(18, 77),
        onCurve(5, 7),
    ];
}

function answer2NotEquals() {
    // Exercise 2: Point.__ne__는 같음 비교의 반대다.
    const a = new Point(3, -7, 5, 7);
    const b = new Point(18, 77, 5, 7);
    return a.notEquals(b);
}

function answer3AdditiveInverse() {
    // Exercise 3: 같은 x좌표와 다른 y좌표를 가진 두 점은 서로 역원이다.
    // 결과는 타원곡선 군의 항등원인 무한원이다.
    const b = new Point(2, 5, 5, 7);
    const c = new Point(2, -5, 5, 7);
    return b.add(c);
}

function exercise4() {
    // Exercise 4: (2,5) + (-1,-1).
    // 서로 다른 두 점의 덧셈 공식 s=(y2-y1)/(x2-x1)을 그대로 적용한다.
    const x1 = 2;
    const y1 = 5;
    const x2 = -1;
    const y2 = -1;
    const s = (y2 - y1) / (x2 - x1);
    const x3 = s ** 2 - x1 - x2;
    const y3 = s * (x1 - x3) - y1;
    return [x3, y3];
}

function answer5DifferentX() {
    // Exercise 5: x1 != x2인 Point.add 분기 확인.
    return new Point(2, 5, 5, 7).add(new Point(-1, -1, 5, 7));
}

function exercise6() {
    // Exercise 6: (-1,-1) + (-1,-1).
    // 같은 점을 두 번 더하므로 접선 기울기 s=(3*x1^2+a)/(2*y1)를 사용한다.
    const a = 5;
    const x1 = -1;
    const y1 = -1;
    const s = (3 * x1 ** 2 + a) / (2 * y1);
    const x3 = s ** 2 - 2 * x1;
    const y3 = s * (x1 - x3) - y1;
    return [x3, y3];
}

function answer7Doubling() {
    // Exercise 7: P == P인 Point.add 분기 확인.
    const p = new Point(-1, -1, 5, 7);
    return p.add(p);
}

function printAnswers() {
    console.log("Exercise 1: points on y^2 = x^3 + 5x + 7");
    console.log("(2,4), (-1,-1), (18,77), (5,7) =", exercise1());

    console.log("Exercise 2: Point.notEquals =", answer2NotEquals());
    console.log("Exercise 3: additive inverse =", answer3AdditiveInverse().toString());
    console.log("Exercise 4: (2,5) + (-1,-1) =", exercise4());
    console.log("Exercise 5: Point.add with x1 != x2 =", answer5DifferentX().toString());
    console.log("Exercise 6: (-1,-1) + (-1,-1) =", exercise6());
    console.log("Exercise 7: Point.add doubling =", answer7Doubling().toString());
}

if (require.main === module) {
    printAnswers();
}

module.exports = {
    onCurve,
    exercise1,
    answer2NotEquals,
    answer3AdditiveInverse,
    exercise4,
    answer5DifferentX,
    exercise6,
    answer7Doubling,
    printAnswers,
};
