<div align="center">

# uib-a

### 실제 화면을 보고, 수정안을 비교하고, 검토 내용을 저장하는 Codex 스킬

**UI Before / After — 모바일·PC 시안과 검토 도구를 하나의 오프라인 HTML로**

[![License: MIT](https://img.shields.io/badge/License-MIT-3e6450.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-294b3e.svg)](package.json)
[![Codex Skill](https://img.shields.io/badge/Codex-Skill-182b3a.svg)](SKILL.md)

**한국어** · [English](README.en.md)

[미리 보기](#preview) · [설치와 첫 사용](#quick-start) · [3가지 모드](#modes) · [저장과 후속 수정](#save) · [문서·도구](#docs)

</div>

![데스크톱의 비교만 모드: Before와 After를 나란히 표시한 검토 화면](docs/images/desktop-review.png)

- **입력**: 기존 프로젝트·화면·브랜드와 개선할 과제
- **결과**: 실제 Before 캡처 + 개선 After + 검토 상태를 담은 HTML 한 파일
- **검토**: 브라우저만으로 비교·요소 선택·임시 삭제·시안 수정·의견·저장
- **활용**: 구현 전 방향 결정, 모바일·PC 검토, 저장본 기반 다음 시안 작업
- **제품 코드 반영**: 시안 검토 이후 별도 요청으로 진행

```text
실제 화면·사용자 과제·브랜드
              ↓
Before 캡처 + 근거 있는 After 시안
              ↓
비교만 → 간편 수정 → 필요 시 상세 검토
              ↓
검토 HTML 저장 → Codex에 전달 → 다음 시안
```

<a id="preview"></a>

## 설치 없이 미리 보기

**[데모 HTML 다운로드](https://raw.githubusercontent.com/99duuk/uib-a/main/docs/demo/before-after.html)**

1. 링크의 내용을 `.html` 파일로 저장
2. 저장한 파일을 브라우저에서 열기
3. 화면 목록 선택 → 전후 비교 → 필요 시 편집 모드 전환

- 생성 HTML 열람: 서버·Node.js·Codex 불필요
- 예시: 모바일 서재·읽기 확인 모달·PC 프로젝트 홈·모바일 프로젝트 홈
- 가상 브랜드의 기능 예시, 실제 고객 화면·전환 성과·Dribbble 순위 근거로 사용 불가
- Fieldwork: 같은 명세·fixture의 Before/After, Morrow: 기존 Before를 유지한 After 개정
- [예시의 변경 이유·참고 자료](docs/design-notes.md)

<details>
<summary><strong>After 시안과 모바일 검토 화면</strong></summary>

![프로젝트 목록, 선택한 표지, 검토 요청을 함께 보여주는 Fieldwork 시안](docs/images/desktop-after.png)

<img src="docs/images/mobile-after.png" width="390" alt="수정된 모바일 서재: 제목, 읽은 위치, 이어서 읽기">

<img src="docs/images/mobile-review.png" width="390" alt="모바일의 Before/After 검토 화면">

</details>

<a id="quick-start"></a>

## 설치와 첫 사용

### 1. 스킬 설치

- 준비물: Codex·Node.js 22 이상·npm·Git
- 인터넷 필요 시점: 의존성 설치·실제 프로젝트의 디자인 참고 조사

```sh
git clone https://github.com/99duuk/uib-a.git
cd uib-a
npm run install:skill
```

- 기본 경로: `$CODEX_HOME/skills/uib-a`, 미설정 시 `~/.codex/skills/uib-a`
- 의존성: 설치 도구에서 자동 설치
- 기존 설치 경로 존재 시: 기본 명령 중단, 자동 덮어쓰기 없음
- 지정 경로 설치: `npm run install:skill -- /absolute/path/uib-a`

<details>
<summary><strong>기존 설치 업데이트</strong></summary>

소스 저장소의 로컬 변경 여부 확인 후 최신 소스 수신·설치

```sh
git pull --ff-only
npm run install:skill -- --replace
```

- `--replace`: 새 설치와 의존성 준비 성공 후 활성 폴더 전환
- 이전 설치: 스킬 폴더와 분리된 backup 경로에 보존, 기본 설치의 경우 `skills-backups/`
- 지정 경로 업데이트: `npm run install:skill -- /absolute/path/uib-a --replace`
- 설치 반영 확인: 프로젝트에서 새 Codex 대화 시작

</details>

### 2. 프로젝트에서 호출

새 Codex 대화에서 대상 프로젝트를 연 뒤 아래 요청 사용

```text
$uib-a 고객 시작 화면과 PC 관리자 홈을 개선해줘.
실제 화면을 먼저 보고, 사용자가 해야 할 일과 찾기 어려운 정보를 짚어줘.
기존 데이터와 브랜드를 유지하면서 문제를 해결하는 시안을 만들어줘.
각 배치의 이유를 설명하고 Before/After를 한 HTML로 비교하게 해줘.
제품 코드는 수정하지 말고 HTML의 절대경로를 알려줘.
```

- 작업 순서: 프로젝트·화면 파악 → 실제 캡처 → 디자인 근거 정리 → After 작성 → HTML 생성·확인
- 프로젝트 준비: 캡처할 앱의 실행 환경·접근 가능한 화면
- 캡처 브라우저 미설치 시: 필요한 Playwright 브라우저 준비
- 스킬의 상세 작업 흐름: [SKILL.md](SKILL.md)

### 3. HTML 검토

1. 전달받은 HTML 열기·화면/기기/상태 선택
2. 기본 **비교만** 모드에서 Before/After 확인
3. 수정할 부분 발견 시 **간편 수정** 전환·요소 선택
4. 문구/글자색/크기 조정 후 **적용**, 또는 임시 삭제·수정 요청 작성
5. 상세 의견·판정·가져오기·내보내기 필요 시 **상세 검토** 전환
6. 상단 **검토 파일 저장** → 다운로드 완료 확인 → 저장본 다시 열기

<a id="modes"></a>

## 필요한 만큼 사용하는 3가지 모드

| 모드 | 주요 작업 | 도구 노출 | 배경 |
| --- | --- | --- | --- |
| **비교만** · 첫 진입 기본값 | 화면 선택·전후 비교·스크롤 | 편집 패널 숨김, 요소 선택·수정 차단 | 중립색 |
| **간편 수정** | 단일 요소 선택·임시 삭제/복원·문구/글자색/크기·짧은 요청·undo/redo | 요소 선택 후 편집 도구 표시 | 연녹색 |
| **상세 검토** | 다중/영역/텍스트 의견·답글·판정·상세 속성·비교 설정·파일 도구 | 관련 도구 그룹을 펼쳐 사용 | 연보라색 |

- 모드 버튼: 화면 상단 동일 위치·현재 모드 이름과 선택 상태 표시
- 모드 전환: 삭제·적용한 수정·의견·초안·현재 세션 undo/redo 이력 보존
- 데스크톱 기본 비교: Before/After 나란히 표시
- 모바일 기본 비교: Before/After 탭, After 첫 표시
- 저장본 재열기: 저장한 결과를 유지한 **비교만** 모드
- 비교만 모드의 저장 버튼: 미저장 변경 존재 시 표시

### 간편 수정의 범위

| 대상 | 가능한 작업 |
| --- | --- |
| 작성형 After의 수정 가능한 텍스트·요소 | 문구·글자색·글자 크기 조정, 임시 삭제, 요청 작성 |
| Before·캡처형 After | 캡처 영역 가리기·복원·요청 작성 |
| 찾기 어려운 요소 | `요소 찾기` 목록에서 선택 |

- After 삭제: DOM 숨김과 주변 레이아웃 재배치
- Before 삭제: 이미지 영역 가리기, 원본 이미지 보존
- 복원: 변경 내역·개별 복원·되돌리기/다시 실행
- 직접 수정 대상: 작성형 After의 허용된 요소, 이미지 안의 문구·스타일 편집 제외
- 반영 범위: 검토 HTML 내부, 실서비스 동작 변경에는 별도 구현 필요

<details>
<summary><strong>상세 검토 도구</strong></summary>

| 도구 | 내용 |
| --- | --- |
| 비교 설정 | 나란히/한쪽·맞춤/100%·슬라이더/겹침/픽셀 차이·원본/수정 결과 |
| 요소 정보·시안 수정 | 부모 요소·선택 ID/화면/revision/위치 복사·허용 스타일·디자인 토큰·내장 이미지 |
| 의견 | 단일/다중 요소·텍스트·영역·화면 의견, 작성자·우선도·답글·해결/재열기 |
| 검토 판정 | 승인/수정 요청·사유·일괄 판정, 내용·수정·주요 의견 변경 시 기존 승인 만료 |
| 파일 및 인계 | 검토 JSON·동일 bundle 가져오기·충돌 선택·Markdown/JSON 인계·PNG·요소 목록 |
| 로컬 체험 | 선언된 시안 화면 전이·로컬 details 동작 확인 |

- 슬라이더·겹침·픽셀 차이: 호환 조건을 충족한 raster 비교 대상에 한정
- 로컬 체험: 선언된 전이 범위, 원본 앱 스크립트 실행·서버 쓰기 제외
- PNG: 브라우저의 내장 raster 출력·CLI의 검증된 데이터 기반 현재 After 재구성
- 가져오기: 충돌 확인 후 선택 적용

</details>

<a id="save"></a>

## 저장과 후속 수정

| 상황 | 결과·주의점 |
| --- | --- |
| 모드 전환 | 현재 검토 결과·초안 유지 |
| 문구/스타일 입력만 변경 | 세션 내 입력 보존, **적용 후 저장** 필요 |
| 검토 파일 저장 | 원본 자료·의견/답글·의견 초안·판정·삭제·적용한 시안 수정 포함 새 HTML 다운로드 |
| 저장본 다시 열기 | 저장 시점 결과 유지·원본 복원 가능, 이전 세션 undo/redo 이력 비보장 |
| 저장 전 새로고침·닫기 | 마지막 파일 저장 이후 변경 유실 가능 |

- 자동 저장 없음·`localStorage` 의존 없음
- 미적용 문구/스타일 입력: 저장본 재열기 보장 제외
- 다운로드 시작 표시: 디스크 저장 완료의 자동 보장 아님, 브라우저 다운로드 확인 필요

저장본을 다음 Codex 작업에 전달하는 요청 예시

```text
$uib-a 첨부한 검토 HTML과 아래 요소 정보를 기준으로 수정해줘.
의견과 삭제 의도를 반영하고, 변경한 화면의 revision만 올려줘.
나머지 화면과 실제 Before 캡처는 보존해줘.
새 Before/After HTML의 절대경로를 알려줘.

[검토 도구에서 복사한 요소 정보]
```

<details>
<summary><strong>다른 요청 예시</strong></summary>

**명세부터 검토**

```text
$uib-a 현재 화면에서 사용자가 막히는 지점을 찾아줘.
유지할 정보, 바꿀 배치와 이유를 명세로 정리해줘.
아직 시안이나 제품 코드는 만들지 마.
```

**모바일·PC 동시 개선**

```text
$uib-a 모바일 390px에서는 현재 상태와 다음 행동이 먼저 보이게 해줘.
관리자 PC 1440px에서는 처리할 항목과 담당자·기한을 비교하기 쉽게 해줘.
원본에 있는 정보만 사용하고 두 화면을 Before/After HTML로 만들어줘.
```

**화면 추가**

```text
$uib-a 기존 검토 HTML에 설정과 결제 내역 화면을 추가해줘.
기존 시안·Before 캡처·검토 포맷은 보존해줘.
```

</details>

## After 작성 기준

- 사용자·다음 행동·필요 정보·기존 불편·브랜드 근거 확인
- 실제 화면과 디자인 참고의 과제·정보 밀도 비교
- 기존 데이터·용어·필수 정보·동의/확인 흐름 유지
- 각 배치·이미지·색·장식의 사용 목적 명시
- 장식용 영문·가짜 수치·목적 없는 카드 묶음 배제
- 예시의 색·레이아웃을 모든 프로젝트의 기본 템플릿으로 사용 금지
- 참고 출처·관찰 시점·공개 반응 지표·채택/제외 이유 기록
- 상세 기준: [디자인 계약](references/design-contract.md)·[시안 설계](references/product-design.md)·[조사 흐름](references/workflow.md)

<a id="docs"></a>

## 문서·직접 실행하는 도구

| 목적 | 문서 |
| --- | --- |
| 스킬 전체 흐름 | [SKILL.md](SKILL.md) |
| 디자인 근거·대안·필수 정보 | [디자인 계약](references/design-contract.md) |
| After 배치·문구·시각 검토 | [설계 기준](references/product-design.md) |
| 캡처·manifest·재생성 | [작성 가이드](references/authoring.md)·[JSON schema](references/manifest.schema.json) |
| 선택·수정·판정·저장 | [검토 동작 계약](references/review-contract.md) |
| 검증 범위·한계 | [확인 항목](references/acceptance.md) |
| 외부 자료의 재사용 범위·고지 | [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) |

<details>
<summary><strong>로컬 데모 생성</strong></summary>

소스 저장소에서 실행

```sh
npm ci
# Chromium 미설치 시; 다른 프로젝트의 브라우저 캐시 보존
PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium
npm run demo
```

- 열 파일: `output/demo/before-after.html`
- 기존 출력 보존용 새 경로: `npm run demo -- output/demo-2`
- Before: 포함된 캡처 재사용, After: 예제 소스에서 재생성
- 실제 프로젝트: 별도의 화면 캡처 필요

Windows PowerShell의 브라우저 설치

```powershell
$env:PLAYWRIGHT_SKIP_BROWSER_GC = '1'
npx playwright install chromium
```

- Linux 시스템 의존성: [Playwright 브라우저 설치 안내](https://playwright.dev/docs/browsers)

</details>

<details>
<summary><strong>캡처·빌드·검증·추출·내보내기 명령</strong></summary>

```sh
# 실제 화면 캡처
node scripts/capture.mjs /path/to/capture-config.json /path/to/captures
# 검토 HTML 생성
node scripts/build.mjs /path/to/manifest.json /path/to/review-1
# 생성 HTML 확인
node scripts/verify.mjs /path/to/review-1/before-after.html
# 저장본의 데이터 추출
node scripts/extract.mjs /path/to/saved-review.html /path/to/editable
# 로컬 디자인 자료 검색
node scripts/design-search.mjs --query "키보드 포커스"
# Markdown 인계
node scripts/export-review.mjs /path/to/saved-review.html /path/to/handoff --format md
# 현재 After PNG 출력
node scripts/export-review.mjs /path/to/saved-review.html /path/to/png --format png --view current
# 독립 패키지 생성
npm run package
```

- 입력 상대 경로 기준: 설정 파일 위치
- 출력: 기존 결과 보존용 새 폴더 사용
- 후속 수정: 바뀐 측의 revision 증가·기존 bundle/state 기반 재생성
- 저장본 추출·현재 PNG: 데이터 검증 후 처리, 전달받은 HTML의 앱 코드 실행 제외
- capture resume: 소스·설정·로컬 resource·산출물 hash 일치 시 재사용
- 저장 형식: v1 읽기·v2 쓰기, 이전 v1 도구의 v2 파일 미지원
- 패키지 생성: 로컬 archive 작성, 자동 게시 없음

</details>

## 지원 범위와 한계

- HTML/CSS 시안 기반, 대상 프로젝트의 특정 프레임워크 필수 조건 없음
- Before DOM 맵 미확보: 전체 이미지 선택 또는 명시적 수동 영역
- Before 미확보: `원본 미확보` 표시, 추측 화면의 실제 캡처 표기 금지
- raster 사각 영역 맵: transform·가려짐이 복잡한 화면의 별도 시각 확인 필요
- 자동 기능 검증: Chromium 기준, 통과 결과만으로 디자인 품질 확정 불가
- 3단계 모드 검증: Chromium·Firefox·WebKit, 2.1.1 정렬/배경 확인 폭 320~1600px
- WebKit 결과: 실물 Safari·iOS 검증의 대체 근거 아님
- 실물 터치·VoiceOver·다른 OS: 별도 확인 필요
- 디자인 참고: 관찰 가능한 후보·공개 지표 범위, 전체 인기 순위·전환율 향상 보장 없음
- 실제 검증 범위: 각 산출물의 보고서 기준

## 기여·라이선스

- 문제·개선 제안: [Issues](https://github.com/99duuk/uib-a/issues)
- 버그 제보: 브라우저·OS·재현 단계·기대 동작, 개인정보를 제거한 최소 예시
- PR: 변경 이유·확인한 동작 명시
- 제외 자료: 프로젝트 고유 캡처·인증 파일·`node_modules/`·`output/`
- [MIT License](LICENSE)·Copyright © 2026 99duuk
- 의존성·외부 디자인·폰트·이미지: 각 이용 조건 적용
- Community 프로젝트·OpenAI/Dribbble 공식 제품 아님
