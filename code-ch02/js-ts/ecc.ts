export type IntegerLike = bigint | number | string;
export type PointValue = number | FieldElement;
export type NullablePointValue = PointValue | null;

export class FieldElement {
    readonly num: bigint;
    readonly prime: bigint;

    constructor(num: IntegerLike, prime: IntegerLike) {
        // TypeScript에서도 런타임 정수 계산은 JavaScript BigInt가 담당한다.
        // 입력은 number/string/bigint를 허용하지만 내부 표현은 bigint로 통일한다.
        this.num = BigInt(num);
        this.prime = BigInt(prime);

        // 유한체 F_p의 원소는 0..p-1 범위 안에 있어야 한다.
        if (this.num < 0n || this.num >= this.prime) {
            throw new RangeError(`Num ${this.num} not in field range 0 to ${this.prime - 1n}`);
        }
    }

    toString(): string {
        return `FieldElement_${this.prime}(${this.num})`;
    }

    equals(other: unknown): boolean {
        // Python의 __eq__를 명시적 메서드로 옮긴 것이다.
        return other instanceof FieldElement && this.num === other.num && this.prime === other.prime;
    }

    notEquals(other: unknown): boolean {
        // Python의 __ne__ 구현은 같음 비교의 부정이다.
        return !this.equals(other);
    }

    add(other: FieldElement): FieldElement {
        this.assertSameField(other, "add");
        return new FieldElement(mod(this.num + other.num, this.prime), this.prime);
    }

    sub(other: FieldElement): FieldElement {
        this.assertSameField(other, "subtract");
        return new FieldElement(mod(this.num - other.num, this.prime), this.prime);
    }

    mul(other: FieldElement): FieldElement {
        this.assertSameField(other, "multiply");
        return new FieldElement(mod(this.num * other.num, this.prime), this.prime);
    }

    pow(exponent: IntegerLike): FieldElement {
        // 지수를 p-1로 줄이면 음수 지수까지 유한체 안에서 처리할 수 있다.
        const n = mod(BigInt(exponent), this.prime - 1n);
        return new FieldElement(modPow(this.num, n, this.prime), this.prime);
    }

    div(other: FieldElement): FieldElement {
        this.assertSameField(other, "divide");
        if (other.num === 0n) {
            throw new RangeError("Cannot divide by zero in a finite field");
        }

        // 소수 체에서는 b^(p-2)가 b의 곱셈 역원이므로 a / b = a * b^(p-2)다.
        return new FieldElement(mod(this.num * modPow(other.num, this.prime - 2n, this.prime), this.prime), this.prime);
    }

    private assertSameField(other: FieldElement, operation: string): void {
        if (!(other instanceof FieldElement) || this.prime !== other.prime) {
            throw new TypeError(`Cannot ${operation} two numbers in different Fields`);
        }
    }
}

export class Point {
    readonly x: NullablePointValue;
    readonly y: NullablePointValue;
    readonly a: PointValue;
    readonly b: PointValue;

    constructor(x: NullablePointValue, y: NullablePointValue, a: PointValue, b: PointValue) {
        // y^2 = x^3 + ax + b 위의 점 하나를 표현한다.
        // x와 y가 null이면 타원곡선 군의 항등원인 무한원이다.
        this.x = x;
        this.y = y;
        this.a = a;
        this.b = b;

        if (this.x === null && this.y === null) {
            return;
        }
        if (this.x === null || this.y === null) {
            throw new TypeError("Point requires both x and y, or neither for point at infinity");
        }

        // 곡선 방정식을 만족하지 않는 좌표는 Point로 만들 수 없다.
        const left = powValue(this.y, 2);
        const right = addValue(addValue(powValue(this.x, 3), mulValue(this.a, this.x)), this.b);
        if (!valueEquals(left, right)) {
            throw new RangeError(`(${formatValue(this.x)}, ${formatValue(this.y)}) is not on the curve`);
        }
    }

    toString(): string {
        if (this.x === null) {
            return "Point(infinity)";
        }
        return `Point(${formatValue(this.x)},${formatValue(this.y)})_${formatValue(this.a)}_${formatValue(this.b)}`;
    }

    equals(other: unknown): boolean {
        // 좌표뿐 아니라 곡선 파라미터 a, b까지 같아야 같은 점이다.
        return (
            other instanceof Point &&
            valueEquals(this.x, other.x) &&
            valueEquals(this.y, other.y) &&
            valueEquals(this.a, other.a) &&
            valueEquals(this.b, other.b)
        );
    }

    notEquals(other: unknown): boolean {
        // Exercise 2: __ne__는 __eq__의 반대다.
        return !this.equals(other);
    }

