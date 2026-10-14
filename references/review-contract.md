# 검토 계약 v2

- core: `scripts/review-state.mjs`의 Node/browser 동일 계약
- 읽기: v1·v2, 쓰기: v2; 알 수 없는 버전·다른 검토/인덱스의 거절
- 정체성: `UIR/project/entry/side/revision/key`; 의미 키·side 개정·원본 보존
- Before: 실제 캡처 또는 명시 image/manual/missing; 캡처 영역 선택과 DOM 재배치의 구분
- After: 작성 HTML 또는 capture/image/missing; 작성형만 텍스트/토큰/style 조정

## 검토·조정

- 기본 요소 선택·명시 복사; 선택만으로 clipboard 변경 없음
- 모드: 요소·다중·영역 의견·영역 요소·텍스트·이동·로컬 체험 중 한 가지
- 다중 선택: 동일 entry/side/revision; 부모/자식 삭제 의도의 독립 보존
- 의견: 요소·집합·텍스트·영역·화면 target, P0~P3, open/resolved, 답글·편집·재열기
- 초안: 원래 target와 text의 화면별 보존·파일 저장·미제출 표시; 인계/승인 의견 제외
- 삭제: Before 영역 마스킹·작성 After 숨김/재배치, 캡처 After 마스킹
- 복원: 개별/전체·부모/자식 의도 유지·루트 삭제 뒤 외부 제어 접근
- undo/redo: 사용자 변경 단위, 새 변경의 redo 초기화, 입력창/IME의 표준 동작 유지
- patch: 원본 semanticHash·정확한 element/entry 연결, leaf/명시 text node·허용 style·내장 image·계약 토큰
- 토큰 patch: 계약의 `--name` CSS 변수와 안전한 CSS 값; 임의 CSS/script/외부 URL 제외
- 구조 변경: 실제 DOM 파괴 대신 구조화 요청 의도
- 영역: CSS px·타일 hash 또는 화면 상태 hash·실제 scroll; 불일치 영역의 미해결/재지정

## 판정·저장·가져오기

- 판정: unreviewed/approved/changes-requested/deferred; 현재 화면/시안에 한정
- 승인 유효성: 원본 의미 hash·삭제/최종 patch·주요 의견의 개정/상태 일치
- 새 P0/P1·재열기·삭제·patch·개정 변경: needs-review 표시
- 주요 의견 보류: 해당 issue 개정별 이유와 검토자 입력; 인증된 전자서명 의미 없음
- 저장: 원본 bundle/assets·의견/답글·초안·판정·삭제·patch·미해결의 새 HTML
- 원본 파일 덮어쓰기 없음·localStorage 필수 의존 없음·파일 이동/새 브라우저/refresh의 상태 유지
- 저장 알림: 파일 생성/다운로드 요청; 디스크 저장 완료의 자동 보장 없음
- import: 같은 bundle의 항목별 차이·추가/삭제 충돌 미리보기, 사용자 선택 후 적용
- 개정 후: 검증된 previousBundle+state의 명시 rebase; 무변경 대상 유지·변경 대상 unresolved
- 세션 이력: 현재 undo/redo, 저장본 재열기의 최종 상태와 원본 복원; 이전 세션 undo 이력 비보장

## 출력·신뢰 경계

- browser: 검토 JSON·Markdown/JSON 인계·내장 raster/영역/의견 포함 PNG
- current DOM PNG: 저장 HTML의 JSON 비실행 파싱→검증→trusted shell 재생성→오프라인 Playwright
- frame: allow-scripts만, 원본 앱 script/외부 연결/form 제출 금지
- message: frame source·token·entry/side·ID/enum/좌표/payload 크기 확인
- 자산 경로: 승인 root의 realpath 포함 여부; 정상 source/../assets 허용·외부 symlink/root 탈출 거절
- 외부 입력 문자열: textContent·안전한 JSON embedding; HTML 의견 실행 없음
- 소스 맥락: 수집 가능한 상대 파일/행/컴포넌트만, 없으면 null; React/Vue 개발 adapter 선택 사항
