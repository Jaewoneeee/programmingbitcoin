const { FieldElement } = require("./field-element");

// 원본 examples.py의 doctest 예제를 JavaScript 실행 코드로 옮긴 파일이다.
// Python은 a + b 같은 연산자 오버로딩을 쓰지만 JavaScript는 클래스 연산자 오버로딩이 없어
// add, mul, pow 같은 명시적 메서드 호출로 같은 개념을 표현한다.

const a1 = new FieldElement(7, 13);
const b1 = new FieldElement(6, 13);
console.log("F_13 equality: FieldElement(7) == FieldElement(6)?", a1.equals(b1)); // false: 값이 다르므로 같은 유한체 원소가 아니다.
console.log("F_13 equality: FieldElement(7) == itself?", a1.equals(a1)); // true: 같은 객체이고 num/prime이 모두 같다.

console.log("Positive remainder: 7 % 3 =", 7 % 3); // 1: 일반적인 양수 나머지 예시다.
console.log("Mathematical modulo: -27 mod 13 =", ((BigInt(-27) % 13n) + 13n) % 13n); // 12n: 수학적 modulo로 음수를 보정한 결과다.

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
console.log("F_13 negative exponent: 7^-3 == 8?", a5.pow(-3).equals(b5)); // true: 음수 지수는 곱셈 역원을 이용한 거듭제곱이다.

//========

const a44 = new FieldElement(44, 57);
const a33 = new FieldElement(33, 57);

console.log(a44.add(a33).num);
console.log(a44.add(a33).toString());

const a9 = new FieldElement(9, 57);
const a29 = new FieldElement(29, 57);

console.log("🚀 ~ a9:", a9);
console.log("🚀 ~ a29:", a29);
console.log(a9.sub(a29).num);
