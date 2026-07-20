import { FieldElement, mod } from "./field-element";

// 원본 examples.py를 TypeScript로 옮긴 파일이다.
// 핵심 차이는 Python의 연산자 오버로딩 대신 메서드 호출을 사용한다는 점이다.

const a1 = new FieldElement(7, 13);
const b1 = new FieldElement(6, 13);
console.log("F_13 equality: FieldElement(7) == FieldElement(6)?", a1.equals(b1)); // false
console.log("F_13 equality: FieldElement(7) == itself?", a1.equals(a1)); // true

console.log("Positive remainder: 7 % 3 =", 7 % 3); // 1
console.log("Mathematical modulo: -27 mod 13 =", mod(-27n, 13n)); // 12n: 음수도 0..p-1 범위로 감싼다.

const a2 = new FieldElement(7, 13);
const b2 = new FieldElement(12, 13);
const c2 = new FieldElement(6, 13);
console.log("F_13 addition: 7 + 12 == 6?", a2.add(b2).equals(c2)); // true: (7 + 12) % 13 = 6

const a3 = new FieldElement(3, 13);
const b3 = new FieldElement(12, 13);
const c3 = new FieldElement(10, 13);
console.log("F_13 multiplication: 3 * 12 == 10?", a3.mul(b3).equals(c3)); // true: (3 * 12) % 13 = 10

const a4 = new FieldElement(3, 13);
const b4 = new FieldElement(1, 13);
console.log("F_13 exponentiation: 3^3 == 1?", a4.pow(3).equals(b4)); // true: 3^3 % 13 = 1

const a5 = new FieldElement(7, 13);
const b5 = new FieldElement(8, 13);
console.log("F_13 negative exponent: 7^-3 == 8?", a5.pow(-3).equals(b5)); // true: 7^-3 in F_13 = 8
