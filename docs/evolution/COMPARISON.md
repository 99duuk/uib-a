# uib-a 외부 프로젝트 비교·채택안

- 조사 기준일: 2026-10-13
- 현행 uib-a: `de59afcfa3b1e357ab978c3dc55f2ed08dc2dbf5` · `1.1.1`
- 작성 브랜치: `docs/evolution-plan`
- 요청: 기능·사용성·컨셉·UI·UX의 폭넓은 비교와 실제 재사용 계획
- 연결: [제품·기능 명세](SPEC.md) · [파일·단계·검증 계획](PLAN.md) · [비판 검토·개선 근거](REVIEW.md)
- 확인 방법: 고정 commit의 실제 소스·LICENSE·공개 문서 읽기, 일부 원본 이미지 직접 관찰
- 실행 한계: 참고 프로젝트 설치·실행·실브라우저 조작 미수행; source 존재와 런타임 검증의 구분
- 현재 코드/데이터 편입: 없음; 아래 내용의 도입 후보·설계 결정 상태

## 1. 채택 방향

- 유지할 중심: 실제 Before·작성 After·안정 ID·복원 가능한 검토·오프라인 단일 HTML
- 가져올 경험: 화면 위 정확한 피드백, 검토 진행과 판정, 쉽게 찾는 대상·원인·다음 작업
- 가져올 제작 방식: 과제/브랜드 계약, 실제 근거에 묶인 대안과 비평, 검색 가능한 UX 자료
- 가져올 자동화: 캡처 안정화·재개·실패 진단·픽셀 차이·증거 export
- 코드 채택 원칙: 소규모 허용 코드·공식 라이브러리·검토된 데이터 우선; 동일 목적의 기존 uib-a 구현 재사용
- 재구현 대상: 기존 iframe·저장·ID 계약과 다른 편집기/서버에 묶인 기능
- 완전 대체 후보: 조사한 범위에서 전체 요구와 동일한 도구의 확인 없음; 시장 전체 부재의 단정 제외

## 2. 12개 후보 비교

| 후보 | 강점·현재 구현 | uib-a 도입 | 방식·경계 | 명세 연결 |
| --- | --- | --- | --- | --- |
| before-after-ui-diff | 단일 HTML·wipe·diff·항목 판정/메모·합성 comment | 비교 모드·변경 필터·판정·요약 복사 | UX 적응; localStorage 중심 저장·bbox wrapper 제외 | F06·F09·F13·F15 |
| ui-evidence | Playwright 단계 진단·캡처 resume·화면 overview | run 기록·실패/누락 표시·재개·thumbnail | 기존 capture 확장; hash 없는 resume·강제 Git 정리 제외 | F04·F05·F15·F16 |
| pixelmatch | PNG RGBA의 시각 차이·AA 처리·diff mask | 빌드 단계 픽셀 비교 | 공식 라이브러리 의존 후보·ISC 고지 | F06 |
| Impeccable | 제품/시각 기준·구도 탐색·비평·revision 판정 | 과제 계약·실질 대안·P0~P3 지적·판정 만료 | 문서·절차 적응; 전체 엔진·고정 후보 수 제외 | F01·F03·F09 |
| UI UX Pro Max | 로컬 가이드 데이터·검색·디자인 추천 | 출처 있는 가이드 subset·한국어 검색 | MIT 데이터 선별 재사용; 추천 결과의 브랜드 우선권 없음 | F02 |
| OpenDesign | 참고→계약·token 근거·영역 의견·비평 반복 | 근거 confidence·디자인 계약·수정 이력 | 선택 문서 적응·독립 JS; daemon·React 앱 전체 제외 | F01·F03·F08·F13 |
| Anthropic frontend-design | 과제 기반 구조·타이포·상태·비평 | 기존 product-design 기준의 누락 부분 보완 | 높은 중복의 선별 통합; 별도 스킬 중복 설치 제외 | F01·F03 |
| React Grab | 요소 picking·bounds·다중 선택·source context | 작은 geometry 함수·선택적 개발 소스 연결 | MIT 순수 코드 후보; bippy/freeze 전체 번들 제외 | F07·F14 |
| GrapesJS core | 계층/선택·device·grouped undo/redo·JSON state | 레이어·묶음 이력·속성 패널·화면 크기 UX | BSD core 개념 적응; Backbone/editor/same-origin 의존 제외 | F07·F10·F12·F15 |
| ProjectVisBug | 계층/다중 선택·CSS 측정·시각 수정 | inspector·여백/타입·빠른 조정 UX | 독립 구현; archived 전체 확장 의존 제외 | F07·F12·F15 |
| Agentation | 요소/텍스트/다중/영역 의견·pause·맥락 복사 | 공개 행동을 바탕으로 한 의견·대상·복사 UX | 경쟁제품 제한; 구현·CSS·아이콘 복사 제외 | F07·F08·F13 |
| SingleFile | 웹페이지의 단일 HTML 보존 | 필요 시 별도 입력 도구와 호환 검토 | AGPL; 기본 export 엔진 편입 제외·기존 저장 유지 | F11·F17 |

