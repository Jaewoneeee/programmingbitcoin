# Chapter 2 JavaScript / TypeScript

이 폴더는 `code-ch02`의 Python 코드를 JavaScript와 TypeScript로 옮긴 버전입니다.

## 파일 구성

- `ecc.js`: Node.js에서 바로 실행할 수 있는 `FieldElement`와 타원곡선 `Point` 구현
- `ecc.ts`: 같은 구현의 TypeScript 버전
- `examples.js`: `examples.py`의 doctest 예제를 JavaScript로 실행하는 파일
- `examples.ts`: 같은 예제의 TypeScript 버전
- `answers.js`: `answers.py`의 연습문제 답을 JavaScript 함수와 출력으로 정리한 파일
- `answers.test.js`: `answers.js`가 원본 답과 같은 결과를 내는지 확인하는 Node 테스트
- `ecc.test.js`: 원본 `ecc.py`의 `FieldElementTest`, `PointTest` 기대값을 확인하는 Node 테스트

## 핵심 개념

챕터 2의 `Point`는 다음 타원곡선 위의 점을 표현합니다.

```text
y^2 = x^3 + ax + b
```

생성자는 좌표가 이 방정식을 만족하는지 확인합니다. `x`와 `y`가 둘 다 `null`이면 일반 좌표가 아니라 타원곡선 군의 항등원인 무한원 `Point(infinity)`로 취급합니다.

Python 원본은 `p1 + p2`, `p1 == p2`, `p1 != p2`처럼 연산자 오버로딩을 사용합니다. JavaScript와 TypeScript에는 사용자 정의 클래스 산술 연산자 오버로딩이 없으므로 다음처럼 메서드로 표현했습니다.

```js
p1.add(p2);
p1.equals(p2);
p1.notEquals(p2);
```

## 실행

```sh
node code-ch02/js-ts/examples.js
node code-ch02/js-ts/answers.js
node code-ch02/js-ts/ecc.test.js
node code-ch02/js-ts/answers.test.js
```

TypeScript 파일은 학습용 소스입니다. 이 저장소에는 TypeScript 컴파일 설정이 없으므로, 별도 환경에서 실행하려면 `tsc`나 `tsx` 같은 도구를 추가해 사용하면 됩니다.
