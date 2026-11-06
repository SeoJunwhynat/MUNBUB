# 맛춘범 (MUNBUB)

맞춤법과 사자성어 학습 및 퀴즈 게임 프로젝트입니다.

- 웹 진입점: `index.html`
- 서버 API: `api/`
- 이미지와 UI: `ui-assets/`
- 배경 음악: `assets/bgm/`
- 서버 공통 코드: `lib/`
- 테스트: `tests/`

기존 `whynat0517/MUNBUB` 저장소의 코드를 `SeoJunwhynat/MUNBUB`로 이전했습니다. 신규 저장소의 `main` 브랜치를 Vercel 배포 소스로 사용합니다.

배포: https://matchunbeom.vercel.app/

## Render + Neon 서버 이전 (테스트 브랜치)

Vercel Blob의 요청 한도를 우회하는 새로운 운영 구조를 준비 중입니다.

- 배포 브랜치: `migration/render-neon`
- Render: `render.yaml`의 Node 웹서버 `server.js`
- DB: Neon PostgreSQL `matchunbeom-prod / munbub`
- 검증: `npm run check && npm test`
- 이전 및 기존 사용자 데이터 복사 절차: [RENDER_MIGRATION.md](./RENDER_MIGRATION.md)

원본 Vercel 사이트와 데이터는 Render의 전체 기능 검증이 끝날 때까지 보존합니다.