## 3. 실제 역분석 결과

### 캡처·비교·저장

- before-after-ui-diff의 [보고서 구현](https://github.com/Tmuter/before-after-ui-diff/blob/f8c9b265c53fd7b6a30c55ad887330cf21675e48/build-report.mjs#L289): 판정·체크·note의 localStorage 저장, JSON export, HTML 내 현재 판정 저장과 JSON import의 부재
- 채택: 현재 화면 판정과 합성 인계문; 보완: uib-a HTML에 의견·판정 포함 및 revision/hash 결합
- [diff wrapper](https://github.com/Tmuter/before-after-ui-diff/blob/f8c9b265c53fd7b6a30c55ad887330cf21675e48/diff-images.mjs#L67): 일반 grayscale 배경까지 bbox의 색상 조건에 포함 가능한 정적 결함
- 채택: 공식 [pixelmatch diff mask](https://github.com/mapbox/pixelmatch/blob/9faed09302aaecec130b4ce0e8505d5ed5221393/index.js#L1); 보완: alpha mask의 실제 변경 픽셀만 bbox 계산
- [변경 요소 추정](https://github.com/Tmuter/before-after-ui-diff/blob/f8c9b265c53fd7b6a30c55ad887330cf21675e48/suggest-element.mjs#L137): 페이지 재방문·좌표 overlap 기반; crop/scroll/상태 재현의 오차 가능성
- 채택: 현재 capture map에서 후보 계산; locator 추측의 stable ID 대체 제외
- ui-evidence의 [재개 판단](https://github.com/0xBrewing/ui-evidence/blob/3549b2710b7a062b547f1582df7e7947807e5391/src/lib/capture/playwright-capture.mjs#L445): 성공 상태+PNG 존재 검사; 소스·설정·adapter hash 비교 부재
- 채택: 단계별 실행 기록·부분 실패 격리; 보완: fingerprint·파일 hash·원자 기록
- ui-evidence의 [Git baseline](https://github.com/0xBrewing/ui-evidence/blob/3549b2710b7a062b547f1582df7e7947807e5391/src/lib/baseline/git-baseline.mjs#L98): worktree 생성과 강제 제거 경로; 호스트의 영구 슬롯 정책과 충돌
- 결정: 사용자가 제공한 URL·기존 checkout·fixture 활용; 자동 worktree 생성/삭제의 기본 도입 제외
- ui-evidence [review 생성](https://github.com/0xBrewing/ui-evidence/blob/3549b2710b7a062b547f1582df7e7947807e5391/src/lib/review/build-review.mjs#L25): 상대 이미지 경로를 가진 디렉터리 bundle; 단일 HTML 자급자족과 다른 저장 방식

### 디자인 생성·비평

- Impeccable [초기 계약](https://github.com/pbakaus/impeccable/blob/245ad82def45831dc56a21b683c7a1ff530b06cc/skill/reference/init.md#L43)·[대안 탐색](https://github.com/pbakaus/impeccable/blob/245ad82def45831dc56a21b683c7a1ff530b06cc/skill/reference/new-work.md#L35): 제품 사실·시각 기준·구도·최초 행동·위험의 분리
- 채택: 필수 콘텐츠/동선 보존 계약, 색상 이상의 대안 차이; 매번 고정 7개 후보·무작위 선택·추가 확인 절차의 전면 도입 제외
- Impeccable [검토 모델](https://github.com/pbakaus/impeccable/blob/245ad82def45831dc56a21b683c7a1ff530b06cc/ui/component-review/model.ts#L1): component revision과 판정 연결; 변경 후 오래된 승인 무효화의 근거
- UI UX Pro Max [추천 규칙](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/7246805992a42b7bba37d4cac83b01416f0c6c44/src/ui-ux-pro-max/data/ui-reasoning.csv#L1): 일부 SaaS의 hero/card/glassmorphism 추천; 제품 과제에 무조건 적용하기 어려운 기본값
- 채택: [UX 가이드](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/7246805992a42b7bba37d4cac83b01416f0c6c44/src/ui-ux-pro-max/data/ux-guidelines.csv)와 관련 레코드의 검토된 subset; 제품별 반례·no-result·브랜드 우선순위
- [provenance](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/7246805992a42b7bba37d4cac83b01416f0c6c44/src/ui-ux-pro-max/data/data-provenance.json): 전체 CSV 행마다의 원출처 보장이 아닌 일부 규칙·dataset 수준 기록; 선택 행별 별도 검토 필요
- OpenDesign [reference contract](https://github.com/nexu-io/open-design/blob/0bd8251c9b5c0bed4b3aef87f53f9c1eadc493c7/skills/reference-design-contract/SKILL.md#L62)·[token evidence](https://github.com/nexu-io/open-design/blob/0bd8251c9b5c0bed4b3aef87f53f9c1eadc493c7/apps/daemon/src/design-systems/token-contract.ts#L7): 관찰 근거·토큰 역할·확신·유지/변경 기준의 구체화
- 채택: 짧은 디자인 계약과 근거 추적; 외부 로고/폰트/hero 이미지 일괄 다운로드의 도입 제외
- OpenDesign [design-review](https://github.com/nexu-io/open-design/blob/0bd8251c9b5c0bed4b3aef87f53f9c1eadc493c7/skills/design-review/SKILL.md#L18): upstream 소개 stub; 해당 파일만으로 완성된 audit 구현의 주장 불가
- Anthropic [frontend-design](https://github.com/anthropics/skills/blob/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design/SKILL.md#L11): 제품 과제·구조·행동 중심 디자인; 기존 uib-a와 겹치는 지침의 반복 복제 제외

### 요소 검토·조정

- React Grab [순수 bounds 함수](https://github.com/aidenybai/react-grab/blob/ea4bbec9e80f4802e8ae19ad18431edb9ddbb670/packages/react-grab/src/utils/combine-bounds.ts#L1): 실제 선택 묶음의 bounds 계산에 필요한 경우 선별 재사용 가능한 작은 경계
- React Grab [context](https://github.com/aidenybai/react-grab/blob/ea4bbec9e80f4802e8ae19ad18431edb9ddbb670/packages/react-grab/src/core/context.ts#L1): bippy·React/Next/Solid·소스 fetch 결합; framework-neutral offline 코어의 통째 import 부적합
- GrapesJS [UndoManager](https://github.com/GrapesJS/grapesjs/blob/cdfc2190afae34c08fa414002f3d94433fc40cbb/packages/core/src/undo_manager/index.ts#L227): 그룹 작업·undo/redo 상태 UI의 참고; Backbone 모델 의존
- GrapesJS [FrameView](https://github.com/GrapesJS/grapesjs/blob/cdfc2190afae34c08fa414002f3d94433fc40cbb/packages/core/src/canvas/view/FrameView.ts#L272): contentDocument 직접 접근; 현재 opaque-origin sandbox와 다른 권한 구조
- VisBug [선택·검사](https://github.com/GoogleChromeLabs/ProjectVisBug/blob/fef96fad0c54547637dd2bbdc326450027a906e7/app/features/selectable.js#L322): 형제/부모/자식 탐색·여백 측정; raw paste·node.remove의 현재 복원 계약과 충돌
- 채택: 목록/계층·측정·style inspector·비파괴 patch; 전체 확장 의존과 원본 DOM 직접 파괴 제외
- Agentation [공개 기능](https://github.com/benjitaylor/agentation/blob/0e3236eb1a0f5577852ab7bb5121f5dd46d42f1d/README.md#L51): 요소·텍스트·다중·영역 의견, 모션 정지, 맥락 복사
- 결정: 공개 행동의 독립 설계; [경쟁제품 제한 LICENSE](https://github.com/benjitaylor/agentation/blob/0e3236eb1a0f5577852ab7bb5121f5dd46d42f1d/LICENSE)의 구현/스타일 복사 제외
- SingleFile [목적](https://github.com/gildas-lormeau/SingleFile/blob/57205ff7e1f9e4a48069b23d5d814f5ee581db24/README.MD#L1): 페이지 보존; uib-a 원본 bundle+검토 state+revision 복원과 다른 계약

## 4. 실제 UI 관찰과 제안의 구분

| 근거 | 직접 본 내용 | 가져올 원칙 | 관찰 한계 |
| --- | --- | --- | --- |
| uib-a `docs/images/desktop-review.png` | 8개 선택 필터·가로 전후·고정 하단 선택 도구 | 화면별 탐색·상세 패널의 재배치 필요 | 현재 실제 사용성 시험의 대체 근거 아님 |
| [before-after-ui-diff demo](https://github.com/Tmuter/before-after-ui-diff/blob/f8c9b265c53fd7b6a30c55ad887330cf21675e48/examples/demo.png) | 큰 wipe·3열 이미지·판정·메모·합성 comment | 화면 단위 검토와 빠른 피드백 연결 | 버튼/저장 동작의 미실행 |
| [Agentation 공개 이미지](https://agentation.com/og-image.png) | 화면 위 번호 marker·점선 영역 | 코멘트 위치·다중 영역의 즉시 식별 | 홍보 이미지·실제 editor 미관찰 |
| [VisBug inspector GIF](https://github.com/GoogleChromeLabs/ProjectVisBug/blob/fef96fad0c54547637dd2bbdc326450027a906e7/app/tuts/inspector.gif) | 요소 옆 font/color/margin 팝업 | 짧은 현장 정보와 상세 검사 분리 | 특정 시점 frame 관찰·실시간 조작 미실행 |

- React Grab 공개 OG: 로고 중심 이미지; 실제 선택 UI 관찰 근거에서 제외
- 나머지 후보 UI: 소스/문서 구조 분석; 실제 화면 관찰로 표기하지 않음
- uib-a 제안 UI: 좌측 화면 목록·가운데 비교·우측 의견/변경/근거, 모바일 탭+bottom sheet
- 제안의 상태: 위 사례의 작업 흐름을 바탕으로 한 독립 설계; 원본 UI 픽셀 복제 아님
- 사용자 이득: 대상 찾기→의견 작성→판정→저장의 짧은 동선, 작은 화면에서 캔버스 확보

## 5. 소스 핀·재사용 조건

| 소스 | 고정 SHA | 라이선스·최종 경계 |
| --- | --- | --- |
| before-after-ui-diff | `f8c9b265c53fd7b6a30c55ad887330cf21675e48` | [MIT](https://github.com/Tmuter/before-after-ui-diff/blob/f8c9b265c53fd7b6a30c55ad887330cf21675e48/LICENSE); 저작권·허가 고지 |
| ui-evidence | `3549b2710b7a062b547f1582df7e7947807e5391` | [MIT](https://github.com/0xBrewing/ui-evidence/blob/3549b2710b7a062b547f1582df7e7947807e5391/LICENSE); 저작권·허가 고지 |
| pixelmatch v7.2.0 | `9faed09302aaecec130b4ce0e8505d5ed5221393` | [ISC](https://github.com/mapbox/pixelmatch/blob/9faed09302aaecec130b4ce0e8505d5ed5221393/LICENSE); 코드와 permission notice |
| Impeccable | `245ad82def45831dc56a21b683c7a1ff530b06cc` | [Apache-2.0](https://github.com/pbakaus/impeccable/blob/245ad82def45831dc56a21b683c7a1ff530b06cc/LICENSE); 편입 파일에 관련된 [NOTICE](https://github.com/pbakaus/impeccable/blob/245ad82def45831dc56a21b683c7a1ff530b06cc/NOTICE.md)·수정 고지 |
| UI UX Pro Max | `7246805992a42b7bba37d4cac83b01416f0c6c44` | [MIT](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/7246805992a42b7bba37d4cac83b01416f0c6c44/LICENSE); 데이터 원출처·폰트 파일별 조건 별도 |
| OpenDesign | `0bd8251c9b5c0bed4b3aef87f53f9c1eadc493c7` | [Apache-2.0 core](https://github.com/nexu-io/open-design/blob/0bd8251c9b5c0bed4b3aef87f53f9c1eadc493c7/LICENSE); skill/plugin/upstream별 추가 조건 |
| Anthropic skills | `dbd4588f9e1033efb41dad4bef2f7947c8993d44` | [frontend-design Apache-2.0](https://github.com/anthropics/skills/blob/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design/LICENSE.txt); 해당 subtree 한정 |
| React Grab | `ea4bbec9e80f4802e8ae19ad18431edb9ddbb670` | [MIT](https://github.com/aidenybai/react-grab/blob/ea4bbec9e80f4802e8ae19ad18431edb9ddbb670/LICENSE); 관련 코드·bundle 고지 |
| GrapesJS | `cdfc2190afae34c08fa414002f3d94433fc40cbb` | [BSD-3-Clause core](https://github.com/GrapesJS/grapesjs/blob/cdfc2190afae34c08fa414002f3d94433fc40cbb/packages/core/LICENSE); 유료 Studio/기타 plugin 제외 |
| ProjectVisBug | `fef96fad0c54547637dd2bbdc326450027a906e7` | [Apache-2.0](https://github.com/GoogleChromeLabs/ProjectVisBug/blob/fef96fad0c54547637dd2bbdc326450027a906e7/LICENSE); 조사 시 archived 상태 |
| Agentation | `0e3236eb1a0f5577852ab7bb5121f5dd46d42f1d` | [PolyForm Shield 안내·경쟁제품 제한](https://github.com/benjitaylor/agentation/blob/0e3236eb1a0f5577852ab7bb5121f5dd46d42f1d/LICENSE); 공개 UX만 참고 |
| SingleFile | `57205ff7e1f9e4a48069b23d5d814f5ee581db24` | [AGPL-3.0](https://github.com/gildas-lormeau/SingleFile/blob/57205ff7e1f9e4a48069b23d5d814f5ee581db24/LICENSE); 기본 엔진 미편입 |

- 실제 파일 편입 시 ledger: source URL/SHA/path·license·notice·변경 내용·포함 artifact·확인 일자
- 고지 위치: `THIRD_PARTY_NOTICES.md`, `licenses/`; 코드/자산이 HTML에 포함될 경우 해당 고지의 HTML 접근 경로
- 코드 라이선스와 이미지/폰트/상표 재배포 조건의 구분
- 제한 프로젝트의 공개 UX 참고와 구현 코드 번역/수정 복사의 구분
- 공개 URL의 추후 변경 가능성: 고정 SHA·로컬 다운로드 hash로 조사 시점 보존

## 6. 가져오지 않을 부분과 대체

| 항목 | 제외 근거 | 요청 기능의 대체 경로 |
| --- | --- | --- |
| Agentation 구현·CSS·아이콘 | 경쟁제품 제한 | 공개 동작에 근거한 독립 vanilla reviewer |
| GrapesJS 전체 core/Studio | 현재 sandbox·상태 모델 불일치 | 계층·grouped history·허용 patch |
| React Grab 전체 primitives/source bundle | React/debug/network 결합 | 순수 geometry·선택적 capture adapter |
| VisBug extension 전체 | archived·destructive DOM 편집 | 현재 index와 원본 보존의 inspector |
| SingleFile export 엔진 | 라이선스·검토 상태 계약 차이 | 기존 bundle/state 기반 저장 |
| upstream localStorage 단독 저장 | 파일 이동 시 검토 내역 손실 | HTML 내장 상태+JSON 교환 |
| hash 없는 capture resume | 오래된 화면의 성공 오인 | fingerprint·이미지/지도 hash |
| 픽셀 무변경 자동 승인 | 사용자 과제/상태 정확성 미보장 | 변경량 표시와 사람 판정 분리 |
| 통째 디자인 데이터·브랜드 자산 | 편향·원출처·재배포 조건 | 검토된 자료 subset·원본 링크 |
| 자동 baseline worktree 제거 | 호스트 변경 보존 규칙 충돌 | 기존 checkout/URL/fixture |
| 자유곡선 드로잉·범용 드래그 빌더 | 핵심 수정 의도의 중복 표현과 별도 모델 비용 | 요소/텍스트/사각 영역 의견·정렬/텍스트 patch·구조 변경 요청 |
| 실시간 서버·자동 이슈 발행 | 오프라인 검토 범위 밖 외부 상태 변경 | HTML 전달·구조화 Markdown/JSON |

- 제외 대상: 전체 제품의 불필요한 결합과 중복 구현; F01~F18의 사용자 기능 범위 축소 없음
- 추후 추가 판단: 실제 사용자 과제에서 위 대체 경로의 불충분함 확인 시 별도 명세 보완
