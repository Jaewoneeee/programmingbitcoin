 

# GitHub 인증 방식 운영 가이드

작성일: 2026-07-15

## 1. 목적과 기본 원칙

이 문서는 GitHub에서 `git clone`, `git push`, API 호출, 배포 자동화, CI/CD에 사용하는 인증 방식을 정리하고, 팀 운영에 적합한 표준 방안을 제안한다.

기본 원칙은 다음과 같다.

- 사람 계정과 자동화 계정의 인증 수단을 분리한다.
- 장기 토큰보다 짧은 수명의 토큰 또는 키를 우선한다.
- 권한은 저장소, 작업, 기간 단위로 최소화한다.
- 개인 PAT를 CI/CD의 상시 자격 증명으로 쓰지 않는다.
- 조직 차원에서 PAT 정책, 승인, 만료, 감사 절차를 운영한다.

## 2. GitHub 인증 방식 종류

### 2.1 SSH key

개발자 로컬 머신에서 GitHub 저장소에 접근할 때 가장 일반적으로 쓰는 방식이다. 공개키는 GitHub 계정에 등록하고, 개인키는 로컬 머신에 보관한다. SSH를 설정하면 매번 사용자명과 토큰을 입력하지 않고 `git@github.com:OWNER/REPO.git` 형식으로 clone, pull, push할 수 있다.

권장 사용처:

- 개발자 로컬 환경의 `git clone`, `git pull`, `git push`
- 개인 개발 장비의 Git 인증
- 커밋 서명용 SSH key

장점:

- PAT를 매번 입력하거나 저장하지 않아도 된다.
- 개인키가 로컬에 남아 있어 HTTPS 토큰보다 개발자 경험이 좋다.
- passphrase와 ssh-agent를 함께 쓰면 보안과 편의성의 균형이 좋다.
- Git 작업에 자연스럽게 맞는다.

단점:

- GitHub API 호출에는 직접 사용할 수 없다.
- 개인키가 유출되면 해당 계정 권한 범위에서 Git 접근이 가능하다.
- 장비 교체, 퇴사, 분실 시 키 회수와 감사가 필요하다.
- 조직 리소스 접근 권한은 결국 사용자 계정 권한에 종속된다.

운영 기준:

- 개발자는 개인 장비별로 별도 SSH key를 생성한다.
- passphrase 없는 개인 SSH key는 금지한다.
- 공용 서버, CI runner, 배포 서버에는 개인 SSH key를 저장하지 않는다.
- 분기별로 GitHub 계정의 SSH key 목록을 점검하고 미사용 키를 삭제한다.

### 2.2 Fine-grained Personal Access Token

Fine-grained PAT는 특정 사용자 또는 조직, 특정 저장소, 특정 권한으로 제한할 수 있는 개인 액세스 토큰이다. GitHub는 가능하면 Classic PAT보다 Fine-grained PAT 사용을 권장한다.

권장 사용처:

- SSH 사용이 어려운 환경의 제한적 HTTPS Git 접근
- 개인이 특정 저장소에 대해 제한된 API 작업을 수행하는 경우
- 임시 스크립트나 운영 작업 중 GitHub App 구축까지는 과한 경우

장점:

- 단일 조직 또는 사용자 리소스, 특정 저장소로 범위를 줄일 수 있다.
- `contents:read`, `contents:write`, `pull_requests:write`처럼 필요한 권한만 선택할 수 있다.
- 조직 관리자가 승인 정책과 최대 수명 정책을 적용할 수 있다.
- Classic PAT보다 유출 시 피해 범위를 줄이기 쉽다.

단점:

- 모든 GitHub 기능과 API를 아직 지원하지는 않는다.
- 여러 조직을 한 토큰으로 접근하는 방식에는 맞지 않는다.
- GitHub Packages, Checks API 등 일부 시나리오에서는 Classic PAT가 필요할 수 있다.
- 개인 계정에 묶이므로 사용자가 퇴사하거나 권한을 잃으면 토큰도 영향을 받는다.

