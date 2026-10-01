# 시안 작성 및 명령

## 입력과 출력

아래 명령의 `<skill>`은 이 스킬 설치 폴더, `<work>`는 대상 프로젝트의 산출물 폴더입니다. `npm ci`는 스킬 폴더에서 실행합니다. 앱의 package.json을 수정할 필요가 없습니다.

```sh
node <skill>/scripts/capture.mjs <work>/capture-config.json <work>/captures
node <skill>/scripts/build.mjs <work>/manifest.json <work>/review-v1
node <skill>/scripts/verify.mjs <work>/review-v1/before-after.html
```

출력 폴더에 같은 HTML 또는 같은 캡처 ID가 있으면 덮어쓰기를 거부합니다. 새 실행 폴더를 사용합니다. schemaVersion은 현재 `1`이며 [manifest.schema.json](manifest.schema.json)이 구조의 기준입니다.

최소 manifest:

```json
{
  "schemaVersion": 1,
  "reviewId": "project-review",
  "project": {"key": "project", "title": "Project UI"},
  "viewports": [{"id": "mobile", "label": "모바일", "width": 390, "height": 844}],
  "brand": {"tone": "calm", "mode": "preserve-layout"},
  "research": [],
  "coverage": {"requested": ["home"], "completed": ["home-default-mobile"], "missing": []},
  "entries": [{
    "id": "home-default-mobile", "group": "고객", "screen": "home",
    "title": "홈", "state": "기본", "viewport": "mobile", "variant": "default",
    "route": "/home", "fixture": "local-demo", "notes": "샘플 데이터",
    "before": {"kind": "dom", "revision": "r1", "capture": "captures/home/capture.json"},
    "after": {"revision": "r1", "file": "after/home.html"}
  }]
}
```

모바일·PC는 별도 viewport/entry를 추가합니다. After HTML은 같은 파일을 재사용할 수 있지만 entry ID는 달라야 합니다. 같은 group/screen/state/viewport/variant 조합은 하나만 작성합니다. variant가 여러 개면 화면·상태·뷰포트마다 같은 이름을 사용해 비교하기 쉽게 합니다.

출력: `before-after.html`, `review-manifest.json`(정규화한 전체 데이터), `element-index.json`, `brand-profile.json`, `research.json`, `coverage.json`, README. HTML 자체에 데이터·이미지·스타일·검토 엔진을 내장하므로 HTML 하나만 옮겨도 열립니다.

## 캡처

```json
{
  "targets": [{
    "id": "home", "url": "http://localhost:3000/home",
    "width": 390, "height": 844, "dpr": 2,
    "ready": "main", "sourceRevision": "actual-source-sha-or-label",
    "tiles": [
      {"id": "top", "label": "상단"},
      {"id": "bottom", "label": "하단", "scroll": {"end": true}},
      {"id": "list", "label": "목록 내부", "scroll": {"selector": ".list-scroll", "y": 600}}
    ]
  }]
}
```

DOM 맵의 좌표는 CSS px, PNG의 실제 픽셀은 CSS px × DPR입니다. 같은 브라우저 상태에서 영역을 읽고 캡처합니다. 타일마다 스크롤 위치·viewport·DPR이 저장됩니다. 기본 타일은 상단/하단이며 중간 내용이 필요하면 명시적으로 추가합니다. 긴 페이지 전체의 임의 지점을 자동으로 캡처하지는 않습니다.

동적 화면은 신뢰할 수 있는 **프로젝트 로컬** adapter를 세 번째 인수로 전달합니다.

```js
export async function prepare({page, context, target}) {
  // Route mocked responses, select local fixture, open the intended modal.
  await page.locator('[data-open-preview]').click();
}
```

지원 hook: `beforeNavigate`, `prepare`, `beforeTile`. 각 hook은 `{page, context, target}`를 받고 마지막 hook은 `tile`도 받습니다. adapter는 Node.js 코드이므로 읽고 신뢰할 수 있는 파일만 실행합니다. adapter가 캡처 대상 앱의 상태 설정을 담당합니다.

