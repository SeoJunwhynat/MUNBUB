# 맛춘범 수정본: 다음 대화 인계 안내

- 시작 파일: `index.html`
- 배포 구조: Vercel 정적 페이지와 `api/` 서버리스 함수
- 문제 화면의 홈 노출/스크롤, 카드 크기 및 상단 배치, 메뉴 버튼 확대·이동, 공개방의 로그인 진입 동작을 수정함.
- 계정과 공개방 데이터는 Vercel Blob을 사용함. Vercel 프로젝트에 `BLOB_READ_WRITE_TOKEN`이 연결되어 있어야 계정 생성·로그인·공개방 저장 기능이 작동함.
- 브라우저에서 `index.html`만 직접 열면 서버리스 API가 동작하지 않음. 전체 프로젝트를 Vercel에 올려 실행할 것.
- 최신 로컬 변경 커밋: `0bba0df Fix gameplay viewport and public room entry`
- 이 커밋은 자동 검토에서 원격 `main` push가 차단되어 아직 GitHub/Vercel에는 반영되지 않음.
