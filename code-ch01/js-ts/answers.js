const { FieldElement, mod, modPow } = require("./field-element");

function exercise2() {
    const prime = 57n;

    // Exercise 2: F_57에서 덧셈과 뺄셈을 계산한다.
    // 결과가 음수가 되거나 57 이상이 되면 modulo로 0..56 범위에 다시 넣는다.
    return [mod(44n + 33n, prime), mod(9n - 29n, prime), mod(17n + 42n + 49n, prime), mod(52n - 30n - 38n, prime)];
}

function exercise4() {
    const prime = 97n;

    // Exercise 4: F_97에서 곱셈과 거듭제곱을 계산한다.
    // BigInt의 ** 연산을 써도 되지만, 유한체 관점에서는 modPow처럼 매 단계 modulo를 취하는 편이 안전하다.
    return [
        mod(95n * 45n * 31n, prime),
        mod(17n * 13n * 19n * 44n, prime),
        mod(modPow(12n, 7n, prime) * modPow(77n, 49n, prime), prime),
    ];
}

function exercise5Unsorted() {
    const prime = 19n;

    // Exercise 5: k를 0..18 각각에 곱한 뒤 F_19 안으로 감싼다.
    // k가 0이 아니고 prime과 서로소이면, 순서만 바뀔 뿐 모든 원소가 한 번씩 나온다.
    return [1n, 3n, 7n, 13n, 18n].map((k) => range(Number(prime)).map((i) => mod(k * BigInt(i), prime)));
}

function exercise5Sorted() {
    // 정렬해 보면 각 k가 만든 집합이 모두 F_19 전체와 같다는 것을 확인할 수 있다.
    return exercise5Unsorted().map((values) => [...values].sort(compareBigInt));
}

function exercise7() {
    // Exercise 7: 페르마의 소정리 확인.
    // prime이 소수이고 i가 1..p-1이면 i^(p-1) mod p는 항상 1이다.
    return [7n, 11n, 17n, 31n].map((prime) =>
        range(Number(prime - 1n)).map((i) => modPow(BigInt(i + 1), prime - 1n, prime)),
    );
}

function exercise8() {
    const prime = 31n;

    // Exercise 8: F_31의 나눗셈과 음수 지수.
    // 3 / 24는 3 * 24^(31-2)와 같고, a^-n은 a^(p-1-n)으로 바꿔 계산할 수 있다.
    return [
        mod(3n * modPow(24n, prime - 2n, prime), prime),
        modPow(17n, prime - 4n, prime),
        mod(modPow(4n, prime - 5n, prime) * 11n, prime),
    ];
}

function answer1NotEquals() {
    // Exercise 1의 __ne__ 답: 같음 비교의 반대를 반환한다.
    const a = new FieldElement(2, 31);
    const b = new FieldElement(15, 31);
    return a.notEquals(b);
}

function answer3Sub() {
    // Exercise 3의 __sub__ 답: (29 - 4) mod 31 = 25.
    return new FieldElement(29, 31).sub(new FieldElement(4, 31));
}

function answer6Mul() {
    // Exercise 6의 __mul__ 답: (24 * 19) mod 31 = 22.
    return new FieldElement(24, 31).mul(new FieldElement(19, 31));
}

function answer9Div() {
    // Exercise 9의 __truediv__ 답: 3 / 24는 3에 24의 곱셈 역원을 곱한다.
    return new FieldElement(3, 31).div(new FieldElement(24, 31));
}

function range(length) {
    return Array.from({ length }, (_, i) => i);
}

function compareBigInt(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

function formatArray(values) {
    return `[${values.map((value) => value.toString()).join(", ")}]`;
}

function printAnswers() {
    console.log("Exercise 1 answer (__ne__): FieldElement(2) != FieldElement(15)?", answer1NotEquals());

    console.log("Exercise 2 answers in F_57:");
    console.log("44 + 33 =", exercise2()[0].toString());
    console.log("9 - 29 =", exercise2()[1].toString());
    console.log("17 + 42 + 49 =", exercise2()[2].toString());
    console.log("52 - 30 - 38 =", exercise2()[3].toString());

    console.log("Exercise 3 answer (__sub__): 29 - 4 in F_31 =", answer3Sub().toString());

    console.log("Exercise 4 answers in F_97:");
    console.log("95 * 45 * 31 =", exercise4()[0].toString());
    console.log("17 * 13 * 19 * 44 =", exercise4()[1].toString());
    console.log("12^7 * 77^49 =", exercise4()[2].toString());

    console.log("Exercise 5 answers in F_19:");
    for (const values of exercise5Unsorted()) {
        console.log(formatArray(values));
    }
    console.log("Exercise 5 sorted sets in F_19:");
    for (const values of exercise5Sorted()) {
        console.log(formatArray(values));
    }

    console.log("Exercise 6 answer (__mul__): 24 * 19 in F_31 =", answer6Mul().toString());

    console.log("Exercise 7 answers, Fermat check i^(p-1) in F_p:");
    for (const values of exercise7()) {
        console.log(formatArray(values));
    }

    console.log("Exercise 8 answers in F_31:");
    console.log("3 / 24 =", exercise8()[0].toString());
    console.log("17^-3 =", exercise8()[1].toString());
    console.log("4^-4 * 11 =", exercise8()[2].toString());

    console.log("Exercise 9 answer (__truediv__): 3 / 24 in F_31 =", answer9Div().toString());
}

if (require.main === module) {
    printAnswers();
}

module.exports = {
    exercise2,
    exercise4,
    exercise5Unsorted,
    exercise5Sorted,
    exercise7,
    exercise8,
    answer1NotEquals,
    answer3Sub,
    answer6Mul,
    answer9Div,
    printAnswers,
};
