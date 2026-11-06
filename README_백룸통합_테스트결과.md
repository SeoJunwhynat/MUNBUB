# 맛춘범 × 백룸 3D 협동 모드 — 통합 패치

## 확인한 원본
- 백룸 v3: 사용자가 올린 `backrooms_transfer_code_20261106(1).zip` 및 `backrooms_transfer_complete_20261106(1).zip`. 두 ZIP의 `backrooms_coop_v3/index.html`, `server.js`, `bank.json`은 같은 버전.
- 게임: 1인칭 3D와 13개 모바일 HUD 편집, 8개 단말기, 맞춤법 156개·사자성어 95개, 2~4인 협동, 괴물 추격, 열쇠 2개.
- 기존 맛춘범: Render 서비스 `matchunbeom-render`, GitHub 저장소 `SeoJunwhynat/MUNBUB`의 **`migration/render-neon` 브랜치**, 비교 시점 커밋 `6636e0d227019a1a7d98fc686cbc2816bc9c0f79`.
- 기존 서버는 Node.js ESM + Neon, 원래 백룸은 CommonJS HTTP+SSE 독립 서버. 따라서 별도 포트가 아니라 기존 Render Node 서버 안에 백룸 HTTP+SSE를 라우팅하도록 변경.

## 적용 내용
1. 홈에 새 버튼 `🚪 백룸 3D 협동 탐험` 한 개를 추가. 백룸 주소는 `/backrooms/`.
2. 기존 맛춘범의 서명된 `mb_session` 쿠키로 협동 게임 로그인 검증. 방장·참가자의 ID와 닉네임은 쿠키에서 읽으며, 클라이언트가 보낸 이름은 무시.
3. 협동 API는 `/backrooms/api/create`, `/join`, `/action`, `/leave`, `/events`(SSE), `/health`를 사용. 같은 도메인에 서비스하여 별도 CORS 설정이나 외부 포트를 요구하지 않음.
4. 방 코드, 2~4인 대기실·준비·시작, 팀 상태, 서버 기준 괴물·정답·잠금·열쇠·탈출 처리 유지. 같은 계정의 재입장을 허용하고, 방 하나당 계정 하나/최대 4인.
5. 원래 백룸 서버가 수신한 클라이언트 정답을 신뢰하던 부분은 제거: **서버가 문제를 다시 추첨**하며 SSE 스냅샷에서 `answer`, `accepted`, `exp`를 제외.
6. 클라이언트는 서버 답변 결과와 정답 선택지 인덱스를 사용하고, 기존 3D WebGL/Canvas 렌더링·솔로 플레이·13개 HUD 설정을 유지.
7. 기존 `api/account.js`, `api/duel.js`, 공개방, 랭킹, 업적, 칭호, 사용자 데이터 및 DB 스키마는 건드리지 않음.

## 최신 GitHub 브랜치에 안전하게 배포하는 방법
`apply_to_latest.py`는 기존 소스를 바탕으로 `server.js`/`index.html`/`package.json` 세 파일에 필요한 내용만 삽입하고, 백룸 새 파일을 추가한다. 기존 소스 전체를 오래된 ZIP으로 덮어쓰지 않는다.

**Windows**: 이 업데이트 ZIP을 압축 해제하고 `deploy_to_render_windows.bat`을 실행한다. Git for Windows, Python 3, Node.js 22+가 필요하다. GitHub 로그인 권한이 있어야 `git push` 가능하다.

**macOS/Linux**: `sh deploy_to_render_mac_linux.sh` 실행.

각 스크립트는 GitHub 최신 브랜치를 별도 폴더로 clone → 변경 적용 → `npm ci` → `npm run check` → `npm test` → `git commit`/`push` 순으로 실행한다. Render의 자동 배포 설정은 해당 브랜치의 커밋을 감지한다.

### 유의할 제한 사항
- **Render에 이번 업데이트를 아직 게시하지 않았다.** 이 ZIP은 배포 가능한 통합 패치이며, 사이트가 이미 변경됐다고 말할 수 없다.
- Render 단일 프로세스 Map에 방/플레이어를 보관한다. 재시작·슬립·재배포·인스턴스 확장 시 **협동 게임 방 진행은 초기화**될 수 있다. 계정·랭킹 등 기존 Neon 데이터는 영향을 받지 않는다. 안정적인 영속 협동 진행은 추후 DB 저장 또는 별도 게임 서버가 필요하다.
- HTTP/SSE로 동기화하며 WebSocket을 새로 도입하지 않았다. 한 사이트/한 프로세스 기준 최대 4인 방은 동작하지만 실제 서로 다른 인터넷망 실기기 4인 테스트 및 장시간 부하는 아직 미검증.
- 기존 3D 코드 자체의 게임성/물리 충돌은 사용자 ZIP 기반이며, 이번 테스트만으로 모든 맵에서 이동/괴물 AI가 정상임을 보증하지 않는다.
- 브라우저 자바스크립트에 들어 있는 솔로 문제은행을 사용자가 확인할 수 있으므로 완벽한 치팅 방지는 불가능하다. 서버가 채점하는 구조는 유지한다.
- 솔로 플레이는 맛춘범 로그인 없이 가능하다. **협동 모드**는 반드시 맛춘범 로그인 필요.
- 백룸 서버 소스/문제 정답 JSON 파일은 웹 서버에서 직접 노출되지 않게 라우팅됨.

## 테스트 결과
- Node `node --experimental-vm-modules --test tests/*.test.mjs`: **19개 통과**, 0개 실패 (보관한 기존 맛춘범 테스트 12 + 백룸 추가 7).
- Node `node --check`로 통합 서버, 백룸 서버, 홈 런처 문법 확인.
- Chromium `set_content` DOM 검사: 1280×720 PC, 390×844 모바일에서 메뉴와 로그인 닉네임 UI, 버튼 활성화 확인, JS 오류 0.
- Chromium 샌드박스에서 실제 WebGL 3D 장면 재생은 확인하지 못함. 직접 로컬 HTTP 주소 열기는 관리자 정책으로 차단됨.
- 사용자가 제공한 전체 ZIP에는 개발 미리보기 PNG가 추가로 포함되어 있음. 이 패치 ZIP은 실제 실행에 필요 없는 PNG를 제외해 경량화함.
