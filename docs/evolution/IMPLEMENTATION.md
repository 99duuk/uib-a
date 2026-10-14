# uib-a v2 구현·검증 현황

- 확인 일자: 2026-10-14
- 구현 브랜치: `feat/evolution-v2`
- 실행 코드 commit: `a25128af1f14c5335534bd30f079e851f33f775f`
- 버전: `2.0.0`
- 관련 계약: [SPEC.md](SPEC.md) · [PLAN.md](PLAN.md) · [REVIEW.md](REVIEW.md)
- 운영 문서 영향 없음; Bottling 소스·운영 배포 변경 없음

## 구현 대응

| 요구 | 구현 경로 | 확인 범위 |
| --- | --- | --- |
| F01·F03 과제·브랜드·대안·비평 | SKILL·design-contract 지침·auditDesignContract | 독립 명세 포워드 평가·상태/기기별 requiredContent 누락 검사 |
| F02 자료 검색 | design-search·curated UX 데이터 12개 | 한국어 과제 5종 hit·무관 질의 no-result·출처/고지 |
| F04·F05 캡처·재개 | capture·schema·run fingerprints | target 실패 격리·실제 내부 scroll·설정/파일/CSS hash·새 run 재개 |
| F06 시각 비교 | compare·pixelmatch·raster UI | diffMask bbox·동일 조건 판정·missing sides·슬라이더/겹침/차이 |
| F07·F08 대상·의견 | frame·viewer | 다중/영역/텍스트/화면·의견/답글·초안·재연결·ID 보존 |
| F09·F10 판정·변경 | review-state·viewer | 주요 의견/삭제/patch의 승인 만료·undo/redo·batch 판정 |
| F11 연속 작업 | build/lib/extract·state merge | v1→v2 왕복·저장/재열기·conflict import·개정 rebase·unresolved |
| F12 빠른 조정 | frame·state·extract | leaf/명시 text node·계약 토큰·허용 style·내장 asset·개정 증가 |
| F13 인계 | pure handoff·export-review | target/revision/source/제약·파생 판정·draft 제외·Markdown/JSON |
| F14 소스 연결 | metadata/React 개발 adapter·sourceHint | 제공 metadata·상대 경로만·절대/비공개 경로 제외·fallback |
| F15 검토 UI | navigator·canvas·inspector·mobile tabs/drawers | 320/390px·키보드/IME·모바일 초안·focus 복귀·회귀 viewport |
| F16 증거 출력 | browser Canvas·trusted PNG CLI | 원본/crop/의견 PNG·current patch/reflow·입력 shell 미실행 |
| F17 신뢰 경계 | schema·safe read roots·sandbox·state guards | root/asset/ID/hash·프레임 토큰·악성 입력·외부 HTTP 차단 |
| F18 설치·릴리스 | package/install·releaseFiles·fileHashes | staging 설치·이전본 backup·OS/계획 제외·사용 경로 byte 일치 |

## 검증 결과

- Node/Chromium 기반 자동 테스트: 26개 통과
- 기존 오프라인 리뷰 회귀 검사: 41개 통과·외부 HTTP 요청 0건
- Chromium/Firefox/WebKit smoke: 의견·draft·파일 저장/이동·재열기·모바일 화면 목록·Escape focus 복귀 통과
- WebKit 확인 방식: file URL의 offline emulation 오류를 단순 HTML에서도 재현; HTTP 차단 route 방식으로 오프라인 자산 검증
- 대형 fixture: 화면 50개·요소 5,000개·의견 500개·1.89MB
- 대형 fixture 열기: 약 105ms; 화면 이동 중앙값 약 35ms; macOS·Chromium·Node 22.22의 단일 환경 관찰
- 스킬 frontmatter 검사: Skill Creator quick_validate 통과
- 독립 포워드 평가: 기존 조건/동선·모바일 보존의 명세 요청 처리 및 구현 중단 확인
- 신규 설치 경로: 동일 26개 테스트 통과
- 세부 근거: 로컬 artifacts/uib-a-implementation-20261013/의 검증 JSON·캡처·검토 기록

## 실제 검증 한계

- VoiceOver 실제 음성 탐색·실물 touch hardware·React 실제 개발 앱의 fiber adapter 미검증
- 실제 서비스의 사용자 효과·전환 개선·모든 브라우저/OS의 보장 없음
- GIF·video·canvas의 완전 모션 정지 비보장; trusted adapter 또는 제한 표시
- A01~A24의 자동/구조 검증과 실기기/시각 판단의 구분; 전체 수용 항목의 무조건 통과 주장 없음
- 사용자 시안 삭제/수정의 제품 코드 자동 반영·배포 승인 의미 없음
