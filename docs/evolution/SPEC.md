# uib-a 확장 명세

- 문서 상태: v2 구현 기준; 실제 확인 범위와 한계의 [구현 현황](IMPLEMENTATION.md) 기록
- 작성 일자: 2026-10-13
- 기준 소스: `de59afcfa3b1e357ab978c3dc55f2ed08dc2dbf5` · 패키지 `1.1.1`
- 작성 브랜치: `docs/evolution-plan`
- 요청 범위: 유사 공개 프로젝트의 기능·사용성·컨셉·UI·UX 비교 및 재사용 설계
- 관련 문서: [비교·채택 근거](COMPARISON.md) · [구현 순서·완료 조건](PLAN.md) · [비판 검토·개선 근거](REVIEW.md)
- 이번 산출 범위: 명세·계획·근거 문서; 실행 코드·설치본 변경 없음

## 1. 제품 방향

- 제품 개념: **실제 화면의 근거 수집 → 디자인 대안 → 화면 위 검토 → 수정 요청 → 재검토**를 연결하는 스킬
- 최종 전달물: 원본 화면·시안·코멘트·판정·변경 의도의 이동 가능한 오프라인 HTML 한 파일
- 주 사용자: 시안을 검토하는 요청자, 개선안을 만드는 에이전트, 수정 요청을 구현하는 개발자
- 핵심 가치: 정확한 대상 지정, 변경 이유의 추적, 모바일 검토, 저장 후 후속 작업의 연속성
- 런타임 원칙: 기존 Node 빌더·Playwright 캡처·프레임워크 독립 JavaScript 리뷰어 유지
- 수용 범위: 아래 F01~F18 전부; 단계별 완료의 전체 완료 오인 금지
- 별도 제품 범위: 실시간 공동 편집 서버, 계정·결제, 배포 자동화, 범용 사이트 빌더, 임의 JavaScript 실행, 제삼자 디자인 자산 묶음 판매

## 2. 현재 기준과 보존 조건

| 기준 | 현재 구현 | 보존·확장 조건 |
| --- | --- | --- |
| 실제 Before | 스크린샷·DOM 영역·수동 영역·이미지·누락 표기 | 실제 캡처와 추정 화면의 구분 유지 |
| After | 의미 키를 가진 정적 HTML | 정적 HTML과 실행 앱 캡처의 구분 추가 |
| 정체성 | project/entry/side/revision/key 기반 ID | 의미 키·변경 revision·이전 원본 보존 |
| 삭제 | Before 마스킹·After DOM 숨김과 재배치 | 동작 차이의 표시·개별 복원·부모/자식 의도 보존 |
| 저장 | 전체 원본과 삭제 상태의 HTML 내장 | 코멘트·판정·시안 수정·근거까지 내장 |
| 후속 작업 | JSON 추출·변경 revision 확인·미해결 ID 보존 | v1 이행·판정 만료·검토 기록 재연결 |
| 격리 | sandbox iframe·CSP·message 토큰 | `allow-same-origin` 없이 유지 |
| 검증 | Chromium 오프라인 이동본·선택·삭제·복원·저장 검사 | 기존 `scripts/verify.mjs` 확장; 시각 판단 별도 |

- 근거 파일: `scripts/{capture,build,extract,lib,verify}.mjs`, `assets/reviewer/{shell.html,viewer.js,viewer.css,frame.js}`
- 현재 UI 관찰: 상단 다수 필터·가로 Before/After·하단 상시 선택 패널; 긴 요소 목록과 시안 대비 작은 글자
- 현재 공백: 일반 코멘트·다중 선택·영역/텍스트 주석·redo·화면 판정·시각 diff·캡처 재개·디자인 기준 계약의 부재
- 현 상태 주의: 저장소와 두 설치본의 동일 버전 `1.1.1`에도 11개 추적 파일 내용 차이와 2개 fixture/spec 누락; 릴리스 출처 식별 필요

## 3. 기능 계약

