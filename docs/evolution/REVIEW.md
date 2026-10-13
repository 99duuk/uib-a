# uib-a 명세·계획 비판 검토 및 개선

- 검토 일자: 2026-10-13
- 검토 대상: `ceda70d02b1a7362b40d9e7984123971301cb52a`의 비교·명세·계획
- 코드 기준: `de59afcfa3b1e357ab978c3dc55f2ed08dc2dbf5`
- 작업 브랜치: `docs/evolution-plan`
- 범위: 실제 build/capture/extract/viewer 코드와 계획의 정적 대조·문서 개선
- 최종 계약: [SPEC.md](SPEC.md) · [PLAN.md](PLAN.md) · [COMPARISON.md](COMPARISON.md)
- 전체 판단: 유용한 채택 범위와 오프라인 구조 유지의 타당성; 구현 전 필수 연결 공백 12건의 문서 보완
- 기준 부하: 단일 사용자·오프라인 파일·50 entry/5,000 element/500 comment의 제안 fixture; 성능 실측 결과 없음

## 1. 이전 계획의 문제

- 장점: 실제 코드·라이선스·원본 이미지의 근거, 기존 선택/삭제/복원과 검토 파일의 보존
- 부족: 출처 확인 중심의 완성도 판단, 실행 단계 사이의 의존·좌표·초안·개정 계약의 불충분함
- 완료 오인 위험: 링크 유효성과 문서 검토 완료의 실제 기능 동작 보장 혼용
- 규모 위험: 기능 수의 증가에 비해 단계별 사용자 왕복 검증과 현재 코드의 변환 경로 부족
- 개선 원칙: F01~F18 유지, 새 프레임워크 추가보다 상태·입력·단계 경계의 구체화

## 2. 반드시 보완할 계약 — P1

| 번호 | 구체적 실패 사례 | 이전 근거 | 개선 내용 | 수용 사례 |
| --- | --- | --- | --- | --- |
| R01 | 빠른 조정 미구현 P5의 patch PNG 완료 요구·P6의 P5 선행 조건 | 이전 PLAN P5/P6 | P5 원본/P6 current export 분리·단계별 부분 A 검사와 P7 전체 검사 구분 | A12 |
| R02 | approved 이후 새 P0 또는 P1 재열기에도 화면 내용 hash 불변 | 이전 SPEC 판정 fingerprint | criticalIssuesHash·issue 개정별 보류 이유·import/undo 재계산 | A20 |
| R03 | 부모 제목 textContent 교체로 자식 의미 키·의견 대상 소실 | [build.mjs](../../scripts/build.mjs) 의미 키 index·[frame.js](../../assets/reviewer/frame.js) node Map | leaf/명시 text node 한정·부모 통째 교체 거절 | A13 |
| R04 | 내부 end scroll의 요청값만 저장, reflow 후 예전 영역의 다른 대상 표시 | [capture.mjs](../../scripts/capture.mjs) 실제 window scroll·요청 내부 scroll | 실제 container offset·coordinateSpace·tileHash/visibleStateHash·복원 불가 unresolved | A23 |
| R05 | 경로 문자열 '..' 금지로 도구 생성 ../assets 참조의 재빌드 실패 | [extract.mjs](../../scripts/extract.mjs) source/../assets | 승인된 read root의 normalize/realpath containment·출력 경계 별도 | A17 |
| R06 | 정상 payload를 가진 입력 HTML의 top-level script가 PNG CLI에서 실행 | [lib.mjs](../../scripts/lib.mjs) JSON 추출·이전 current PNG 흐름 | 입력 shell 비실행·검증 JSON·trusted shell 재구성·deadline | A24 |
| R07 | capturedAt만 다른 동일 캡처의 before hash 변경과 revision 강제 증가 | capture.mjs:56·build.mjs:107/114·lib.mjs:24 | provenance 무결성과 화면 semanticHash 분리·Node/browser 정규화 | A07 |
| R08 | 다른 entry 하나 수정으로 전체 bundleHash 변경, 무변경 의견 재사용 경로 미정 | 이전 SPEC 직접 import·다른 revision 규칙 | 직접 import와 previousBundle+state 기반 검증 rebase 분리 | A04·A05 |

- R01~R08의 처리 상태: 명세·계획 반영; 실행 코드 미수정
- 회귀 보존: v1 원본 hash 무결성 검사 유지, v2 의미 hash 변환 후 비교
- 새 주장 제한: hash의 입력 HTML/script 신뢰 인증 대체 금지

## 3. 사용 흐름·완료 조건 보완 — P2

| 번호 | 구체적 실패 사례 | 이전 근거 | 개선 내용 | 수용 사례 |
| --- | --- | --- | --- | --- |
| R09 | 1200px 3영역과 1440px PC 시안의 반쪽 fit에서 본문 검토 곤란 | 이전 SPEC 고정 양옆 폭·3영역 breakpoint | 가용 캔버스 기준 한쪽/split·패널 접기·100%/pan·본문 확인부터 저장까지 검증 | A10 |
| R10 | 같은 drag의 pan·영역 의견·다중 선택·slider가 함께 동작 | 이전 SPEC 개별 기능·PLAN 입력 우선순위 문구 | 활성 조작 표·단일 gesture·IME·취소·overlay 비전파 | A22 |
| R11 | 한 화면의 가격 문자열 존재로 모바일/오류/확인 누락·CTA 단절 통과 | 이전 requiredContent·A19 | entry/state/viewport/variant별 가시성·동선 coverage·missing/unverified | A19 |
| R12 | 작성 중 의견의 화면 전환 보존에도 저장 파일에서 draft 누락 | 이전 draft 문구·state 필드 부재 | canonical drafts·dirty·save/extract/import·원래 target·미제출 구분 | A21 |

- R09~R12의 처리 상태: 명세·계획 반영; 실제 조작/가독성 결과 미확인
- 원래 범위 유지: 모바일·PC·일반 DOM·React/Vue fallback·원본 복원·오프라인 저장
- 구현 순서 개선: P2/P4/P5/P6의 사용자 왕복 검사, 최종 P7 전 실패 조기 발견; 재검토의 후속 단계 기능 검사 충돌까지 전 단계 완료 조건 정렬

## 4. 변경 범위와 검증

- 변경 파일: SPEC.md·PLAN.md·COMPARISON.md·본 REVIEW.md
- 명세 보강: 의미 hash·판정·좌표·초안·requiredContent·입력표·PNG 경계
- 계획 보강: 단계 의존 역전 제거, P6 current export 소유, 정상/고의 실패 수용 사례
- 수용 사례: A01~A24; 기존 19개 유지·5개 추가 및 관련 기존 사례의 실패 조건 확장
- 동작 범위: F01~F18 유지; 런타임 코드·설치본·원격 배포 변경 없음
- 문서 확인: 내부 링크·요구/단계/수용 대응·문체·Git whitespace 검사
- 독립 재검토: 계약 및 사용 흐름 검토자의 수정 반영 대조
- 미실행: 외부 도구·브라우저 조작·A01~A24 기능 테스트·실측 성능
- 운영 문서 영향 없음
- 다음 작업: 개선 계약 기준 P0/P2 구현과 v1→v2 저장 왕복부터 진행
