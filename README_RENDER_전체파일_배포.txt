맛춘범 + 백룸 전체 소스 (Render)
================================
GitHub 저장소: SeoJunwhynat/MUNBUB
Render 자동 배포 브랜치: migration/render-neon
Render 서비스: https://matchunbeom-render.onrender.com

이 ZIP은 패치가 아니라 전체 프로젝트 소스입니다.
ZIP 자체를 업로드하는 것이 아니라 압축을 풀어 나온 파일과 폴더를
저장소 최상위(기존 index.html, server.js가 위치한 곳)에 넣습니다.

주의: 이미 원격 브랜치에서 변경한 코드가 있다면 덮어쓰기 전에
Git diff로 비교하고 합치세요. 배포 브랜치를 꼭 확인하세요.

예시:
  git checkout migration/render-neon
  git pull origin migration/render-neon
  (압축을 푼 전체 파일을 기존 프로젝트 폴더에 복사)
  npm run check
  npm test
  git add .
  git commit -m "Update Backrooms monster jumpscare and audio"
  git push origin migration/render-neon

Render는 해당 브랜치에 새 커밋이 푸시되면 자동 배포합니다.
Render 배포 로그의 Live 상태까지 확인하세요.

이 ZIP은 Render 정적 자산 경로를 허용하도록 server.js를 수정했습니다.
허용: backrooms/src/*.mjs, backrooms/assets/jumpscare/*.gif,
backrooms/assets/sfx/*.mp3/.wav/.ogg,
backrooms/assets/monsters/*.glb
금지: backrooms/bank.json, backrooms/server.js 등 비공개 경로.