운영 기준:

- 기본 만료일은 30일, 최대 90일을 권장한다. 예외적으로 장기 작업은 최대 180일까지만 허용한다.
- 저장소 접근은 "Only select repositories"를 기본값으로 한다.
- 권한은 작업 단위로 최소화한다. 예: clone 전용은 `contents:read`, push는 `contents:write`.
- 조직 리소스 접근 Fine-grained PAT는 관리자 승인 후 사용한다.
- 토큰 이름에는 목적, 대상 저장소, 만료일을 포함한다. 예: `deploy-read-repo-a-2026-08-31`.

### 2.3 Personal Access Token (classic)

Classic PAT는 오래된 PAT 방식으로, 권한을 scope 단위로 부여한다. GitHub는 Fine-grained PAT를 우선 권장하며, Classic PAT는 Fine-grained PAT로 처리할 수 없는 예외 상황에만 사용해야 한다.

권장 사용처:

- Fine-grained PAT가 지원하지 않는 API 또는 기능을 사용해야 하는 경우
- 외부 collaborator 접근 등 Fine-grained PAT 제한에 걸리는 경우
- GitHub Packages 등 현재 Fine-grained PAT 지원이 부족한 일부 업무

장점:

- 오래된 도구와 통합에서 호환성이 좋다.
- 지원 범위가 넓고 예외 상황 해결이 쉽다.

단점:

- 토큰 소유자가 접근 가능한 여러 저장소로 권한이 넓어질 수 있다.
- 세밀한 저장소/권한 제한이 어렵다.
- 조직 승인 없이 리소스에 접근할 수 있는 경우가 있어 통제가 어렵다.
- 유출 시 피해 범위가 Fine-grained PAT보다 크다.

운영 기준:

- 신규 발급은 원칙적으로 금지하고 예외 승인제로 운영한다.
- 사용 사유, scope, 만료일, 대체 계획을 기록한다.
- 최대 만료일은 30일을 권장하고, 재발급 시 재검토한다.
- 조직 정책으로 Classic PAT 접근을 제한하거나 최소한 최대 수명 정책을 적용한다.

### 2.4 GitHub Actions `GITHUB_TOKEN`

GitHub Actions 워크플로우에서 자동으로 발급되는 토큰이다. 같은 저장소의 이슈, PR, contents, deployments 등 GitHub API 작업에 사용할 수 있다.

권장 사용처:

- GitHub Actions 내부에서 같은 저장소를 checkout하거나 API를 호출하는 작업
- 릴리스 생성, 이슈/PR 코멘트 작성, 태그 푸시 등 저장소 내부 자동화

장점:

- 별도 secret을 저장하지 않아도 된다.
- 워크플로우 실행 단위로 관리되며 개인 계정에 묶이지 않는다.
- `permissions` 키로 워크플로우 또는 job 단위 권한을 제한할 수 있다.

단점:

- 기본 권한이 과하게 열려 있으면 third-party action 또는 취약한 workflow가 악용할 수 있다.
- 다른 조직/외부 시스템 접근에는 직접 적합하지 않다.
- cross-repository 작업은 추가 설계가 필요하다.

운영 기준:

- 조직 또는 저장소 기본값은 `contents: read` 수준으로 낮춘다.
- 각 job에 필요한 권한만 명시한다.
- third-party action은 full-length commit SHA로 pinning한다.
- secret이 필요한 배포 작업은 가능하면 OIDC로 대체한다.

예시:

```yaml
permissions:
    contents: read

jobs:
    release:
        permissions:
            contents: write
            pull-requests: read
```

### 2.5 OIDC for GitHub Actions

OIDC는 GitHub Actions가 클라우드 제공자(AWS, Azure, GCP 등)와 신뢰 관계를 맺고, 장기 secret 없이 짧은 수명의 클라우드 access token을 발급받는 방식이다.

