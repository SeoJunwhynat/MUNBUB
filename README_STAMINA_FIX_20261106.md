# 백룸 스태미나 0% 탈진/완전 회복 수정

- 원본: `matchunbeom_backrooms_audio_20261106_full.zip` (걷기 발소리/환경 노이즈 적용 버전)
- 수정: `backrooms/index.html`의 달리기 스태미나가 2% 제한에 막히지 않고 0%까지 소모됨.
- 0% 도달 순간 `staminaExhausted` 플래그 활성화 및 강제 걷기 전환.
- 회복 중 Shift나 모바일 달리기 버튼을 계속 누르고 있어도 달릴 수 없음.
- 스태미나 100%가 되면 탈진 잠금 해제. 이후 달리기 재사용 가능.
- 스태미나 게이지에 `회복 중` 표시, 모바일 달리기 버튼 회색 상태/접근성 안내, 상태 전환 알림 추가.
- 새 게임/재시작 시 스태미나 100% 및 탈진 플래그 초기화.
- 기존 소리/발소리, 문제/서버, 모바일 HUD 커스터마이징 유지.

## 테스트
- Node.js `node --experimental-vm-modules --test tests/*.test.mjs`: 26/26 통과.
- 신규 테스트 `tests/backrooms-stamina.test.mjs` 4개는 실제 백룸의 `updateSprint()` 함수를 VM에서 실행해 0%, 재충전 잠금, 재사용과 UI 연동을 검사.
- 브라우저 자동 실시간 실행은 이 환경에서 시간 제한으로 완료하지 못함. 기기별 실제 조작은 배포 전 추가 확인 권장.

## 배포
- 배포하지 않은 완전 소스 ZIP. 기존 사이트의 Github/Vercel은 변경하지 않음.
- 백룸만 실행할 경우 `backrooms/index.html` 또는 별도 제공된 단독 HTML 파일 열기.
