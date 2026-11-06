# 신규 괴물 v3 + 4개 음원 적용

- 3D 모델: `assets/monsters/spelling_monster_v3.glb` / `src/SpellingMonster.mjs` / `src/BackroomsMonsterVisual.mjs`.
- 동일 WebGL 캔버스와 깊이 버퍼를 통해 기존 미로를 먼저 그린 뒤 GLB를 렌더링함. 별도의 overlay canvas를 사용하지 않음.
- AI/충돌/방 진행은 기존 로직 유지. AI 거리 기반 애니메이션: Idle, Patrol, Search, Notice, Chase, Attack.
- 추격 시작: 비명1.mp3 + Notice(약 1초) 뒤 Chase.
- 추격 중: 비명2와 비명3 불규칙하게 교대 재생.
- 붙잡힘: 비명1.mp3 + Attack + 약 1.55초 점프스케어 화면 뒤 결과 화면.
- 기존 두 괴물 효과음은 비추격 배회 중 무작위로 재생.
- 배경소리.mp3는 게임 시작 후 낮은 음량으로 반복; 기존 형광등·발소리·기타 효과음 유지.
- 모든 음원은 HTML에 내장되어 재생되며 sfx/에도 파일별 보관.
- 운영 환경에서 GLB 로딩을 위해 **HTTP(S) + CDN 접속** 필요(Three.js 0.160.1).
- `file://`로 열면 GLB/ES 모듈은 CORS로 차단될 수 있음. 로컬 서버 사용.
- WebGL이 없거나 CDN/GLB 로드에 실패하면 기존 임시 괴물을 표시하도록 안전한 폴백 구성.
- 글자 기반 단말기 3문제씩 24문제/스태미나/협동 서버는 그대로.

## 테스트해야 할 항목
- [ ] 실제 사용자 PC/모바일에서 CDN + GLB 로딩 및 애니메이션 상태 확인
- [ ] 벽 사이·문 뒤에 있을 때 깊이 가림 확인
- [ ] 모델 발 접지/발 미끄러짐 확인
- [ ] 모바일 FPS/발열/음량 레벨 실기기 테스트
- [ ] 2명 접속 SSE 위치동기화와 괴물 소리 확인
