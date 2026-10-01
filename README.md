# uib-a — UI Before / After

Dribbble에서 확인한 레이아웃·여백·정보 위계를 프로젝트 브랜드에 맞춰 재구성하고, **하나의 HTML에서 Before/After를 검토**하는 Codex 스킬입니다. 모바일 고객 화면과 PC 운영 화면에 같은 검토 도구를 적용합니다.

## 사용

설치한 뒤 프로젝트에서 새 Codex 대화를 열고 다음처럼 요청합니다.

```text
$uib-a 현재 프로젝트의 고객 시작 화면과 PC 관리자 홈을 개선해줘.
Dribbble에서 반응과 적합도를 확인하고 우리 브랜드 톤으로 재구성해.
현재 화면을 Before로 캡처하고, After와 한 HTML에서 비교하게 만들어줘.
제품 코드는 수정하지 말고 결과 HTML의 정확한 절대경로를 알려줘.
```

이어서 `저장한 HTML에서 선택한 요소를 수정해줘`, `나머지 화면도 같은 포맷으로 추가해줘`, `PC 1440 / 모바일 390 크기로 만들어줘`라고 요청할 수 있습니다. 명세만 요청하면 명세 단계에서 멈춥니다.

## 포함 기능

- 실제 화면 캡처와 DOM 영역 매핑, 이미지·수동 영역 대체 모드
- 화면 그룹·화면·상태·뷰포트·시안 선택, 나란히/단독 비교, 맞춤/100% 표시
- 클릭·터치·요소 목록 선택, 상위 요소 선택, 식별 정보 복사
- After 요소 삭제와 레이아웃 재배치, Before 영역 마스킹
- 개별 복원·되돌리기·모두 복원, 삭제 목록 복사
- 삭제 상태를 담은 HTML 저장, 재열람·새로고침 후 복원
- 외부 서버 없이 열리는 단일 HTML, 추출 후 재편집·재생성

## 설치

Node.js 22 이상이 필요합니다. 이 저장소를 내려받은 폴더에서 실행합니다.

```sh
npm run install:skill
```

설치 경로는 `$CODEX_HOME/skills/uib-a`, `CODEX_HOME`이 없으면 `~/.codex/skills/uib-a`입니다. 기존 설치를 덮어쓰지 않습니다. 사용자 지정 경로는 `npm run install:skill -- /absolute/path/uib-a`로 지정합니다.

캡처·검증에 필요한 Chromium이 없다면 **설치된 스킬 폴더에서** 실행합니다. 기존 프로젝트의 브라우저 캐시를 보존하도록 GC를 끕니다.

```sh
# macOS / Linux
PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium
```

PowerShell: `$env:PLAYWRIGHT_SKIP_BROWSER_GC='1'` 설정 후 `npx playwright install chromium`. Linux 시스템 의존성이 필요하면 [Playwright 설치 문서](https://playwright.dev/docs/browsers)를 확인합니다. 최초 의존성 설치·디자인 조사에는 네트워크가 필요하며, 생성된 HTML 열람은 오프라인입니다.

## 데모와 도구

이 소스 폴더에서 직접 실행할 때는 먼저 `npm ci`를 실행합니다.

```sh
npm run demo
npm run verify:demo
node scripts/extract.mjs output/demo/before-after.html output/editable
node scripts/build.mjs output/editable/manifest.json output/rebuilt
npm run package
```

`output/demo/before-after.html`에 가상의 독서 앱과 업무 대시보드 4개 화면 상태가 생성됩니다. 데모 Before는 예시 HTML을 실제 캡처한 것이며, 실서비스 또는 Dribbble 조사 결과로 제시하지 않습니다. 재실행은 `npm run demo -- output/demo-2`처럼 새 출력 폴더를 사용합니다.

- [작성 방법](references/authoring.md): 입력 형식·캡처·재편집
- [작업 흐름](references/workflow.md): 실제 조사·브랜드·범위 결정
- [검토 동작 계약](references/review-contract.md): 식별자·삭제·저장
- [검증 범위](references/acceptance.md): 확인 항목·제약

## GitHub에 보관하기

이 폴더가 독립 저장소의 루트입니다. `node_modules/`, `output/`, `dist/`, 사용자 캡처와 인증 파일은 공개 대상에서 제외합니다. `npm run package`는 허용된 스킬 파일만 `.tgz`로 묶으며 업로드하지 않습니다. 저장소 생성·원격 연결·push는 사용자가 지정한 GitHub 저장소를 대상으로 별도로 수행합니다.

라이선스는 소유자가 정하기 전까지 `UNLICENSED`입니다. 공개 재사용을 허용하려면 게시 전에 원하는 라이선스를 선택하고 LICENSE 파일과 package.json을 함께 갱신하세요. 예시는 이 패키지용으로 작성했으며 제3자 디자인·폰트·사진을 포함하지 않습니다.

런타임 의존성: [Playwright](https://playwright.dev/), [Linkedom](https://github.com/WebReflection/linkedom), [Ajv](https://ajv.js.org/). 정확한 버전은 package-lock.json에 고정되어 있습니다.
