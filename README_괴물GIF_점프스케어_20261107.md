# 백룸 괴물 GIF 점프스케어 업데이트 (2026-11-07)

## 반영 내용
- 플레이어가 괴물에게 잡히면 보내준 8프레임 GIF `backrooms/assets/jumpscare/monster_rush.gif`를 화면 위에 표시.
- 기존 `playChaseCue('caught')`로 비명1이 재생되는 순간과 GIF 시작을 일치시킴.
- GIF는 HUD·게임 메뉴·3D 모델보다 높은 오버레이(z-index 1000)에 배치하며, 화면 중앙에서 크기를 조절해 PC/모바일에서 잘 보이게 함.
- 1.76초 후 게임 오버 화면으로 이동, 재시작 시 GIF 이미지와 재생 상태를 초기화.
- GIF 원본 그대로 보존, 새로 그리거나 프레임을 변형하지 않음.
- 기존 3D 괴물 모델/추격 AI, 배회 효과음, 비명 2·3, 맞춤법 24문제, 협동 서버, 스태미나 기능 유지.

## 수정 파일
- `backrooms/index.html` — 오버레이, 재생/정리 함수, 잡힘 연출 시간 수정
- `backrooms/assets/jumpscare/monster_rush.gif` — 사용자 제공 GIF 복사
- `tests/backrooms-chase-clips.test.mjs` — 변경된 게임 오버 전환 시간 테스트
- `tests/backrooms-jumpscare-gif.test.mjs` — GIF의 포함·실행 연결 테스트

## 확인 결과
- 전체 Node 테스트: 43개 통과 (Node 22, `node --experimental-vm-modules --test tests/*.test.mjs`).
- PC 1365×768 / 모바일 390×844: 페이지에 GIF 표시(원본 크기 443×443), 최상단 표시 및 게임 오버 화면 전환 확인.
- 브라우저 테스트는 실제 외부 사이트 대신 격리된 로컬 HTML을 수정하여 실행했으며, 네트워크를 이용하는 Three.js 모델과 협동 실기기 FPS는 재검증되지 않음.

## 배포 방법
- 백룸 소스가 포함된 **최신** GitHub 배포 브랜치에 수정된 전체 소스를 반영한 뒤, 기존 Vercel/Render 자동 배포 연결을 통해 배포.
- 단일 패치만 적용할 경우 `backrooms/index.html`과 `backrooms/assets/jumpscare/monster_rush.gif`를 반드시 같은 상대 경로에 넣어야 함.
- 실시간 배포 성공은 별도 Vercel/Render 배포 상태 확인 전까지 주장할 수 없음.