| ID | 기능 | 사용자 동작·산출물 | 완료 기준 |
| --- | --- | --- | --- |
| F01 | 과제·브랜드 계약 | 사용자 과제·필수 정보·주요 동선·유지/변경 가능 범위·브랜드 근거 정리 | 원본/관찰/추론/사용자 확정 구분; 필수 가격·조건·상태 누락 검출 |
| F02 | 참조 검색·채택 기록 | 로컬 UX 자료 검색과 외부 시각 참조 비교 | 출처·조회 근거·채택 원칙·미채택 이유·적용 위치; 한국어 질의 지원 |
| F03 | 대안·비평·수렴 | 같은 콘텐츠·상태 기반의 의미 있는 대안과 수정 | 레이아웃/행동 구조의 차이·장단점·근거; P0~P3 지적과 수정 결과 연결 |
| F04 | 반복 가능한 캡처 | viewport·DPR·폰트·이미지·동작 정지·fixture 조건 통일 | 캡처별 provenance·실패/누락 이유·이미지와 영역의 상태 일치 |
| F05 | 중단 후 재개 | 완료 target 재사용·실패 target 재시도 | 입력/소스/adapter/fixture/환경 fingerprint 및 파일 hash 일치 시에만 재사용 |
| F06 | 시각 비교 | 나란히·한쪽·슬라이더·투명 겹침·픽셀 차이·확대 | 같은 캡처 조건에서만 정량 diff; 변경 영역과 의미 요소 연결 |
| F07 | 요소 탐색 | 클릭·키보드·계층 목록·다중/영역 선택 | 정확한 frame·side·revision·배율·scroll 반영; 터치 대체 조작 |
| F08 | 화면 위 의견 | 요소·다중 요소·텍스트·사각 영역·화면 전체 코멘트 | 원문 인용·위치·ID·답글·작성 시각·우선도·상태 저장; 누락 DOM에서도 영역 의견 가능 |
| F09 | 화면 판정 | 미검토·승인·수정 요청·보류 및 시안 선택 | 판정 대상의 content hash 고정; 내용 변경 시 재검토 필요 표시 |
| F10 | 변경 관리 | 삭제·개별/일괄 복원·undo/redo·변경 목록 | 일괄 행동의 한 번 undo; 텍스트 입력 중 단축키 비간섭 |
| F11 | 저장·가져오기·이행 | 새 HTML 저장·JSON import/export·v1 파일 추출 | 다른 경로·새 브라우저·오프라인에서 모든 상태와 원본 복원 |
| F12 | 빠른 시안 조정 | After 텍스트·허용 디자인 토큰·여백·정렬·자산 교체 제안 | 원본 불변·미리보기 구분·undo/redo·수정안 export·재생성 연결 |
| F13 | 구현 인계 | 선택 맥락·의견·판정·수정 의도의 Markdown/JSON | 대상 ID·revision·요구/현재/기대·근거·필수 유지 정보·미해결 항목 포함 |
| F14 | 선택적 소스 연결 | 캡처 시 제공 가능한 파일/행/컴포넌트 맥락 수집 | 어댑터 부재 시 DOM/영역 fallback; 근거 없는 소스 위치 생성 금지 |
| F15 | 검토 UI·접근성 | 화면 목록·진행 상태·집중 캔버스·맥락 패널·모바일 시트 | 작은 화면·키보드·터치·확대·색상 구분·포커스 복원 |
| F16 | 증거 묶음 | 화면/선택 영역 PNG·비교 이미지·검토 요약 export | 원본 raster의 브라우저 export·현재 DOM의 로컬 CLI 재캡처; 실제 revision 연결 |
| F17 | 안전한 입력·출력 | 계약 검증·격리·위험 자산 차단·크기 한도 | 현재 신뢰 경계 유지; 악성 텍스트·외부 URL·경로 탈출·오래된 message 거절 |
| F18 | 설치·릴리스 일치 | 출처 SHA·패키지 hash·고지·설치 검사 | 검증한 패키지와 실제 사용 skill 일치; 이전 설치본 보존 |

### F01~F03: 디자인 작업 규칙

