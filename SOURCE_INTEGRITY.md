# 소스 무결성 및 검증 범위
- 보존 대상: 기존 `api/account.js`, `api/duel.js`, `api/public-rooms.js`, `api/public-arena.js`, `api/ranked.js`, `api/score.js`, `lib/mb-storage.js`, `lib/mb-server.js`, 기존 업적·칭호 UI/에셋/데이터는 **수정하지 않음**.
- 변경 대상: `index.html`(스크립트 참조 1줄), `server.js`(인증/라우팅), `package.json`(문법검사 2개 추가), `backrooms/*`, `munbub_backrooms_entry_20261106.js`, `tests/backrooms-integration.test.mjs`.
- GitHub 최신 `migration/render-neon` 기준, `apply_to_latest.py`가 기존 코드를 먼저 읽고 예상한 부분이 일치할 때만 패치를 적용함.
- 본 ZIP을 GitHub에 **ZIP 그대로 업로드하면 적용되지 않는다**. deploy script는 클론→병합→검사→커밋→푸시를 수행함.
- 통합 소스의 실시간 전송은 HTTP+SSE, 단일 Node 서버 인메모리 방. 장기적인 멀티 서버 운영에는 영속/공유 상태 저장 필요.