권장 사용처:

- GitHub Actions에서 AWS, GCP, Azure, Vault, PyPI 등 외부 시스템에 배포하는 작업
- 장기 cloud access key를 GitHub Secrets에 저장하던 기존 CI/CD

장점:

- 장기 cloud secret을 GitHub에 저장하지 않아도 된다.
- job 단위로 짧은 수명의 토큰을 발급받는다.
- branch, repo, environment, workflow claim을 이용해 클라우드 권한을 세밀하게 제한할 수 있다.
- 배포 환경 보호 규칙과 함께 운영하기 좋다.

단점:

- 클라우드 쪽 trust policy 설정이 필요하다.
- provider별 설정 방식이 다르다.
- 초기 구축 난이도가 PAT나 static secret보다 높다.

운영 기준:

- 클라우드 배포는 OIDC를 기본값으로 한다.
- production 배포 role은 `main` branch, protected environment, 승인자 조건을 함께 묶는다.
- workflow에는 `id-token: write`를 필요한 job에만 부여한다.
- cloud IAM role은 repository, branch, environment claim으로 제한한다.

예시:

```yaml
permissions:
    id-token: write
    contents: read
```

### 2.6 Deploy key

Deploy key는 특정 저장소 하나에 붙는 SSH key다. 서버에 개인키를 두고 해당 저장소를 clone/pull하거나, 필요 시 write access를 허용해 push할 수 있다.

권장 사용처:

- 단일 저장소를 읽기 전용으로 배포 서버에서 pull해야 하는 경우
- 단순한 legacy 배포 구조

장점:

- 특정 저장소 하나로 접근 범위가 제한된다.
- read-only가 기본값이다.
- 사용자 계정에 직접 묶이지 않는다.

단점:

- 만료일이 없다.
- 서버 침해 시 private key가 노출될 수 있다.
- 여러 저장소 접근에는 저장소별 키 관리가 필요하다.
- write access를 주면 위험도가 커진다.

운영 기준:

- read-only deploy key만 허용한다.
- write access deploy key는 금지하고, 필요한 경우 GitHub App 또는 `GITHUB_TOKEN`으로 대체한다.
- 단일 저장소 배포 외에는 사용하지 않는다.
- 서버별, 저장소별 키 목록을 별도 관리하고 정기 회전한다.

### 2.7 GitHub App installation token

GitHub App은 조직 또는 저장소에 설치되는 1급 자동화 주체다. App 권한과 설치 범위를 정의하고, 짧은 수명의 installation access token을 생성해 API 또는 Git 작업에 사용할 수 있다.

권장 사용처:

- 조직 차원의 장기 자동화
- 여러 저장소에 걸친 봇, 배포, 정책 enforcement, 릴리스 자동화
- 개인 계정과 분리되어야 하는 서비스 계정성 작업

장점:

- 사용자 계정과 분리된 자동화 주체다.
- 저장소와 권한을 세밀하게 설정할 수 있다.
- installation token은 짧은 수명으로 발급된다.
- 조직 규모에 맞는 별도 rate limit을 갖는다.

단점:

- 초기 등록, 권한 설계, private key 보관, token 발급 코드가 필요하다.
- 단순한 한 번성 작업에는 과할 수 있다.

운영 기준:

- 장기 운영 자동화는 Machine user + PAT보다 GitHub App을 우선한다.
- App private key는 secret manager에 저장한다.
- App 권한은 기능별로 분리한다. 예: release app, repo-read app, policy app.
- installation 범위는 전체 조직보다 필요한 저장소 목록을 우선한다.

### 2.8 Machine user

자동화 전용 GitHub 계정을 만들고 SSH key 또는 PAT를 연결해 사용하는 방식이다.

권장 사용처:

- GitHub App으로 이전하기 전의 과도기
- 특정 외부 도구가 사용자 계정 기반 인증만 지원하는 경우