- 계약 산출물: `design-contract.json`; 사람용 요약의 HTML 근거 탭 표시
- 제품 사실: 사용자 역할, 핵심 과제, 필수 콘텐츠 키, 필드/상태/동선, 기존 화면 근거
- requiredContent 항목: key·근거·적용 entry/state/viewport/variant·필수 값/의미 제약·관련 action/transition·대상 의미 키·present/missing/unverified·비적용 이유
- 핵심 동선: 시작 entry→사용자 행동→중간 상태→완료/실패 결과의 coverage 행; 문자열 존재와 실제 가시성/행동 연결의 별도 점검
- 필수 정보 실패: 숨겨진 가격/조건·모바일/오류/확인 상태의 누락·단절된 CTA의 missing; 미관찰/미체험 동선의 unverified와 미완료 표시
- 시각 기준: 색·타입·간격·크기·밀도·이미지·모션·반응형 규칙, 출처별 확신 수준
- 변경 경계: `preserve-layout` 기본; 사용자 요청 시 `recompose-layout`; 화면별 예외와 이유
- 기존 `brand`·`research`·`coverage`의 계약 참조 연결; 같은 사실의 여러 파일 중복 관리 최소화
- 기존 PRODUCT/DESIGN 문서 존재 시 재사용; 충돌 항목만 결정 기록
- 검색 재료: 출처 확인된 UX·접근성·유형별 구성 자료; 제품 브랜드보다 추천 데이터의 우선 적용 금지
- 외부 참조: 원본 링크·저자·관찰 일자·직접 본 이미지 여부; 지표 부재 시 `null`
- 대안 개수: 비교 요청의 의미 있는 2~3개 방향; 단순 정돈 요청의 불필요한 대안 생성 제외
- 대안 차이: 정보 우선순위·탐색 위치·동작 순서·정보 밀도; 색상만 다른 시안의 별도 방향 취급 제외
- 비평 기록: `designContract.critiques[]`의 issueId·target·revision·priority·evidence·why·fix·resolution·round; `variants[]`의 hypothesis·preserved·changed·tradeoffs·selected 및 requiredContent 점검 결과
- 비평 항목: 과제 달성, 필수 정보, 위계, 탐색, 문구, 접근성, 반응형, 상태, 브랜드 일치
- 우선도: P0 사용 불가/핵심 정보 손실, P1 주요 과제 방해, P2 이해·효율 저하, P3 표현 정돈
- 완료 조건: 주요 지적의 해결/보류 사유, 선택안의 현재 revision에 대한 사용자 판정; 미감 점수만으로 자동 승인 금지

### F04~F06: 캡처·비교 규칙

- 렌더 조건: viewport·DPR·browser/version·locale·timezone·color scheme·reduced motion·font/asset 준비 상태
- 상태 조건: 화면·역할·fixtureVersion·mask 규칙·adapter hash·scroll container/tile·sourceRevision
- 캡처 의미 hash: image bytes·영역 key/parent/rect·실제 scroll·렌더/fixture 조건 기준; capturedAt·실행 소요 시간·출력 경로의 제외
- provenance hash: 전체 수집 기록 무결성의 별도 값; 의미 hash와 revision/판정 연결의 구분
- 안정화: 현재 fonts/images 대기·animation/transition/caret 정지·두 frame 대기 재사용; 움직이는 캔버스/동영상의 adapter 또는 한계 표기
- 타일별 준비: scroll/lazy image 이후 이미지·폰트 준비와 geometry 재수집
- 재개 기록: target별 `pending/running/succeeded/failed`와 fingerprint·파일 hash; 임시 파일 작성 후 같은 디렉터리 rename
- 재개 실패: 누락/손상 PNG·설정/fixture/adapter/source 변경·알 수 없는 소스 상태의 재캡처
- 원본 정책: 기존 완료 run 수정 금지; 새 run으로 검증된 capture의 복사/참조 후 자체 포함
- 캡처 경로: 기존 로컬 서버·사용자 제공 before/after URL·명시 제공 baseline; 자동 worktree 생성과 호스트 저장소 규칙 우회 금지
- After 입력: 작성 HTML 또는 실제 앱 캡처; 캡처형 After의 마스킹과 작성형 After의 DOM 재배치 차이 표시
- 슬라이더/겹침: 양쪽 raster와 정렬 조건 필요; 불일치 시 나란히 비교와 구체적 불일치 사유
- authored After raster: 빌드 시 정적 After를 동일 브라우저·tile 조건으로 캡처; 원본 시안 revision/hash와 연결
- diff 전제: 동일 viewport·DPR·렌더 프로필·fixture·화면 상태·tile/scroll; 비교 대상 sourceRevision 차이는 허용
- diff 산출: changedPixels·ratio·명시 mask·diff PNG·변경 영역 bbox; alpha mask 기준 bbox 계산
- diff 의미: 픽셀 변경의 위치·규모; UX 품질·정확성·승인 여부와 구분
- 이미지 크기 불일치: 자동 늘이기/빈 공간 보정 없이 비교 불가; 의도적 리사이즈 시 별도 시각 비교
- 스크롤 동기화: 같은 tile 또는 작성자가 매핑한 의미 anchor 우선; 비율 기반 동기화의 근사 표시
- 현재 삭제/미리보기 조정의 원본 diff 혼입 금지; 원본 비교와 현재 검토 결과 보기의 명시적 전환

