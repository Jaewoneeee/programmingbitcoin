# Chapter 1 JavaScript / TypeScript

이 폴더는 `code-ch01`의 Python 코드를 JavaScript와 TypeScript로 옮긴 버전입니다.

## 파일 구성

- `field-element.js`: Node.js에서 바로 실행할 수 있는 유한체 `FieldElement` 구현
- `field-element.ts`: 같은 구현의 TypeScript 버전
- `examples.js`: `examples.py`의 예제를 JavaScript로 실행하는 파일
- `examples.ts`: 같은 예제의 TypeScript 버전
- `answers.js`: `answers.py`의 연습문제 답을 JavaScript로 실행하는 파일
- `answers.test.js`: `answers.js`가 원본 답과 같은 결과를 내는지 확인하는 Node 테스트
- `field-element.test.js`: 원본 `ecc.py` 테스트와 `answers.py` 계산값을 확인하는 Node 테스트

## 핵심 개념

`FieldElement`는 유한체 `F_p`의 원소 하나를 표현합니다. `F_p`는 `0`부터 `p - 1`까지의 정수만 원소로 가지며, 덧셈, 뺄셈, 곱셈, 나눗셈의 결과를 항상 `p`로 나눈 나머지로 되돌립니다. 이 동작 때문에 연산 결과가 항상 같은 체 안에 남습니다.

Python 원본은 `a + b`, `a - b`, `a * b`, `a / b`, `a ** n`처럼 연산자 오버로딩을 사용합니다. JavaScript와 TypeScript에는 사용자 정의 클래스의 산술 연산자 오버로딩이 없으므로 다음처럼 메서드로 표현했습니다.

```js
a.add(b);
a.sub(b);
a.mul(b);
a.div(b);
a.pow(n);
a.equals(b);
```

## 실행

```sh
node code-ch01/js-ts/examples.js
node code-ch01/js-ts/answers.js
node code-ch01/js-ts/answers.test.js
node code-ch01/js-ts/field-element.test.js
```

TypeScript 파일은 학습용 소스입니다. 이 저장소에는 TypeScript 컴파일 설정이 없으므로, 별도 환경에서 실행하려면 `tsc`나 `tsx` 같은 도구를 추가해 사용하면 됩니다.
