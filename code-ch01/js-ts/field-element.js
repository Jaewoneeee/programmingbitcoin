class FieldElement {
    constructor(num, prime) {
        // JavaScript의 number는 큰 정수에서 정밀도가 깨질 수 있으므로 내부 계산은 BigInt로 통일한다.
        // 1장의 예제는 작은 수만 쓰지만, 비트코인 수학은 이후 장에서 매우 큰 소수를 다루게 된다.
        this.num = BigInt(num);
        this.prime = BigInt(prime);

        // 유한체 F_p의 원소는 반드시 0부터 p - 1 사이에 있어야 한다.
        // 이 범위를 벗어나면 "해당 체에 속한 원소"가 아니므로 Python 원본처럼 예외를 던진다.
        if (this.num < 0n || this.num >= this.prime) {
            throw new RangeError(`Num ${this.num} not in field range 0 to ${this.prime - 1n}`);
        }
    }

    toString() {
        return `FieldElement_${this.prime}(${this.num})`;
    }

    equals(other) {
        // Python의 __eq__에 해당한다.
        // 같은 유한체(prime이 같음)에 속하고, 실제 값(num)도 같을 때만 같은 원소다.
        return other instanceof FieldElement && this.num === other.num && this.prime === other.prime;
    }

    notEquals(other) {
        // Python의 __ne__에 해당한다. "같지 않다"는 "같다"의 정확한 반대다.
        return !this.equals(other);
    }

    add(other) {
        this.assertSameField(other, "add");

        // 유한체 덧셈은 일반 덧셈 후 prime으로 나눈 나머지를 취한다.
        // 예: F_31에서 17 + 21 = 38 이지만 38 % 31 = 7 이므로 결과는 7이다.
        const num = mod(this.num + other.num, this.prime);
        return new this.constructor(num, this.prime);
    }

    sub(other) {
        this.assertSameField(other, "subtract");

        // 유한체 뺄셈도 결과가 0..p-1 범위에 머물러야 한다.
        // JavaScript의 %는 음수에서 음수 나머지를 만들 수 있어 별도 mod 함수로 보정한다.
        const num = mod(this.num - other.num, this.prime);
        return new this.constructor(num, this.prime);
    }

    mul(other) {
        this.assertSameField(other, "multiply");

        // 유한체 곱셈은 일반 곱셈 후 prime으로 나눈 나머지를 취한다.
        // 이 덕분에 곱셈 결과도 항상 같은 유한체 안에 남는다.
        const num = mod(this.num * other.num, this.prime);
        return new this.constructor(num, this.prime);
    }

    pow(exponent) {
        // 페르마의 소정리에 의해 0이 아닌 a에 대해 a^(p-1) % p = 1 이다.
        // 따라서 지수는 p - 1로 줄여도 같은 결과가 나오며, 음수 지수도 양수 지수로 변환된다.
        const n = mod(BigInt(exponent), this.prime - 1n);
        return new this.constructor(modPow(this.num, n, this.prime), this.prime);
    }

    div(other) {
        this.assertSameField(other, "divide");
        if (other.num === 0n) {
            throw new RangeError("Cannot divide by zero in a finite field");
        }

        // 유한체에서 나눗셈은 "분모의 곱셈 역원"을 곱하는 것이다.
        // prime이 소수이면 other.num^(p-2) % p 가 other.num의 역원이 된다.
        const inverse = modPow(other.num, this.prime - 2n, this.prime);
        const num = mod(this.num * inverse, this.prime);
        return new this.constructor(num, this.prime);
    }

    assertSameField(other, operation) {
        // 서로 다른 prime을 가진 원소는 서로 다른 유한체에 속한다.
        // F_31의 2와 F_43의 2는 표기상 값이 같아 보여도 같은 체의 원소가 아니므로 연산할 수 없다.
        if (!(other instanceof FieldElement) || this.prime !== other.prime) {
            throw new TypeError(`Cannot ${operation} two numbers in different Fields`);
        }
    }
}

function mod(value, prime) {
    // JavaScript의 -1n % 13n은 -1n이다.
    // 수학적 modulo는 항상 0..prime-1 범위여야 하므로 prime을 더한 뒤 다시 나머지를 취한다.
    return ((value % prime) + prime) % prime;
}

function modPow(base, exponent, modulus) {
    if (modulus <= 0n) {
        throw new RangeError("Modulus must be positive");
    }

    // 빠른 거듭제곱: base^exponent를 직접 만들면 숫자가 커지므로,
    // 곱할 때마다 modulus로 줄이며 O(log exponent)번의 곱셈만 수행한다.
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

module.exports = {
    FieldElement,
    mod,
    modPow,
};
