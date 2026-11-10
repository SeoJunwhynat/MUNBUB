# 맛춘범 / 한국사·통합사회 Render 서비스 분리 (2026-11-11)

## 기존 맛춘범 Render (core)
- Repository: SeoJunwhynat/MUNBUB
- Deployment branch: migration/render-neon
- `MB_SERVICE_ROLE`: unset or `core`
- `/` opens the original Korean spelling/idioms game (`index.html`).
- The added top subject-navigation panel is disabled.
- `/subject-select.html` redirects to `/`.
- `/history-*`, `/social-*`, `/assets/history-exam/*`, and `/api/history-*` are unavailable (404) on the core host.

## Separate Render using the other Google account (not created yet)
1. Sign in to the other Render account and create a Web Service from GitHub repository `SeoJunwhynat/MUNBUB`, branch `migration/render-neon`.
2. Use Node >=22, build `npm install --ignore-scripts --no-audit --no-fund && npm run check && npm test`, start `npm start`, health path `/healthz`.
3. Set `MB_SERVICE_ROLE=study`. This makes `/` serve the saved subject launcher and allows original history pages and API routes.
4. Configure secure **separate** `DATABASE_URL` and `SESSION_SECRET` values only after reviewing the history ranked/coop account dependencies. Do not copy production credentials into public files.
5. Social studies currently has no standalone implementation in this branch; create its pages and APIs under the study deployment.
6. Test history quizzes, story, museum, multiplayer/login, and audio in the new service before announcing migration complete.

## Backups and limitations
- Original state retained at `backup/pre-study-split-20261111`.
- History source and files remain in the repository for safe migration, but are no longer served by the core Render. This does **not** shrink old Git history or fully isolate the two codebases.
- To optimize deployed storage and completely isolate builds, move history/social source and media into a separate repository after the study Render is running.
- Core Render was reported suspended for billing on 2026-11-11; a Git push is not proof that its public URL is live.