### F07~F10: 선택·의견·판정 규칙

- 모션 보기: frame CSS animation의 일시 정지/재개와 원래 상태 복원; GIF·canvas 완전 정지의 보장 없음, 리뷰어 UI 동결 제외
- 기본 모드: 검토; 선택만으로 clipboard 덮어쓰기 금지; 명시적 복사 버튼과 키보드 조작
- 다중 선택: 같은 entry·side·revision 안의 집합; 다른 화면/side의 별도 의견 연결
- 사각 영역: raster의 tile-local CSS px와 authored DOM의 viewport-local CSS px 구분; coordinateSpace·기준 width/height·tileHash 또는 visibleStateHashAtCreation 저장
- DOM 영역 scroll: document와 필요한 중첩 container의 의미 키/검증 locator·실제 x/y offsets 수집; end/요청값만으로 위치 복원 금지
- 영역 재표시: 원래 visible state와 실제 scroll 복원 확인 후 표시; patch/삭제 reflow·복원 불가 시 unresolved-region과 재지정 제공
- 좌표 배율: parent fit/zoom과 DPR의 저장 좌표 중복 적용 금지
- 텍스트 대상: authored DOM의 의미 키+텍스트 offset+quote+prefix/suffix; 캡처 이미지의 텍스트 정밀 anchor 불가 표기
- 영역 선택 구분: 임의 영역 코멘트와 교차 요소 다중 선택; 삭제 대상의 실제 ID 목록 사전 표시
- 계층 탐색: 선택 요소→부모→화면 루트; 숨겨진 자식·삭제 항목 상태 표시
- 답글: annotation별 `replies[]`의 ID·text·authorLabel·createdAt·updatedAt; 답글 추가/수정/삭제·원래 대상 유지·HTML/JSON 보존
- 의견 상태: `open/resolved`; 내용 편집과 재열기 지원; 생성/수정 시각·표시용 작성자 선택 입력
- 화면 판정: `unreviewed/approved/changes-requested/deferred`; 리뷰어 작성의 로컬 판정, 인증된 전자서명 아님
- 판정 유효성: entry·side revisions/semanticHash·해당 entry의 deleted/previewEdits를 합친 visibleStateHash 조합; 어느 항목 변경 시 `needs-review` 파생 상태
- 주요 의견 fingerprint: entry별 제출된 P0/P1 issue ID·개정·상태·보류 이유의 결정적 집합; 승인 이후 추가/재열기/우선도 변경/import/undo의 유효성 재계산
- 승인 표시 조건: entry/side semanticHash·visibleStateHash 및 주요 의견 fingerprint 일치; 신규 또는 재개정 미해결 P0/P1의 needs-review 전환
- 승인 시 미해결 P0/P1 존재: 해당 목록과 이유 확인 UI; 해소 또는 해당 issue 개정에 연결된 명시 보류 이유 없이 승인 완료 금지
- 대량 동작: 현재 필터에 포함된 화면 수·대상 요약 확인; 숨은 화면의 자동 승인 제외
- undo/redo 대상: 삭제/복원·의견 편집/상태·판정·시안 조정; 탐색/배율/hover 제외
- 이력 경계: 현재 세션 내 undo/redo; 저장본 재열기 시 최종 검토 상태와 원본 복원 가능, 세션 undo stack 복구 비보장

### F11~F14: 연속 작업·조정·인계 규칙

