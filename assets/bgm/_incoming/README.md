# 2026-11-10 음악 교체 업로드 위치

이 폴더에 아래 ZIP 파일 **3개 모두** 업로드하세요. 세 파일을 한 번에 드래그하여 한 커밋으로 업로드하는 것이 좋습니다.

- `history_music_update_20261110_part1.zip` (기존 Late Night Study Session, Magical Bookshelf, ネオン・ループ 음원 6곡 교체)
- `history_music_update_20261110_part2.zip` (Menu Drift, Nostalgic Tape, Triumphant Fanfare 각 2개)
- `history_music_update_20261110_part3.zip` (신비로운 모험, 역사의 여정, 퀴즈의 리듬 각 2개)

**ZIP은 압축을 풀지 말고 그대로 이 폴더에 업로드하면 됩니다.**

Render 빌드의 `scripts/assemble-supplied-bgm.mjs`가 각 ZIP 내부 MP3를 SHA-256으로 검증한 뒤 `assets/bgm/`에 자동으로 복원합니다. 기존 곡과 파일명이 같으면 사용자 최신 원본으로 **덮어쓰고**, `(1)` 버전은 원곡과 다른 파일명(`_2.mp3`)으로 유지합니다.

| 원래 받은 파일 | 실제 서버 파일 |
|---|---|
| `Late Night Study Session(1).mp3` | `late_night_study_1.mp3` |
| `Late Night Study Session (1)(1).mp3` | `late_night_study_2.mp3` |
| `Magical Bookshelf(1).mp3` | `magical_bookshelf_1.mp3` |
| `Magical Bookshelf (1)(1).mp3` | `magical_bookshelf_2.mp3` |
| `ネオン・ループ(1).mp3` | `neon_loop_1.mp3` |
| `ネオン・ループ (1)(1).mp3` | `neon_loop_2.mp3` |

나머지 12곡은 각 이름별 `_1.mp3`와 `_2.mp3`로 분리됩니다.

같은 제목의 두 파일은 **동일한 파일이 아니며** 하나를 제거하거나 자동으로 합치지 않습니다. `catalog.json`은 빌드 시 실제 배포된 파일만 확인하여 생성되고, 각 파일의 SHA 기반 캐시 버전이 포함됩니다.

미등록 ZIP은 건너뛰므로 기존 서비스는 계속 실행됩니다. 업로드 뒤에는 Render 로그에서 `BGM history update: 18 installed, 0 awaiting archive upload`을 확인하세요.

## 2026-11-10 신규 5곡 등록 (별도 패키지)

신규 패키지 파일: **`history_music_register_5_20261110.zip`**. 위 3개 ZIP은 이미 설치되어 있으므로 **다시 업로드할 필요 없습니다.**

| 업로드 원본 | 서버에서 사용할 음원명 |
|---|---|
| Afternoon_in_a_Seoul_Teahouse(1).mp3 | Afternoon_in_a_Seoul_Teahouse.mp3 |
| Questions_in_the_Gallery(1).mp3 | Questions_in_the_Gallery.mp3 |
| The_Clockmaker_s_Ledger(1).mp3 | The_Clockmaker_s_Ledger.mp3 |
| 마지막_장을_넘겨도(1).mp3 | Last_Page_Turned.mp3 |
| Flowers_Beneath_the_Wall.mp3 | Flowers_Beneath_the_Wall.mp3 |

1~4번 곡은 이전 제공 파일과 SHA-256이 동일한 곡으로, 원곡을 중복으로 등록하지 않고 기존 재생목록의 미등록 음원 파일을 복구합니다. 5번 곡은 새 곡으로 추가됩니다.

이 폴더에 ZIP을 **압축 해제하지 말고 그대로** 업로드하면 다음 Render 빌드에서 전체 5곡의 크기와 SHA-256을 검사하고 `assets/bgm/`로 복원한 뒤, 맛춘범·한국사 퀴즈의 공용 재생목록을 갱신합니다. 누락 파일을 재생 가능으로 표시하지 않으며, 업로드 전에는 기존 44곡만 유지됩니다.

배포 성공 로그: `BGM five-track registration: 5 installed, 0 awaiting archive upload`, 그리고 최종 `BGM catalog OK: 49 installed MP3 tracks`.
