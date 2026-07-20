const { Point } = require("./ecc");

// 원본 examples.py의 doctest를 JavaScript 실행 코드로 옮긴 파일이다.
// Python은 p1 + p2처럼 연산자 오버로딩을 사용하지만, JavaScript에서는 p1.add(p2)로 표현한다.

const p1 = new Point(-1, -1, 5, 7);
console.log("Valid point:", p1.toString()); // Point(-1,-1)_5_7

try {
    // (-1, -2)는 y^2 = x^3 + 5x + 7을 만족하지 않는다.
    // 생성자에서 바로 검증하므로 잘못된 점은 Point 인스턴스가 될 수 없다.
    new Point(-1, -2, 5, 7);
} catch (error) {
    console.log("Invalid point error:", error.message);
}

const p2 = new Point(-1, 1, 5, 7);
const inf = new Point(null, null, 5, 7);

// 무한원은 덧셈의 항등원이다.
console.log("p1 + infinity =", p1.add(inf).toString()); // Point(-1,-1)_5_7
console.log("infinity + p2 =", inf.add(p2).toString()); // Point(-1,1)_5_7

// 같은 x좌표에 y값만 부호가 반대인 두 점은 서로 역원이다.
// 두 점을 더하면 무한원이 된다.
console.log("p1 + p2 =", p1.add(p2).toString()); // Point(infinity)
