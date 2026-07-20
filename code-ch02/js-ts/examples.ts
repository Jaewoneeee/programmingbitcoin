import { Point } from "./ecc";

// 원본 examples.py의 doctest를 TypeScript로 옮긴 파일이다.
// Python의 p1 + p2는 TypeScript에서 p1.add(p2)로 표현한다.

const p1 = new Point(-1, -1, 5, 7);
console.log("Valid point:", p1.toString());

try {
    // (-1, -2)는 y^2 = x^3 + 5x + 7을 만족하지 않으므로 생성자에서 예외가 난다.
    new Point(-1, -2, 5, 7);
} catch (error) {
    console.log("Invalid point error:", (error as Error).message);
}

const p2 = new Point(-1, 1, 5, 7);
const inf = new Point(null, null, 5, 7);

// 무한원은 덧셈 항등원이다.
console.log("p1 + infinity =", p1.add(inf).toString());
console.log("infinity + p2 =", inf.add(p2).toString());

// 서로 역원인 두 점을 더하면 무한원이 된다.
console.log("p1 + p2 =", p1.add(p2).toString());