장점:

- 사람 계정과 자동화 계정을 분리할 수 있다.
- 기존 도구 호환성이 좋다.

단점:

- 계정, 2FA, SSH key, PAT, 라이선스, 권한 회수 등 관리 부담이 크다.
- 권한이 넓어지기 쉽다.
- 장기 토큰을 쓰는 구조로 흐르기 쉽다.

운영 기준:

- 신규 자동화에는 기본 선택지로 사용하지 않는다.
- 예외적으로 사용할 경우 2FA, 최소 권한 team, Fine-grained PAT, 만료일, 소유자 지정이 필수다.
- GitHub App 전환 계획을 함께 둔다.

## 3. 방식별 비교 요약

| 방식             | 적합한 용도              | 장점                                | 주요 리스크               | 팀 기본 정책          |
| ---------------- | ------------------------ | ----------------------------------- | ------------------------- | --------------------- |
| SSH key          | 개발자 로컬 Git 작업     | 편의성, Git 친화적                  | 개인키 유출, 장비 관리    | 로컬 개발 기본값      |
| Fine-grained PAT | 제한적 API/HTTPS Git     | 저장소/권한/기간 제한               | 기능 제한, 개인 계정 종속 | 예외적 허용           |
| Classic PAT      | legacy/API 예외          | 호환성                              | 넓은 권한, 통제 어려움    | 신규 금지, 예외 승인  |
| `GITHUB_TOKEN`   | Actions 내부 GitHub 작업 | 자동 발급, job 권한 제한            | workflow 권한 과다        | CI 기본값             |
| OIDC             | cloud 배포               | 장기 secret 제거, 짧은 수명         | 초기 설정 필요            | 배포 기본값           |
| Deploy key       | 단일 repo 서버 pull      | repo 단위 제한, read-only           | 만료 없음, 서버 유출      | read-only만 제한 허용 |
| GitHub App       | 조직 자동화              | 사용자 분리, 세밀한 권한, 짧은 토큰 | 초기 구축 비용            | 장기 자동화 기본값    |
| Machine user     | legacy 자동화            | 호환성                              | 계정/토큰 관리 부담       | 과도기 예외           |

## 4. 우리팀 권장안

### 권장안 1: 개발자 로컬 환경

표준:

- `git clone`, `git pull`, `git push`는 SSH key를 기본으로 한다.
- SSH key는 장비별로 생성하고 passphrase를 필수로 한다.
- GitHub CLI 또는 Git Credential Manager는 HTTPS가 필요한 경우에만 보조로 사용한다.
- 개인 PAT를 로컬 Git 인증의 기본 수단으로 쓰지 않는다.

운영 방안:

- 온보딩 체크리스트에 SSH key 생성, GitHub 등록, `ssh -T git@github.com` 테스트를 포함한다.
- 분기별로 GitHub 계정의 SSH key를 점검한다.
- 퇴사/장비 반납 시 SSH key 삭제를 계정 회수 절차에 포함한다.
- 로컬 개발용 Fine-grained PAT는 SSH 사용이 불가능한 예외 상황에만 승인한다.

### 권장안 2: GitHub Actions 및 CI/CD

표준:

- GitHub 저장소 내부 작업은 `GITHUB_TOKEN`을 사용한다.
- cloud 배포는 OIDC를 기본으로 한다.
- 장기 cloud access key, 개인 PAT, Classic PAT를 GitHub Secrets에 저장하지 않는다.
- third-party action은 full-length commit SHA로 pinning한다.

운영 방안:

- 조직/저장소 기본 `GITHUB_TOKEN` 권한을 read-only로 낮춘다.
- 모든 workflow에 top-level 또는 job-level `permissions`를 명시한다.
- production 배포는 GitHub Environment, required reviewer, branch protection, OIDC claim 조건을 함께 사용한다.
- 기존 CI/CD secret을 전수 조사해 cloud key는 OIDC로, GitHub API용 PAT는 `GITHUB_TOKEN` 또는 GitHub App으로 전환한다.

