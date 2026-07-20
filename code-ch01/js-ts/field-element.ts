export type IntegerLike = bigint | number | string;

export class FieldElement {
    readonly num: bigint;
    readonly prime: bigint;

    constructor(num: IntegerLike, prime: IntegerLike) {
        // TypeScript에서도 런타임 계산은 JavaScript와 동일하므로 BigInt를 사용한다.
        // 타입은 number/string/bigint 입력을 허용하되, 저장과 연산은 bigint 하나로 통일한다.
        this.num = BigInt(num);
        this.prime = BigInt(prime);

        // F_p의 원소는 0 이상 p 미만이어야 한다.
        // 예를 들어 F_13의 원소는 0..12이고, 13은 다시 0과 같은 위치로 감기므로 직접 원소로 받지 않는다.
        if (this.num < 0n || this.num >= this.prime) {
            throw new RangeError(`Num ${this.num} not in field range 0 to ${this.prime - 1n}`);
        }
    }

    toString(): string {
        return `FieldElement_${this.prime}(${this.num})`;
    }

    equals(other: unknown): boolean {
        // Python 원본의 __eq__를 메서드로 표현한 것이다.
        // TypeScript/JavaScript에는 Python처럼 == 연산자 오버로딩이 없어서 a.equals(b) 형태로 사용한다.
        return other instanceof FieldElement && this.num === other.num && this.prime === other.prime;
    }

    notEquals(other: unknown): boolean {
        // Python 원본의 __ne__ 구현: 같음 비교의 부정이다.
        return !this.equals(other);
    }

    add(other: FieldElement): FieldElement {
        this.assertSameField(other, "add");

        // 유한체 덧셈: 일반 덧셈 결과를 prime으로 나눈 나머지가 새 원소가 된다.
        const num = mod(this.num + other.num, this.prime);
        return new FieldElement(num, this.prime);
    }

    sub(other: FieldElement): FieldElement {
        this.assertSameField(other, "subtract");

        // 유한체 뺄셈: 음수가 나와도 modulo로 0..p-1 범위에 다시 넣는다.
        const num = mod(this.num - other.num, this.prime);
        return new FieldElement(num, this.prime);
    }

    mul(other: FieldElement): FieldElement {
        this.assertSameField(other, "multiply");

        // 유한체 곱셈: 일반 곱셈 후 modulo를 적용해 체의 닫힘 성질을 만족시킨다.
        const num = mod(this.num * other.num, this.prime);
        return new FieldElement(num, this.prime);
    }

    pow(exponent: IntegerLike): FieldElement {
        // 음수 지수는 곱셈 역원을 의미한다.
        // n을 p-1로 줄이면 페르마의 소정리 덕분에 같은 결과를 얻을 수 있다.
        const n = mod(BigInt(exponent), this.prime - 1n);
        return new FieldElement(modPow(this.num, n, this.prime), this.prime);
    }

    div(other: FieldElement): FieldElement {
        this.assertSameField(other, "divide");
        if (other.num === 0n) {
            throw new RangeError("Cannot divide by zero in a finite field");
        }

        // a / b 는 a * b^(-1)과 같다.
        // 소수 체에서는 b^(p-2) % p가 b의 곱셈 역원이므로 별도 확장 유클리드 없이 계산할 수 있다.
        const inverse = modPow(other.num, this.prime - 2n, this.prime);
        const num = mod(this.num * inverse, this.prime);
        return new FieldElement(num, this.prime);
    }

    private assertSameField(other: FieldElement, operation: string): void {
        // 같은 prime을 공유해야 같은 유한체의 원소다.
        // 다른 체끼리의 덧셈/곱셈은 수학적으로 정의하지 않았으므로 예외로 막는다.
        if (!(other instanceof FieldElement) || this.prime !== other.prime) {
            throw new TypeError(`Cannot ${operation} two numbers in different Fields`);
        }
    }
}

export function mod(value: bigint, prime: bigint): bigint {
    // 수학적 modulo로 보정한다. JavaScript % 연산은 remainder라서 음수 결과가 나올 수 있다.
    return ((value % prime) + prime) % prime;
}

export function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    if (modulus <= 0n) {
        throw new RangeError("Modulus must be positive");
    }

    // 제곱-분할 방식의 모듈러 거듭제곱.
    // 큰 수를 그대로 만들지 않고 매 단계마다 modulus로 줄여 유한체 연산에 맞게 계산한다.
    let result = 1n;
    let current = mod(base, modulus);
    let power = exponent;

    while (power > 0n) {
        if (power % 2n === 1n) {
            result = mod(result * current, modulus);
        }
        current = mod(current * current, modulus);
        power /= 2n;
    }

    return result;
}