- 저장 버튼: `검토 파일 저장`; 최근 저장 후 변경 여부와 저장 시각 표시
- 저장본: 원본 assets·DOM·영역 index·계약·의견·판정·삭제·시안 조정·미해결 대상 내장
- 저장 성공 표시: HTML 생성·다운로드 시작과 실제 디스크 저장 확인의 구분; 일반 브라우저의 파일 저장 완료 보장 문구 금지
- 새로고침: 기존 미저장 상태 초기화 계약 유지; 변경 존재 시 가능한 범위의 이탈 경고
- localStorage: 필수 사용 없음; 복구 초안 기능 도입 시 별도 선택과 저장본 우선순위 필요
- JSON 가져오기: 같은 reviewId/bundleHash의 항목별 차이 미리보기·충돌 선택; 전체 덮어쓰기 기본값 금지
- 이전 bundle의 상태: 검증된 previousBundle과 해당 상태를 함께 제공한 명시 rebase 경로; 동일 project/review 계열·entry/side semantic hash·대상 ID 확인 후 무변경 대상만 유지
- 같은 reviewId만 가진 다른 bundle: 직접 import 거절; 원본 bundle 근거 없는 추정 rebase 금지
- 미작성 의견: drafts의 원래 entry/side/revision/target·IME 확정 text·수정 시각 저장, 화면 전환·파일 저장·extract·import 충돌·revision unresolved 연결
- draft 의미: dirty 상태 포함·미제출 표시·승인/인계 의견 제외; 사용자의 등록/버리기 동작 없이 자동 제출·폐기 금지
- 다른 revision: 동일 ID 추정 적용 금지; `unresolved` 보존 후 사용자 재연결
- 텍스트 조정 경계: 하위 의미 키 없는 leaf 또는 명시 text node만 변경; 부모 textContent 교체로 자식 ID/markup/anchor 손실 금지
- 빠른 조정: 작성형 After에 한정한 text/token/style/asset patch; 변경 전 값·변경 후 값·대상 key·base hash 기록
- 속성 검사: 작성형 After의 computed color/font/spacing/rect와 부모 간격 표시; Before는 수집된 값만 표시, 미수집 CSS의 실시간 값 위장 금지
- style 허용 범위: color·font token·spacing token·text alignment·제한된 flex/grid 정렬; 임의 CSS/HTML/script 입력 제외
- 구조 이동: 현재 범위의 실제 원본 DOM 재작성 제외; 레이어 재배치 의도의 구조화 요청 기록
- 자산 교체: 이미 bundle에 포함된 자산 또는 빌드 단계의 허용 로컬 자산; URL fetch·파일 실행 없음
- 조정 반영: 저장/인계 시 patch 유지; 다음 생성 단계에서 선택 patch의 원본 HTML 반영·After revision 증가·관련 판정 만료
- 출력 형식: 사람이 읽는 Markdown과 기계용 JSON; 필수 내용은 동일 계약에서 생성
- PNG 브라우저 출력: 내장 원본 raster·diff·해당 영역 crop과 의견 overlay의 Canvas 합성; 출력 상태의 원본/주석 표시
- 현재 authored DOM PNG: `scripts/export-review.mjs <review.html> <new-output> --format png --view current`의 JSON 비실행 추출→bundle/state/자산/DOM 재검증→설치본 trusted shell/frame 재구성→deadline 있는 offline Playwright 캡처
- 입력 HTML의 shell/script 실행 제외; hash는 인증 근거가 아닌 무결성 근거; 삭제 reflow·text/style patch의 실제 frame 렌더 결과
- PNG 사용성: 원본 이미지의 브라우저 직접 저장, 현재 시안의 로컬 export 경로 안내; 브라우저 단독 DOM→PNG 기능의 허위 제공 금지
- 로컬 PNG export: 설치된 브라우저·내장 자산만 사용·network offline·새 출력 경로·처리한 saved HTML hash 기록
- 소스 연결: framework-neutral `sourceHint`와 provenance; React 개발 환경 어댑터의 선택적 확장
- Vue/일반 DOM: 프로젝트 제공 `data-source-*` 또는 adapter 맵 활용; React 내부 탐색 로직의 공통 코어 포함 금지
- 인계 항목: 무엇/어디/왜/기대 동작/유지 제약/상태·viewport/revision/evidence/미해결/변경안

## 4. 검토 화면 UI·UX

### 데스크톱