기본 캡처는 GET/HEAD/OPTIONS 이외 요청과 WebSocket을 차단합니다. POST 조회가 필요한 앱은 adapter에서 해당 조회의 로컬 응답을 mock합니다. 이 설정이 GET 요청 자체의 무해함을 보장하지 않으므로 대상 환경을 먼저 확인합니다. `storageState`는 config 상대 경로로 지정할 수 있으나 인증 파일은 스킬·GitHub·공유 HTML에 넣지 않습니다. 캡처에 표시되는 실제 개인정보는 사전에 가명화합니다.

이미지만 있는 경우:

```json
{"kind":"image","revision":"r1","image":"before.png","width":390,"height":844}
```

수동 영역은 `kind: "manual"`과 `elements: [{"key":"title","label":"제목","rect":[24,40,200,30]}]`을 추가합니다. 좌표는 원본 픽셀을 DPR로 나눈 CSS 좌표입니다. Before가 없으면 `{"kind":"missing","revision":"unavailable"}`입니다. 이미지 모드는 화면 전체만 선택합니다.

## After 작성

레이아웃 작성 전 [After 설계 기준](product-design.md) 적용. 각 구역의 사용자 과제·정보 근거·변경 이유를 작업 메모에 기록. `examples/`의 레이아웃과 색은 별도 가상 프로젝트의 예시이며 다른 제품의 시작 템플릿으로 사용하지 않음.

완전한 HTML 문서와 반응형 CSS로 작성합니다. 실제 앱 스크립트·iframe은 제거되며 정적 디자인과 아래 선언적 전이만 지원합니다. 이미지·CSS·폰트 경로는 해당 파일 기준의 로컬 상대 경로로 작성합니다. HTTP 자산은 먼저 사용 권한을 확인해 로컬에 준비합니다. CSS @import는 펼쳐 넣습니다. 동영상·실행 가능한 SVG·srcset은 지원하지 않습니다.

```html
<main data-review-key="home-content" data-review-label="홈 본문">
  <h1 data-review-key="greeting">안녕하세요</h1>
  <button data-review-key="start" data-review-entry="home-confirm-mobile">시작</button>
</main>
```

key는 위치 인덱스 대신 `membership-progress`, `coupon-primary-action`처럼 의미를 나타냅니다. 한 엔트리 안에서 유일해야 합니다. body는 예약 key `root`로 설정됩니다. 제목·문단·버튼·입력·이미지·SVG·summary에 key 또는 `data-review-ignore`가 필요합니다. 장식 요소는 ignore, 실제 검토 대상은 key를 부여합니다. 접근 가능한 이름·라벨은 HTML에도 작성합니다.

원하는 요소 범위를 감싸는 컨테이너에도 key를 주면 상위 요소 선택과 묶음 삭제가 가능합니다. 열기/닫기 등의 화면 전이는 버튼의 `data-review-entry`로 정의합니다. 실제 데이터 전송은 구현하지 않습니다.

## 저장본에서 이어서 수정

```sh
node <skill>/scripts/extract.mjs <saved-review.html> <work>/editable-v2
```

추출기는 HTML의 JSON 데이터만 읽으며 앱 코드를 실행하지 않습니다. `manifest.json`, 원래 bundle, 삭제 상태, After 원본, 캡처 이미지·맵을 복구합니다. `manifest.json`은 이전 bundle과 review-state를 참조하므로 바로 재빌드할 수 있습니다.

1. manifest의 entry를 찾고 해당 `after.file`을 수정합니다.
2. 바뀐 side의 `revision`을 `r1` → `r2`로 증가시킵니다. Before가 그대로면 그 revision은 유지합니다.
3. 새 폴더로 build합니다. 같은 revision의 내용 변경은 빌드 오류입니다.
4. 이전 ID 중 새 revision에 없는 것은 `unresolved`에 남습니다. 새 요소에 삭제를 자동 전파하지 않습니다. 사용자 의도가 여전히 유효한지 확인한 뒤 새 ID로 적용합니다.

Before 타일을 추가하거나 다시 캡처한 경우에도 Before revision을 증가시킵니다. 같은 revision 안에서 자동 생성된 캡처 인덱스는 해당 캡처에만 유효합니다. 다른 캡처의 DOM 순서가 같다고 이전 ID를 재사용하지 않습니다.
