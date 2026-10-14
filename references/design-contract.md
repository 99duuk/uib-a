# 디자인 계약·대안·비평

- 읽기 시점: After 작성 또는 이전 시안의 수정 전
- 목적: 사용자 과제·필수 정보·브랜드 기준·대안의 검증 가능한 연결
- 계약 파일: manifest의 `designContract` 또는 해당 계약 JSON
- 기존 PRODUCT/DESIGN 명세와 현재 코드의 우선 재사용; 같은 사실의 중복 문서 생성 제외

## 계약 내용

- `productBrief`: 사용자·과제·다음 행동·현재 문제·유지 제약
- `requiredContent`: key·근거·entry/state/viewport/variant 범위·value/의미 제약·elementKeys·action·checks
- `tokens`: 원래 토큰명·값·역할·sourceEvidence·관찰/제공/추론 수준
- `variants`: 방향별 hypothesis·preserved·changed·tradeoffs·evidence
- `critiques`: issueId·target·revision·P0~P3·근거·왜/수정 방향·resolution·round
- `selectedVariant`: 선택안과 이유
- 외부 자산: 출처·권리 확인; 권한 미확인 이미지/폰트 binary의 산출물 편입 제외

## 자료 검색

```bash
node <skill>/scripts/design-search.mjs --query "키보드 포커스"
node <skill>/scripts/design-search.mjs --query "터치 간격" --domain touch
```

- 출력: match/no-result·관련 UX 레코드·원본 ID/SHA/license·한계
- 범위: 검토된 MIT UX 자료 subset과 한국어 태그; 전체 추천 엔진 복제 없음
- 우선순위: 사용자 지시→제품 명세/현재 동작→브랜드/관찰→검색 후보
- no-result: 관련 근거 없음 표시; 임의 hero/card/색상 default 생성 제외
- 추천값: 플랫폼/제품 맥락 검토 필요; 검증된 UX 개선률 또는 보편적 수치 기준의 주장 제외

## 대안·수렴

- 비교 요청: 동일 필수 콘텐츠·Before·상태의 의미 있는 2~3개 방향
- 단순 정돈: 불필요한 추가 방향 생성 제외
- 실질 차이: 정보 우선순위·탐색·행동 순서·밀도; 색만 다른 대안 제외
- P0: 핵심 기능/필수 정보 손실
- P1: 주요 과제 방해
- P2: 이해/효율 저하
- P3: 표현 정돈
- 수정 후: 기존 지적의 해결/잔존·신규 지적·현재 revision 근거 기록
- 반복 상한 도달: 잔존 문제의 명시·완료 오인 금지

## 필수 정보 점검

```bash
node <skill>/scripts/design-contract.mjs <contract.json> <review-manifest.json>
```

- 정적 확인: 의미 키·명시 숨김·필수 값·선언형 동선
- 상태: missing·unverified·관찰 근거가 기록된 present
- 관찰 근거: 실제 viewport 캡처·가격/조건 가시성·정상/빈 결과/오류/확인 동선
- HTML 문자열 존재만으로 present 처리 금지
- 특정 상태/시안/모바일 누락의 전체 정상 판정 금지
- 사용자에게 전달할 서비스 화면 내부의 구현 설명/비평 보고서 삽입 제외