```text
[프로젝트 / 검토 이름] [진행 3/8 · 미저장] [실행 취소] [다시 실행] [검토 파일 저장]
┌ 화면 목록 240px ┬ 비교 캔버스: 남은 너비 ─────────┬ 맥락 패널 320px ┐
│ 검색·상태 필터 │ 화면 / 상태 / 크기 / 시안       │ 의견 / 변경 / 근거│
│ 그룹 / 화면    │ 나란히·슬라이더·겹침·차이       │ 선택 대상·부모 경로│
│ └ 상태·검토 수 │ BEFORE          AFTER           │ 의견 입력·우선도  │
│ 승인/수정/보류 │ 타일·배율·원본/검토 결과 보기   │ 판정·해결·복사    │
│ 다음 미검토    │ 선택 강조·핀·안전한 체험         │ 연결 의견·미해결  │
└───────────────┴────────────────────────────────┴──────────────────┘
```

- 레이아웃 기준: 1200px 이상에서 3영역 선택 가능; 기본 배치는 현재 캔버스의 가용 너비와 시안 viewport 기준
- 비교 기본값: 나란히 pane 각각 400px 이상 확보 시 split, 부족 시 한쪽 탭; 양옆 패널 자동 접기·명시 재열기·한쪽/나란히 수동 전환
- 가독성 경로: 100% 보기·팬·목록 선택 도구 상시 접근; fit 축소본의 메뉴 접근만으로 내용 검토 완료 판정 금지
- 중간 너비: 768~1199px의 화면 목록 접기·맥락 패널 overlay; 화면 시안 자체 viewport 불변
- 상단 필터 축소: 화면 목록에서 group/screen 탐색; 캔버스에는 state/viewport/variant만 유지
- 정보 노출: 사람용 label 우선; 긴 ID·selector·source path는 상세 펼침과 복사
- 빈 상태: 검토할 화면·현재 선택 방법·추가 가능한 첫 행동 중심
- 오류 상태: 캡처 실패·참조 누락·비교 불가·미해결 대상의 각각 다른 복구 동작
- 판정 위치: 현재 화면의 의견과 인접한 맥락 패널; 저장과 승인 동작의 분리
- 색: 리뷰어 전용 중립 토큰; 시안 브랜드와 명확한 분리, 상태색+문자/아이콘 병기
- 기본 표현: 본문 14px 이상, 보조 12px 이상, 버튼/입력 40px 이상; 작은 수치의 개발 ID 상시 노출 제외

### 모바일

```text
[화면 선택 ▾] [미저장 ●] [저장]
[Before | After] [시안 ▾] [보기 ▾]
┌ 현재 화면 캔버스 ──────────────┐
│ 탭 선택 / 두 손가락 확대·이동 │
│ 현재 선택 강조·의견 핀        │
└───────────────────────────────┘
[선택] [의견 3] [판정] [더보기]
[필요 시 맥락 bottom sheet · 닫기]
```

- 767px 이하 기본 한쪽 화면 보기; Before/After 탭 전환의 대응 위치 유지
- 320·390px 검토 가능; 고정 PC 시안은 fit/100%·팬으로 탐색
- 모바일 다중 선택: 길게 누르기 의존 대신 `다중 선택` 명시 모드와 완료 버튼
- 영역 의견: 시작/끝 지점 선택 또는 드래그; 스크롤 동작과 모드 구분
- 캔버스 높이: 탐색 시 bottom sheet 축소/닫기, 열린 시트의 캔버스 복귀 버튼 유지; 작은 높이/키보드에서 입력·닫기·저장 도달과 100% 양끝 대상 선택 확인
- 터치 목표: 최소 44×44 CSS px; 고정바 safe-area 반영
- 시트 상태: 캔버스 탐색 시 축소·의견 작성 시 확장; 입력 키보드의 저장/닫기 가림 방지
- 닫기/전환: 미완성 의견 초안 유지; 다른 화면의 의견으로 자동 부착 금지

### 접근성·키보드

- 모드 전환·목록·탭·범위 입력·dialog의 표준 HTML 의미 우선
- 캔버스 시각 선택의 동등한 목록 선택 경로와 현재 선택 `aria-live` 안내
- `Escape`: 현재 선택/메뉴/시트의 단계별 닫기와 호출 위치로 포커스 복원
- `Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`: 입력창 밖의 검토 undo/redo; OS·브라우저 입력 이력 유지
- 문자형 단축키: 도움말에 공개된 명시적 활성화 옵션; 한글 IME 조합 중 비활성
- 대비·포커스·200% 확대·reduced motion 확인; 색만으로 선택/승인 상태 표시 금지
- 체험 모드: 기존 선언형 화면 전환·details·로컬 입력만 허용; 의견 선택과 동작 충돌 방지