    add(other: Point): Point {
        if (!(other instanceof Point) || !valueEquals(this.a, other.a) || !valueEquals(this.b, other.b)) {
            throw new TypeError(`Points ${this}, ${other} are not on the same curve`);
        }

        // 무한원은 덧셈 항등원이다.
        if (this.x === null) {
            return other;
        }
        if (other.x === null) {
            return this;
        }

        // Case 1: 같은 x, 다른 y이면 서로 역원인 점이므로 결과는 무한원이다.
        if (valueEquals(this.x, other.x) && !valueEquals(this.y, other.y)) {
            return new Point(null, null, this.a, this.b);
        }

        // Case 2: 서로 다른 두 점의 덧셈.
        // s = (y2-y1)/(x2-x1), x3 = s^2-x1-x2, y3 = s*(x1-x3)-y1.
        if (!valueEquals(this.x, other.x)) {
            const s = divValue(subValue(other.y, this.y), subValue(other.x, this.x));
            const x = subValue(subValue(powValue(s, 2), this.x), other.x);
            const y = subValue(mulValue(s, subValue(this.x, x)), this.y);
            return new Point(x, y, this.a, this.b);
        }

        // Case 3의 특수 상황: y가 0이면 접선이 수직이라 두 배의 결과는 무한원이다.
        if (this.equals(other) && isZeroValue(this.y)) {
            return new Point(null, null, this.a, this.b);
        }

        // Case 3: 같은 점을 더하는 point doubling.
        // 접선의 기울기 s = (3*x1^2+a)/(2*y1)를 사용한다.
        if (this.equals(other)) {
            const threeX2 = mulValue(coerceScalar(3, this.x), powValue(this.x, 2));
            const twoY = mulValue(coerceScalar(2, this.y), this.y);
            const s = divValue(addValue(threeX2, this.a), twoY);
            const x = subValue(powValue(s, 2), mulValue(coerceScalar(2, this.x), this.x));
            const y = subValue(mulValue(s, subValue(this.x, x)), this.y);
            return new Point(x, y, this.a, this.b);
        }

        throw new Error("Unhandled point addition case");
    }
}

export function mod(value: bigint, prime: bigint): bigint {
    // JavaScript %는 remainder라 음수 결과가 나올 수 있으므로 수학적 modulo로 보정한다.
    return ((value % prime) + prime) % prime;
}

export function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    if (modulus <= 0n) {
        throw new RangeError("Modulus must be positive");
    }

    // 빠른 모듈러 거듭제곱. 큰 수를 직접 만들지 않고 매 단계마다 modulus로 줄인다.
    let result = 1n;
    let current = mod(base, modulus);
    let power = BigInt(exponent);

    while (power > 0n) {
        if (power % 2n === 1n) {
            result = mod(result * current, modulus);
        }
        current = mod(current * current, modulus);
        power /= 2n;
    }

    return result;
}

function valueEquals(a: NullablePointValue, b: NullablePointValue): boolean {
    if (a === null || b === null) {
        return a === b;
    }
    if (a instanceof FieldElement) {
        return a.equals(b);
    }
    if (b instanceof FieldElement) {
        return b.equals(a);
    }
    return a === b;
}

function addValue(a: PointValue, b: PointValue): PointValue {
    if (a instanceof FieldElement) {
        return a.add(b as FieldElement);
    }
    return a + (b as number);
}

function subValue(a: PointValue, b: PointValue): PointValue {
    if (a instanceof FieldElement) {
        return a.sub(b as FieldElement);
    }
    return a - (b as number);
}

function mulValue(a: PointValue, b: PointValue): PointValue {
    if (a instanceof FieldElement) {
        return a.mul(b as FieldElement);
    }
    return a * (b as number);
}

function divValue(a: PointValue, b: PointValue): PointValue {
    if (a instanceof FieldElement) {
        return a.div(b as FieldElement);
    }
    return a / (b as number);
}

function powValue(a: PointValue, exponent: number): PointValue {
    if (a instanceof FieldElement) {
        return a.pow(exponent);
    }
    return a ** exponent;
}

function isZeroValue(value: PointValue): boolean {
    return value instanceof FieldElement ? value.num === 0n : value === 0;
}

function coerceScalar(value: number, like: PointValue): PointValue {
    // 좌표가 FieldElement이면 스칼라도 같은 유한체 원소로 변환한다.
    return like instanceof FieldElement ? new FieldElement(value, like.prime) : value;
}

function formatValue(value: NullablePointValue): string {
    return value instanceof FieldElement ? value.toString() : String(value);
}
