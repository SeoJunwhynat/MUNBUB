# 맛춘범 Render 이전 절차

## 현재 준비된 항목
- 원본 저장소: https://github.com/SeoJunwhynat/MUNBUB
- 신규 Render 준비 브랜치: `migration/render-neon`
- 테스트 코드/정적 리소스/Node API: 동일 저장소
- Render 자동 배포 설정: `render.yaml`
- Neon PostgreSQL 프로젝트: `matchunbeom-prod` (Singapore)
- Neon 프로젝트 ID: `long-sea-46873155`
- 데이터베이스: `munbub`, 테이블: `public.mb_objects`

**주의:** 기존 Vercel/Blob/도메인은 이전 검증이 완료될 때까지 그대로 보존한다.

## 1. Render 배포

1. Render 대시보드(https://dashboard.render.com/)에 GitHub로 로그인한다.
2. New → **Blueprint**를 선택한다.
3. 저장소 `SeoJunwhynat/MUNBUB`를 연결한다.
4. Blueprint 브랜치를 `migration/render-neon`으로 선택한다.
5. 자동 감지된 `render.yaml`을 이용한다.
6. `DATABASE_URL` 비밀값 입력 요청이 나오면 **Neon Console의 Connect** 메뉴에서 프로젝트 `matchunbeom-prod` → DB `munbub`의 PostgreSQL 연결 문자열을 복사하여 입력한다. 이 비밀값은 채팅·GitHub·스크린샷에 공개하지 않는다.
7. `MB_SESSION_SECRET`은 Blueprint가 자동 생성한다. 추가 요금 항목을 확인한 후 Free 서비스 생성을 진행한다.
8. 배포가 READY/Live가 되면 `https://<Render에서 생성된 주소>.onrender.com/`에서 확인한다. (정확한 주소는 생성 후 표시된다.)

Blueprint 기본값:
- Region: Singapore
- Node: 22 이상
- Web Service: Free
- Build: `npm install --ignore-scripts --no-audit --no-fund && npm run check && npm test`
- Start: `npm start`
- Health: `/healthz`
- GitHub `migration/render-neon` 브랜치에서 코드 변경 시 자동 배포

## 2. API 검증

- `/healthz`: `status: up` (Node 프로세스 정상)
- `/api/health?probe=storage`: `status: storage-readable` 및 `backend: postgres` (DB 읽기 확인)
- 신규 테스트 닉네임으로 계정 생성·로그인, 중복 닉네임 가입 차단
- 랭킹 생성 및 조회 확인
- 두 기기로 공개방 생성/참가/시작/문제/이모티콘/퇴장 확인

주의: DB에 과거 사용자 정보가 없으면 기존 닉네임/비밀번호 로그인은 실패한다. 데이터 이전이 필요하다.

## 3. 기존 Blob 사용자 데이터 복사

기존 Blob 제한이 해제된 이후, 신뢰할 수 있는 개발 환경에서 다음을 일회성 실행할 수 있도록 `scripts/migrate-blob-to-postgres.mjs`를 제공한다.

```bash
# 실제 비밀값은 환경변수로만 설정한다. 터미널/채팅/코드에 공개하지 않는다.
node scripts/migrate-blob-to-postgres.mjs
```

실행 환경변수:
- `DATABASE_URL`: 신규 Neon DB 연결 문자열
- `BLOB_READ_WRITE_TOKEN`: 기존 Blob 저장소의 읽기/쓰기 토큰

스크립트는 `names/`, `profiles/`, `rankings/`, `scores/`를 **원본 삭제 없이** 복사한다. 현재 한도 초과로 접근할 수 없다면 복사를 시도하지 않는다. 기존/신규 계정을 병행할 때는 닉네임 충돌 검증이 필요하다.

## 4. 최종 전환

신규 Render URL에서 전체 기능 검증이 끝나면 PR을 검토해 `main`에 합치고, Render 서비스의 배포 브랜치를 `main`으로 바꾼다. 기존 Vercel 도메인 `matchunbeom.vercel.app`은 Render로 직접 이전되는 도메인이 아니다. `.com` 같은 별도 소유 도메인이 있다면 연결을 설정할 수 있다.

## 운영 주의

Render Free 웹 서비스는 15분간 요청이 없으면 잠들 수 있고 재시작에 시간이 걸린다. 빠른 실시간 대전이 중요한 경우 유료 인스턴스 또는 더 적합한 실시간 서버가 필요할 수 있다. PostgreSQL도 무료 플랜 사용량을 모니터링해야 한다.
