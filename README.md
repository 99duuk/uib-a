<div align="center">

# uib-a

### 바꾸기 전에, 나란히 보고 결정하세요.

**현재 UI와 개선 시안을 하나의 HTML로.**<br>
모바일부터 PC까지, 요소를 선택하고 지우고 복원하며 디자인을 구체화하는 Codex 스킬.

[![License: MIT](https://img.shields.io/badge/License-MIT-3e6450.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-294b3e.svg)](package.json)
[![Codex Skill](https://img.shields.io/badge/Codex-Skill-182b3a.svg)](SKILL.md)
[![Offline HTML](https://img.shields.io/badge/Review-Offline_HTML-d9a441.svg)](#preview)

**한국어** · [English](README.en.md)

[미리 보기](#preview) · [빠른 시작](#quick-start) · [사용 예시](#prompts) · [검토 기능](#features) · [문서](#docs)

</div>

---

## What is uib-a?

`uib-a`는 **UI Before / After**를 만드는 Codex 스킬입니다.

프로젝트의 실제 화면과 브랜드를 파악하고, Dribbble에서 확인한 디자인의 **레이아웃·여백·정보 위계**를 서비스에 맞춰 재구성합니다. 결과는 현재 화면과 개선 화면을 함께 검토할 수 있는 **독립 HTML 파일 하나**입니다.

화면을 보고 끝내지 않아도 됩니다. 마음에 걸리는 요소를 선택해 수정 요청을 복사하고, 잠시 지워 배치를 확인한 뒤, 검토 상태를 저장해 다음 수정으로 이어갈 수 있습니다.

```text
현재 프로젝트 + 브랜드 + 디자인 참고
                 ↓
       실제 Before / 개선 After
                 ↓
    요소 선택 → 삭제·복원 → HTML 저장
                 ↓
       저장본으로 다음 시안 다듬기
```

## Why use it?

“좀 더 예쁘게”라는 요청을 **비교하고 결정할 수 있는 화면**으로 바꿉니다.

| 이런 순간에 | uib-a로 할 수 있는 일 |
| --- | --- |
| 개발 전에 디자인 방향을 정하고 싶을 때 | 제품 코드를 바꾸기 전에 Before/After 시안 검토 |
| 레퍼런스는 좋은데 우리 서비스와 어울리지 않을 때 | 구조·여백을 참고하고 브랜드 색·문구·밀도로 재구성 |
| “저 카드 안의 버튼”이 어느 요소인지 헷갈릴 때 | 요소 ID·화면·버전·위치를 함께 복사해 수정 대상 전달 |
| 화면에서 무엇을 덜어낼지 판단하기 어려울 때 | 요소를 임시 삭제하고 주변 배치 확인, 언제든 복원 |
| 모바일과 관리자 PC 화면을 같이 검토해야 할 때 | 실제 화면 크기가 다른 시안을 같은 검토 포맷으로 비교 |
| 리뷰 도구를 설치하기 어려운 사람에게 보여줄 때 | HTML 하나를 전달하고 브라우저에서 오프라인 열람 |

**기본 산출물은 시안입니다.** 실제 서비스 코드 반영은 검토 후 별도로 요청합니다.

<a id="preview"></a>

## Preview

### PC · 업무 대시보드

![PC 업무 화면의 Before/After와 하단 요소 검토 도구](docs/images/desktop-review.png)

<details>
<summary><strong>모바일 · 독서 앱 시안도 보기</strong></summary>

![모바일 서재 화면의 Before/After](docs/images/mobile-review.png)

</details>

**직접 눌러보고 싶다면:** [데모 HTML 다운로드](https://raw.githubusercontent.com/99duuk/uib-a/main/docs/demo/before-after.html) → 파일로 저장 → 브라우저로 열기.

데모에는 모바일 서재·읽기 확인 모달·PC 프로젝트 홈·모바일 프로젝트 홈이 들어 있습니다. 가상 브랜드의 예시이며, Before는 함께 제공한 예시 HTML을 실제로 캡처한 화면입니다. 실제 고객 서비스나 Dribbble 순위·성과 사례로 제시하지 않습니다.

<a id="quick-start"></a>

## Quick start

### 1. 스킬 설치

준비물: **Codex, Node.js 22 이상, npm, Git**. 최초 의존성 설치와 디자인 조사에는 인터넷이 필요합니다.

```sh
git clone https://github.com/99duuk/uib-a.git
cd uib-a
npm run install:skill
```

설치 위치는 `$CODEX_HOME/skills/uib-a`입니다. `CODEX_HOME`이 없으면 `~/.codex/skills/uib-a`를 사용합니다. 설치 명령이 필요한 Node 의존성을 함께 설치합니다.

<details>
<summary>사용자 지정 경로 · 기존 설치가 있는 경우</summary>

```sh
npm run install:skill -- /absolute/path/uib-a
```

기존 폴더는 자동으로 덮어쓰지 않습니다. 기존 설치를 보관한 뒤 새 경로에 설치하거나, 변경 내용을 검토해 직접 갱신하세요. 사용자 지정 경로는 사용하는 Codex 환경이 스킬을 찾는 위치에 맞춰 지정합니다.

</details>

### 2. 프로젝트에서 호출

대상 프로젝트를 열고 새 Codex 대화에서 요청합니다.

```text
$uib-a 이 프로젝트의 고객 시작 화면과 PC 관리자 홈을 개선해줘.
Dribbble에서 반응과 적합도를 확인하고 우리 브랜드 톤으로 재구성해.
현재 화면과 개선 화면을 하나의 HTML에서 비교하게 만들어줘.
제품 코드는 수정하지 말고 결과 HTML의 정확한 절대경로를 알려줘.
```

Codex가 프로젝트 구조와 화면 범위를 확인하고, Before 캡처와 After 제작을 진행합니다. 캡처용 Chromium이 없으면 스킬의 설치 안내에 따라 준비합니다.

### 3. 열고, 선택하고, 전달

1. 전달받은 HTML을 브라우저로 엽니다.
2. 화면·상태·크기를 고르고 Before/After를 비교합니다.
3. 수정할 요소를 선택하고 **복사**한 내용을 채팅에 붙여 넣습니다.
4. 필요하면 **임시로 지우기 → 복원**으로 구성을 비교합니다.
5. **삭제 반영본 저장**으로 새 HTML을 받아 다음 리뷰에 사용합니다.

> 생성된 HTML은 서버 없이 열립니다. 받는 사람에게 Codex나 Node.js를 설치할 필요가 없습니다.

<a id="features"></a>

## Review features

| 기능 | 사용 방법 |
| --- | --- |
| 화면과 상태 선택 | 그룹·화면·상태·뷰포트·시안을 전환 |
| 비교 방식 | 나란히 보기, Before만, After만 |
| 실제 크기 확인 | 영역에 맞춤 또는 100% 배율 |
| 요소 선택 | 클릭·터치·키보드·요소 목록으로 선택 |
| 선택 범위 확장 | 버튼에서 카드·섹션 등 상위 요소로 이동 |
| 정확한 수정 요청 | 화면·요소 ID·버전·위치를 함께 복사 |
| 임시 삭제 | After는 요소를 숨겨 재배치, Before는 해당 이미지 영역을 가림 |
| 복원 | 개별 복원·되돌리기·모두 복원 |
| 검토 내용 저장 | 삭제 목록 복사, 삭제 상태를 포함한 새 HTML 다운로드 |
| 이어서 작업 | 저장본에서 원본·선택 색인·삭제 상태를 추출해 재편집 |
| 로컬 체험 | 작성된 화면 간 전이를 명시적 체험 모드에서 확인 |

**저장 동작:** 저장 전 새로고침하면 임시 삭제가 초기화됩니다. 저장한 HTML은 다시 열어도 저장 당시 삭제 상태를 유지하며, 그 안에서도 원본을 복원할 수 있습니다.

<a id="prompts"></a>

## Prompts you can copy

### 모바일·PC 시안을 함께 만들기

```text
$uib-a 고객 홈은 모바일 390px, 관리자 홈은 PC 1440px로 시안 만들어줘.
기존 기능과 필수 문구는 유지하고, 여백과 정보 위계를 개선해줘.
Before/After를 한 HTML로 만들고 요소 선택·삭제·저장까지 가능하게 해줘.
```

### 구현 전에 명세부터 정하기

```text
$uib-a 바로 만들지 말고 대상 화면, 참고 디자인 방향,
브랜드 적용 기준과 비포애프터 검토 범위부터 명세해줘.
```

### 나머지 화면 추가하기

```text
$uib-a 기존 비포애프터 HTML의 포맷을 유지해서
설정 화면과 결제 내역 화면도 추가해줘.
기존 시안과 Before 캡처는 보존해줘.
```

### 저장한 리뷰로 다음 시안 만들기

```text
$uib-a 첨부한 저장본과 아래 요소 선택 정보를 기준으로 수정해줘.
삭제 의도를 확인하고, 바뀐 화면만 새 버전으로 만들어줘.

[검토 도구에서 복사한 요소 정보를 여기에 붙여 넣기]
```

## Try the demo locally

스킬을 호출하지 않고 검토 도구부터 살펴볼 수 있습니다. 아래 명령은 **복제한 저장소 폴더**에서 실행합니다.

```sh
npm ci
```

캡처 브라우저가 없으면 설치합니다. 다른 프로젝트의 브라우저 캐시는 보존합니다.

```sh
# macOS / Linux
PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium
```

<details>
<summary>Windows PowerShell</summary>

```powershell
$env:PLAYWRIGHT_SKIP_BROWSER_GC = '1'
npx playwright install chromium
```

</details>

```sh
npm run demo
```

**`output/demo/before-after.html`을 열면 됩니다.** 기존 결과가 있으면 새 경로를 지정합니다.

```sh
npm run demo -- output/demo-2
```

Linux의 브라우저 시스템 의존성은 [Playwright 설치 안내](https://playwright.dev/docs/browsers)를 참고하세요.

<a id="docs"></a>

## Documentation

| 알고 싶은 것 | 문서 |
| --- | --- |
| 스킬이 프로젝트를 어떻게 진행하는가 | [SKILL.md](SKILL.md) |
| Dribbble 조사와 브랜드 적용 기준 | [작업 흐름](references/workflow.md) |
| 캡처·After HTML·manifest 작성 | [작성 가이드](references/authoring.md) |
| 선택 ID·부모/자식 삭제·저장 규칙 | [검토 동작 계약](references/review-contract.md) |
| 확인 항목과 지원 범위 | [검증 범위](references/acceptance.md) |
| 입력 JSON 형식 | [Manifest schema](references/manifest.schema.json) |

<details>
<summary><strong>직접 실행하는 도구 명령</strong></summary>

```sh
# 현재 화면 캡처
node scripts/capture.mjs /path/to/capture-config.json /path/to/captures

# 시안 HTML 생성
node scripts/build.mjs /path/to/manifest.json /path/to/review-v1

# 검토 도구 동작 확인
node scripts/verify.mjs /path/to/review-v1/before-after.html

# 저장본을 편집 가능한 자료로 추출
node scripts/extract.mjs /path/to/saved-review.html /path/to/editable

# 독립 스킬 패키지 생성
npm run package
```

입력 파일의 상대 경로는 해당 설정 파일을 기준으로 해석합니다. 출력은 기존 결과를 보존하도록 새 폴더를 사용합니다. 저장본 수정 시 바뀐 화면의 revision을 증가시키는 절차는 [작성 가이드](references/authoring.md)를 참고하세요.

</details>

## FAQ

<details>
<summary><strong>특정 프레임워크에서만 사용할 수 있나요?</strong></summary>

검토 결과는 HTML/CSS 기반입니다. 대상 프로젝트의 실행·캡처 방법은 프로젝트에 맞게 준비하며, 특정 프레임워크를 필수로 요구하지 않습니다.

</details>

<details>
<summary><strong>Dribbble에서 무조건 인기 1위 디자인을 가져오나요?</strong></summary>

접근 가능한 후보에서 공개 반응 지표와 화면 목적의 적합도를 확인합니다. 전체 순위나 보이지 않는 수치를 만들어내지 않으며, 참조 출처·관찰 시점·적용 이유를 남깁니다. 디자인의 구조와 여백을 참고하고 프로젝트 브랜드로 다시 작성합니다.

</details>

<details>
<summary><strong>원본 캡처가 없으면 어떻게 하나요?</strong></summary>

제공 이미지의 전체 선택 또는 수동 영역 모드를 사용할 수 있습니다. Before를 확보하지 못한 경우에는 미확보로 표시합니다. 추측한 화면을 실제 원본으로 소개하지 않습니다.

</details>

<details>
<summary><strong>요소를 지우면 제품 코드도 삭제되나요?</strong></summary>

삭제는 시안 검토 안에서만 적용됩니다. 실제 제품 수정은 선택 정보와 검토 결과를 바탕으로 별도로 요청합니다. Before 삭제는 캡처 영역을 가리는 방식이고, After 삭제는 DOM을 숨겨 레이아웃이 재배치됩니다.

</details>

<details>
<summary><strong>어디까지 확인된 상태인가요?</strong></summary>

초기 버전은 macOS Chromium에서 공통 검토 41개 항목과 추가 입력·데이터 규칙 20개 항목을 확인했습니다. 모바일 입력은 에뮬레이션으로 확인했으며 Safari·Firefox·실제 모바일 기기·다른 OS까지 검증한 것은 아닙니다. 실제 생성물은 해당 프로젝트에서 다시 확인합니다.

</details>

## Contributing

사용 중 발견한 문제와 개선 아이디어는 [Issues](https://github.com/99duuk/uib-a/issues)에 남겨주세요. 버그 제보에는 브라우저·OS·재현 단계·기대한 동작을 적으면 도움이 됩니다. 예시 HTML은 개인정보와 인증 정보를 제거한 최소 파일로 공유해 주세요.

PR에는 변경 이유와 확인한 동작을 함께 적어주세요. 프로젝트 고유 캡처, `node_modules/`, `output/`, 인증 파일은 소스에 포함하지 않습니다.

## License & credits

[MIT License](LICENSE) · Copyright © 2026 99duuk

의존성: [Playwright](https://playwright.dev/), [Linkedom](https://github.com/WebReflection/linkedom), [Ajv](https://ajv.js.org/). 각 의존성과 별도로 가져오는 디자인·폰트·이미지에는 해당 저작권자의 이용 조건이 적용됩니다.

이 저장소의 예시는 가상 브랜드로 제작했습니다. 스킬은 커뮤니티 프로젝트이며 OpenAI 또는 Dribbble의 공식 제품이 아닙니다.

---

유용했다면 ⭐로 저장해 두세요. 다음 프로젝트에서도 `$uib-a`로 같은 검토 흐름을 이어갈 수 있습니다.
