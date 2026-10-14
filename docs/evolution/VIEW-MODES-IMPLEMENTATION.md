# 3단계 검토 화면 구현·검증

- 확인 일자: 2026-10-14
- 버전: 2.1.0
- 소스 브랜치: feat/review-modes
- 구현 기준: [VIEW-MODES.md](VIEW-MODES.md)·사용자 구현 진행 요청
- 전달 HTML: /Users/tars/Documents/workspace/bottling-workspace/artifacts/uib-a-review-modes-20261014/before-after.html
- 증거 기준: /Users/tars/Documents/workspace/bottling-workspace/artifacts/uib-a-review-modes-20261014/

## 구현 범위

- M01·M02: 비교만 기본값·데스크톱 나란히·모바일 전후 탭·편집 패널/hover/선택/편집 단축키 차단
- M03·M04: 선택 후 간편 도구·임시 삭제/복원·문구/글자색/크기·P2 요청·캡처형 직접 수정 제한
- M05: 통합 entry 선택·상태/기기/시안 접근·단일 entry의 정적 이름·중복 이름의 그룹 구분
- M06·M07: 검토 데이터/이력/의견 초안 보존·대상별 미적용 입력 보존·전환 epoch를 통한 지연 선택 거절
- M08: 비교/요소/의견/판정/파일 그룹 접기·의견 편집/답글 접기·기존 주요 의견 승인/충돌 확인 유지
- M09: 전체 검토 HTML 저장·재열기 비교 기본값·trusted CLI PNG 유지
- M10: 320/390/768/1440/1600px·모드 키보드·입력 중 Escape·모바일 modal/focus 복귀
- 기존 source/assets/bundle·Before 캡처 보존·review schema 변경 없음
- 미적용 입력: 세션 내 보존·적용 후 저장 안내·저장본 재열기 보장 제외
- 첫 화면 실제 조작 수: 데스크톱 5개·모바일 6개, demo의 조건부 구간 선택 포함
- 운영 문서 영향 없음

## 검증 근거

- 전체 npm test: 27개 통과·final-tests.log
- 새 모드·읽기 전용·세션 보존·글자색/크기·입력 Escape: test-agent/modes-native-final.log
- Chromium/Firefox/WebKit 간편 수정·undo·상세 의견·저장: 3개 통과·test-agent/engines-final.log
- 데모 verifier: 44개 통과·외부 HTTP 0·verification-final/verification.json
- 단일 entry verifier: 27개 통과·외부 HTTP 0·test-agent/verification-single/verification.json
- 네이티브 입력 보호·내부 실제 wheel scroll: test-agent/native-probe/summary.json
- 설치 스킬 문법: quick_validate 통과
- 시각 확인: compare/simple/advanced의 데스크톱·390px·320px 캡처
- 코드 검토: 읽기 전용 접근성·Escape·중복 화면 이름 3건 수정 후 추가 확정 결함 없음

## 확인 한계

- 실물 터치·VoiceOver 실제 읽기 미검증
- OS별 네이티브 드롭다운 팝업 외형의 동일성 보장 제외
- 사용자 최종 시각 판단 미완료
- main 통합·운영 배포 미수행
