class FieldElement {
    constructor(num, prime) {
        // 1장과 마찬가지로 내부 정수 계산은 BigInt로 통일한다.
        // 이후 비트코인의 실제 유한체는 매우 큰 소수를 쓰므로 number만 쓰면 정밀도가 깨질 수 있다.
        this.num = BigInt(num);
        this.prime = BigInt(prime);

        // 유한체 F_p의 원소는 0 이상 p 미만이어야 한다.
        // 이 범위를 벗어난 값은 같은 체 안의 원소가 아니므로 생성 시점에 막는다.
        if (this.num < 0n || this.num >= this.prime) {
            throw new RangeError(`Num ${this.num} not in field range 0 to ${this.prime - 1n}`);
        }
    }

    toString() {
        return `FieldElement_${this.prime}(${this.num})`;
    }

    equals(other) {
        // Python의 __eq__에 해당한다.
        // 값(num)과 체의 크기(prime)가 모두 같아야 같은 원소다.
        return other instanceof FieldElement && this.num === other.num && this.prime === other.prime;
    }

    notEquals(other) {
        // Python의 __ne__는 __eq__의 정확한 반대다.
        return !this.equals(other);
    }

    add(other) {
        this.assertSameField(other, "add");
        return new this.constructor(mod(this.num + other.num, this.prime), this.prime);
    }

    sub(other) {
        this.assertSameField(other, "subtract");
        return new this.constructor(mod(this.num - other.num, this.prime), this.prime);
    }

    mul(other) {
        this.assertSameField(other, "multiply");
        return new this.constructor(mod(this.num * other.num, this.prime), this.prime);
    }

    pow(exponent) {
        // 페르마의 소정리 때문에 지수는 p-1로 줄여도 결과가 같다.
        // 음수 지수도 이 변환을 거치면 곱셈 역원을 이용한 양수 지수 계산으로 바뀐다.
        const n = mod(BigInt(exponent), this.prime - 1n);
        return new this.constructor(modPow(this.num, n, this.prime), this.prime);
    }

    div(other) {
        this.assertSameField(other, "divide");
        if (other.num === 0n) {
            throw new RangeError("Cannot divide by zero in a finite field");
        }

        // a / b는 a * b^(p-2)와 같다.
        // b^(p-2)는 소수 체 F_p에서 b의 곱셈 역원이다.
        return new this.constructor(mod(this.num * modPow(other.num, this.prime - 2n, this.prime), this.prime), this.prime);
    }

    assertSameField(other, operation) {
        if (!(other instanceof FieldElement) || this.prime !== other.prime) {
            throw new TypeError(`Cannot ${operation} two numbers in different Fields`);
        }
    }
}

class Point {
    constructor(x, y, a, b) {
        // y^2 = x^3 + ax + b 형태의 타원곡선 위 한 점을 표현한다.
        // x와 y가 null이면 "무한원(point at infinity)"으로 취급한다.
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

        // 생성자에서 곡선 방정식을 바로 검증한다.
        // 잘못된 점을 허용하면 뒤의 덧셈 공식이 수학적으로 의미를 잃기 때문이다.
        const left = powValue(this.y, 2);
        const right = addValue(addValue(powValue(this.x, 3), mulValue(this.a, this.x)), this.b);
        if (!valueEquals(left, right)) {
            throw new RangeError(`(${formatValue(this.x)}, ${formatValue(this.y)}) is not on the curve`);
        }
    }

    toString() {
        if (this.x === null) {
            return "Point(infinity)";
        }
        return `Point(${formatValue(this.x)},${formatValue(this.y)})_${formatValue(this.a)}_${formatValue(this.b)}`;
    }

    equals(other) {
        // 두 점은 좌표와 곡선 파라미터 a, b가 모두 같을 때만 같다.
        // 같은 좌표라도 서로 다른 곡선에 속하면 같은 점이 아니다.
        return (
            other instanceof Point &&
            valueEquals(this.x, other.x) &&
            valueEquals(this.y, other.y) &&
            valueEquals(this.a, other.a) &&
            valueEquals(this.b, other.b)
        );
    }

