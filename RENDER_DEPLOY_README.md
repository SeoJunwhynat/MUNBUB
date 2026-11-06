# 맛춘범 — Render 배포용

- 이 폴더는 2026-11-06 최신 업적 45종·칭호 11종과 기존 게임 전체 소스를 포함합니다.
- Node.js 22 이상, `npm install --omit=dev`, `npm start`.
- 서버가 `/api/{account,duel,health,leaderboard,public-rooms,ranked,score}`를 제공하고 HTML/CSS/JS/이미지/음악을 정적 제공함.
- **중요:** 원본 서버는 Vercel Blob에 저장하므로, Render에서도 기존 `BLOB_READ_WRITE_TOKEN`이 필요합니다. 새 Render 계정/서비스에서 해당 토큰 없이 로그인·랭킹·공개방은 `/api/health`가 503을 반환합니다. 비밀키를 소스에 넣지 마세요.
- GitHub가 2026-11-06 통합본 이전인 경우 Render에서 기존 브랜치 재배포만 하면 새로운 업적/칭호 UI가 적용되지 않습니다. 이 Render용 소스 전체를 실제 연결 저장소에 반영해야 합니다.
- Render에서는 `healthCheckPath: /`로 시작 여부만 확인하므로 로그인/멀티 기능은 별도로 `/api/health` 확인 필요.
- 별도의 배포가 수행된 것은 아니며, 이 ZIP은 배포를 위한 준비물입니다.