### 조작 모드의 단일 입력 계약

| 활성 조작 | 가능한 동작 | 제약·취소 |
| --- | --- | --- |
| 요소 | 탭/클릭·목록의 단일 선택 | drag의 의견 생성 없음 |
| 다중 | modifier/checkbox/명시 다중 선택 | 같은 entry/side/revision; 완료/취소 후 요소 모드 |
| 영역 의견 | 사각 rect의 새 의견 | 빈 공간 허용·기본 pan과 배타 |
| 영역 요소 | indexed rect 교차 요소의 선택 집합 | 포함 대상 사전 표시·root 자동 포함 제외 |
| 텍스트 | authored DOM native Range | raster 비지원·표준 keydown/IME 유지 |
| 이동 | 확대 캔버스 pan·scroll | 의견/삭제 상태 변화 없음 |
| 체험 | 선언형 전환·details·로컬 입력 | 선택/의견 gesture 중지·임의 앱 script 없음 |

- 활성 도구: 캔버스마다 한 조작만 활성; pointercancel/Escape/entry 또는 비교 전환의 미완료 gesture 취소
- 슬라이더 손잡이·입력·메뉴·시트: 캔버스 picking/drag 비전파
- raster 비교: 텍스트/DOM patch 비지원 이유, 원본 DOM 보기와 요소 목록 경로 제공
- 모드 검증: 같은 drag의 선택/의견/pan 중 단일 결과; 취소 후 deleted/annotation 불변

## 5. 데이터 계약 v2

- 저장 bundle·review state·입력 manifest의 각 `schemaVersion: 2`
- 읽기 지원: v1·v2; 쓰기 기본: v2; 알 수 없는 상위 버전의 명시적 거절과 원본 보존
- canonical bundle의 기존 project/viewports/brand/research/coverage/entries/elements/assets/indexHash 유지
- 추가 필드: `designContract`, `captureProfiles`, `comparisons`, `bundleHash`, `sourceBuild`
- `bundleHash`: assets·entries·index·계약과 수집 provenance의 결정적 직렬화 hash; 자기 필드 제외; 인증/서명 의미 없음
- semanticHash: entry/side의 화면 내용·영역·렌더 조건·필수 정보 계약, 실행 시각/경로 등의 volatile provenance 제외; v1 기존 hash의 무결성 검사는 변경 없이 유지
- visibleStateHash: 해당 entry의 삭제 ID 정렬·대상/필드별 최종 patch값 정규화; annotation 배열 순서·author/savedAt/편집 이력 제외
- hash 구현: object key 정렬·집합 정렬·화면/동선 등 의미 순서 보존; Node/browser 동일 fixture bytes·hash 확인
- content 변경 판정: semanticHash 또는 의미 키 변경 기준; capturedAt만 변경된 재캡처의 강제 revision 증가/승인 만료 제외
- 입력 `after.kind`: `authored/capture/image/missing`; 기존 v1 `after.file`의 `authored` 이행
- 입력 `before.kind`: 기존 `dom/manual/image/missing` 유지; `dom`의 의미는 캡처 이미지의 DOM 영역 맵
- `elements[].sourceHint`: 선택적 file/line/component/provenance; 미제공 시 `null`
- `comparisons[]`: entry/타일 쌍·조건 fingerprint·양쪽 이미지 hash·diff asset·stats·불가 사유

| review state 필드 | 형식·의미 |
| --- | --- |
| `schemaVersion`, `reviewId`, `bundleHash`, `indexHash` | 상태와 해당 원본의 연결 |
| `deleted` | 기존 의미 ID 배열; 중복 제거·존재 여부 검증 |
| `annotations` | ID·targets·text·replies·priority·status·authorLabel·createdAt·updatedAt |
| `decisions` | entry·variant·content fingerprint·visibleStateHash·criticalIssuesHash·value·reason·decidedAt |
| `drafts` | 원래 target·text·updatedAt·미제출 상태; 저장/추출 포함 |
| `previewEdits` | ID·target ID·종류·base value/hash·next value·createdAt |
| `unresolved` | 이전 payload·이유·이전 revision·후보 연결·해결 여부 |
| `savedAt` | 파일 생성 시각; 로컬 브라우저 시각의 비인증 값 |

