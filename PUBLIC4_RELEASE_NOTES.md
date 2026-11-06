# 맛춘범 공개방 2~4인 확장 (2026-11-06)

- 기존 친구 초대 1대1 `/api/duel` 유지, 공개방은 독립 `/api/public-arena` 엔드포인트로 분리.
- 방장 설정 최대 2/3/4명. 모두 준비하면 2명부터 시작 가능. 게임 중 중도 참가 제한.
- Neon PostgreSQL JSONB 단일 방 상태 + revision compare-and-swap으로 동시 입장/답변/채점의 덮어쓰기 방지.
- 서버 기준 문제/시간/채점/라운드 진행. 기존 100개 사자성어 및 맞춤법 문제은행 재사용.
- 4인 점수판, 로비 채팅, 12종 이모티콘, 1~4위 결과 UI.
- 서버 자동 테스트: 4인 동시 입장, 5인 차단, 준비, 서버 동기화, 퇴장, 복귀 등.
- 이번 소스는 배포 전 실계정 네 명의 기기/네트워크 분리 동기화 테스트가 필요함.

## Render 배포
Render 자동 배포 연결: SeoJunwhynat/MUNBUB `migration/render-neon` 브랜치, matchunbeom-render 서비스.
`python scripts/apply_public4.py` 는 해당 브랜치의 `server.js` 및 `package.json`에 필요한 최소 패치만 가함.

## 주의
사설 1대1 방과 4인 공개방의 코드 라우트는 의도적으로 별도로 유지한다. 이전 1대1 서버 데이터는 수정하지 않는다.