    notEquals(other) {
        // Exercise 2의 답: 같음 비교를 뒤집으면 된다.
        return !this.equals(other);
    }

    add(other) {
        if (!(other instanceof Point) || !valueEquals(this.a, other.a) || !valueEquals(this.b, other.b)) {
            throw new TypeError(`Points ${this}, ${other} are not on the same curve`);
        }

        // 무한원은 덧셈의 항등원이다.
        // 0 + P = P, P + 0 = P와 같은 역할을 한다.
        if (this.x === null) {
            return other;
        }
        if (other.x === null) {
            return this;
        }

        // Case 1: x좌표는 같지만 y좌표가 다르면 두 점은 서로 수직선 위의 역원이다.
        // 이때 두 점을 잇는 직선은 곡선의 세 번째 점을 유한 좌표에서 만나지 않으므로 결과는 무한원이다.
        if (valueEquals(this.x, other.x) && !valueEquals(this.y, other.y)) {
            return new this.constructor(null, null, this.a, this.b);
        }

        // Case 2: x1 != x2이면 일반적인 두 점의 덧셈 공식을 사용한다.
        // 기울기 s = (y2 - y1) / (x2 - x1)를 구한 뒤,
        // x3 = s^2 - x1 - x2, y3 = s * (x1 - x3) - y1을 계산한다.
        if (!valueEquals(this.x, other.x)) {
            const s = divValue(subValue(other.y, this.y), subValue(other.x, this.x));
            const x = subValue(subValue(powValue(s, 2), this.x), other.x);
            const y = subValue(mulValue(s, subValue(this.x, x)), this.y);
            return new this.constructor(x, y, this.a, this.b);
        }

        // Case 3의 특수 상황: P == P이고 y == 0이면 접선이 수직이므로 결과는 무한원이다.
        // Python 원본 answers.py의 `self.y == 0 * self.x`와 같은 의미다.
        if (this.equals(other) && isZeroValue(this.y)) {
            return new this.constructor(null, null, this.a, this.b);
        }

        // Case 3: 같은 점을 더하는 point doubling 공식이다.
        // 접선의 기울기 s = (3*x1^2 + a) / (2*y1)를 사용한다.
        if (this.equals(other)) {
            const threeX2 = mulValue(coerceScalar(3, this.x), powValue(this.x, 2));
            const twoY = mulValue(coerceScalar(2, this.y), this.y);
            const s = divValue(addValue(threeX2, this.a), twoY);
            const x = subValue(powValue(s, 2), mulValue(coerceScalar(2, this.x), this.x));
            const y = subValue(mulValue(s, subValue(this.x, x)), this.y);
            return new this.constructor(x, y, this.a, this.b);
        }

        throw new Error("Unhandled point addition case");
    }
}

function mod(value, prime) {
    return ((value % prime) + prime) % prime;
}

function modPow(base, exponent, modulus) {
    if (modulus <= 0n) {
        throw new RangeError("Modulus must be positive");
    }

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

function valueEquals(a, b) {
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

function addValue(a, b) {
    return a instanceof FieldElement ? a.add(b) : a + b;
}

function subValue(a, b) {
    return a instanceof FieldElement ? a.sub(b) : a - b;
}

function mulValue(a, b) {
    return a instanceof FieldElement ? a.mul(b) : a * b;
}

function divValue(a, b) {
    return a instanceof FieldElement ? a.div(b) : a / b;
}

function powValue(a, exponent) {
    return a instanceof FieldElement ? a.pow(exponent) : a ** exponent;
}

function isZeroValue(value) {
    if (value instanceof FieldElement) {
        return value.num === 0n;
    }
    return value === 0;
}

function coerceScalar(value, like) {
    // FieldElement와 일반 number를 같은 Point 코드에서 다루기 위한 보조 함수다.
    // 좌표가 FieldElement이면 스칼라도 같은 prime의 FieldElement로 바꾸고, 숫자 좌표이면 숫자로 둔다.
    if (like instanceof FieldElement) {
        return new FieldElement(value, like.prime);
    }
    return value;
}

function formatValue(value) {
    return value instanceof FieldElement ? value.toString() : String(value);
}

module.exports = {
    FieldElement,
    Point,
    mod,
    modPow,
};