| annotation target 종류 | 필수 정보 | 적용 범위 |
| --- | --- | --- |
| `element` | element ID | 매핑된 Before·After |
| `elements` | 같은 entry/side/revision의 ID 배열 | 다중 요소 |
| `region` | entry·side·revision·coordinateSpace·rect CSS px·기준 크기·tileHash/visibleStateHashAtCreation·실제 scroll snapshot | 이미지 또는 DOM |
| `text` | element ID·start/end·quote·prefix/suffix | 작성형 After DOM |
| `screen` | entry·side·revision | 화면 전체 |

- 디자인 계약의 최소 구조: productBrief·requiredContent·sourceEvidence·tokens·variants·critiques·selectedVariant; 모든 시안/비평 target의 revision/hash 연결과 save/extract/handoff 보존
- 상태 키 불변성: UUID형 annotation/edit ID; 재연결 시 원래 target와 처리 근거 보존
- v1 이행: deleted 유지; unresolved 문자열의 `legacy-target-missing` 항목 변환; 빈 의견/판정/조정 배열
- v1 indexHash 불일치: 이행 대상으로 표시하고 ID·revision 재검사; 삭제 의도의 조용한 재적용 금지
- 영역/텍스트 검증: zero/음수/비정상 rect·잘못된 quote offset·frame 범위 밖 target의 거절; 원래 위치와 명시 재연결 이력 보존
- 크기 제한 제안: HTML 100MiB·전체 의견 5,000개·의견 1개 10,000자·선택 500개; 초과 시 원본 유지·분할 안내
- 제한 확정 조건: 실제 50 entry·5,000 element·500 comment fixture의 메모리·응답 측정; 초과 허용의 무제한 fallback 금지

## 6. 신뢰 경계와 성능

- 수집 데이터 최소화: 로그인 token·storageState·network payload의 HTML/로그 포함 금지; URL query/fragment 기본 제거
- 현재 캡처의 GET/HEAD/OPTIONS 제한 유지; 신뢰된 adapter의 기존 사용자 승인 범위 준수
- 임의 입력: JSON schema와 의미 검증 병행; parent cycle·좌표 범위·revision·asset hash 검증
- 표시 문자열: textContent·안전한 JSON embedding; 의견의 raw HTML 실행 금지
- frame 통신: event.source·token·entry·side·허용 message type·payload 크기 검사
- frame 권한: sandbox allow-scripts만 유지; 애플리케이션 script/event handler·form 제출·외부 탐색 차단
- import/export 경로: 출력 run 밖 쓰기 거절; 입력은 manifest root와 명시 asset root의 normalize+realpath containment 확인
- 상대 자산: 추출본 source/../assets처럼 승인 root 안의 참조 허용; root 탈출·외부 symlink·지원 밖 MIME 거절
- 인증 adapter/storageState: 명시 지정 외부 경로의 별도 읽기 정책; 결과물/일반 asset root의 포함 제외
- 대형 검토: 현재 entry의 frame만 생성; 목록의 기본 검색/필터 후 필요 시 가상화; 요청 전 범용 편집 프레임워크 추가 금지
- 초기 성능 목표: 50 entry·5,000 element·500 comment 기준 조작 응답 100ms 이내·파일 열기 3초 이내의 중앙값; 장비·브라우저·파일 크기와 함께 보고
- 성능 목표 초과: 원인·측정값 공개와 수정; 측정 없이 충족 주장 금지

## 7. 전체 완료 정의

- F01~F18의 구현·문서·예시·인계 형식 연결
- v1 파일의 손실 없는 읽기·v2 저장·revision 변경 후 미해결 처리
- 모바일/PC 실제 화면과 입력 조작의 검토 완료
- 파일 이동·새 브라우저·오프라인 재열기의 의견/판정/복원 확인
- 비교 불가·실패 캡처·손상 상태·재개 불일치의 명시적 복구
- 채택 소스별 라이선스·변경 내역·고지와 실제 포함 코드/데이터의 대응
- 패키지 SHA·설치 SHA 일치 및 이전 설치본 보존
- 부분 단계 완료의 전체 확장 완료 보고 금지