권장 workflow 패턴:

```yaml
permissions:
    contents: read

jobs:
    deploy:
        runs-on: ubuntu-latest
        permissions:
            contents: read
            id-token: write
        environment: production
        steps:
            - uses: actions/checkout@<full-length-commit-sha>
            - name: Configure cloud credentials through OIDC
              run: echo "provider-specific OIDC auth step"
```

### 권장안 3: 서버/봇/조직 자동화

표준:

- 장기 자동화는 GitHub App을 기본으로 한다.
- 단일 저장소 read-only 배포 서버는 deploy key를 제한적으로 허용한다.
- Machine user와 Classic PAT는 legacy 예외로만 둔다.

운영 방안:

- 여러 저장소를 읽거나 쓰는 자동화는 GitHub App으로 구현한다.
- GitHub App은 기능별로 분리하고, installation 범위와 권한을 최소화한다.
- deploy key는 read-only만 허용하고, write access deploy key는 금지한다.
- Machine user는 소유자, 목적, 권한, 만료/회전 주기, GitHub App 전환 계획을 문서화한 경우에만 허용한다.

## 5. 도입 로드맵

1. 현황 조사
    - 조직의 SSH key, deploy key, PAT, Actions secrets, machine user 목록을 수집한다.
    - Classic PAT와 장기 cloud key 사용처를 우선 식별한다.

2. 정책 적용
    - Fine-grained PAT 관리자 승인 정책을 켠다.
    - PAT 최대 수명 정책을 적용한다. 권장: Fine-grained PAT 90일, Classic PAT 30일.
    - Classic PAT는 신규 발급 예외 승인제로 전환한다.

3. CI/CD 개선
    - 모든 workflow에 `permissions`를 명시한다.
    - `GITHUB_TOKEN` 기본 권한을 read-only로 낮춘다.
    - cloud 배포 secret을 OIDC로 전환한다.
    - third-party action pinning 정책을 적용한다.

4. 자동화 계정 정리
    - write deploy key를 제거한다.
    - machine user 기반 자동화를 GitHub App으로 전환한다.
    - 불필요한 PAT와 미사용 SSH key를 폐기한다.

## 6. 예외 승인 기준

예외 인증 수단을 사용할 때는 다음을 기록한다.

- 목적과 소유자
- 대상 저장소 또는 조직
- 필요한 권한과 근거
- 만료일과 회전 주기
- 저장 위치
- 대체 가능한 표준 방식 검토 결과
- 폐기 또는 전환 예정일

예외 우선순위:

1. Fine-grained PAT
2. Deploy key read-only
3. Machine user with Fine-grained PAT
4. Classic PAT

Classic PAT는 Fine-grained PAT, `GITHUB_TOKEN`, OIDC, GitHub App으로 해결할 수 없다는 근거가 있을 때만 허용한다.

## 7. 참고 공식 문서

- GitHub Docs: Managing your personal access tokenshttps://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- GitHub Docs: About SSHhttps://docs.github.com/en/authentication/connecting-to-github-with-ssh/about-ssh
- GitHub Docs: Managing deploy keyshttps://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys
- GitHub Docs: Use GITHUB_TOKEN for authentication in workflowshttps://docs.github.com/en/actions/tutorials/authenticate-with-github_token
- GitHub Docs: Secure use reference for GitHub Actionshttps://docs.github.com/en/actions/reference/security/secure-use
- GitHub Docs: OpenID Connecthttps://docs.github.com/en/actions/concepts/security/openid-connect
- GitHub Docs: Setting a personal access token policy for your organizationhttps://docs.github.com/en/organizations/managing-programmatic-access-to-your-organization/setting-a-personal-access-token-policy-for-your-organization
- GitHub Docs: GitHub Apps overview
  https://docs.github.com/en/apps/overview
