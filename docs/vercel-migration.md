# Vercel 이전 — 결정 사항 및 절차

승인일: 2026-11-19

## 1. 배경

- 회사 PC에서 `navaljey.github.io`가 열리지 않음 (`ERR_TIMED_OUT`, 회사 네트워크 차단으로 판단)
- 회사 PC 사전 테스트 결과 (2026-11-18) — 모두 통과

| 주소 | 결과 |
|---|---|
| `holiday-calendar-push-server.vercel.app/api/config` | 열림 (`*.vercel.app` 접속 가능) |
| `unpkg.com` (React) | 열림 |
| `cdn.tailwindcss.com` | 열림 |
| `accounts.google.com` | 열림 |

## 2. 승인된 결정

| 항목 | 결정 |
|---|---|
| 새 주소 | `https://han-viet-calendar.vercel.app` |
| 배포 방식 | 같은 저장소를 Vercel에 추가 배포. `main`에 push하면 GitHub Pages와 Vercel이 함께 갱신됨 |
| 기존 github.io | **예비용으로 유지**. 자동 이동(리다이렉트) 없음 |
| 사용 기기 | 아이폰·개인 노트북·회사 PC 모두 새 주소로 통일 |
| 코드 수정 | `manifest.webmanifest`의 `id`를 절대주소 → `"./"` (주소와 무관하게 동작) |

리다이렉트를 하지 않는 이유: 아이폰 홈 화면 앱이 다른 주소로 넘어가면 앱 화면이 아닌 브라우저 창(주소창 표시)으로 열려 어중간해짐.

## 3. 영향

| 항목 | 영향 | 대응 |
|---|---|---|
| 기기 데이터(localStorage) | 주소마다 따로 저장됨 → 새 주소는 빈 상태로 시작 | 로그인하면 Drive에서 자동 불러오기 (기존 동기화 규칙) |
| 미저장 변경 | 기존 주소에 "● 저장 대기"가 있으면 새 주소로 안 넘어감 | 이전 전 기존 주소에서 "✓ 저장됨" 확인 |
| Google 로그인 | 새 주소를 OAuth "승인된 자바스크립트 원본"에 등록하지 않으면 `origin_mismatch` | 절차 4단계 |
| 아이폰 홈 화면 앱 | 주소별로 별도 앱·별도 저장공간 | 새 주소로 다시 "홈 화면에 추가" |
| Push 알림 | 서버 CORS `*` → 영향 없음 | 새 주소에서 알림 권한만 다시 허용 |
| 두 주소 동시 사용 | 같은 Drive 파일 사용, 기존 충돌 방지 규칙 적용 | 추가 조치 없음 |

## 4. 절차

1. (완료) 이 문서 작성 + `manifest.webmanifest` 수정
2. Vercel 새 프로젝트: 저장소 `Navaljey/holiday-calendar` 연결, Framework = Other, Root Directory = `./`, 빌드 명령 없음
3. Vercel 프로젝트 이름(주소)을 `han-viet-calendar`로 설정
4. Google Cloud Console → API 및 서비스 → 사용자 인증 정보 → OAuth 클라이언트(`314931997732-…`) → 승인된 자바스크립트 원본에 `https://han-viet-calendar.vercel.app` 추가 (기존 github.io 원본은 유지)
5. 개인 노트북에서 새 주소 접속 → 로그인 → 일정 불러오기 확인
6. 아이폰: 기존 앱 "✓ 저장됨" 확인 → Safari로 새 주소 → 홈 화면에 추가 → 로그인
7. 회사 PC: 새 주소 접속 → 로그인 확인
8. 며칠 사용 후 아이폰 기존 아이콘 삭제

## 5. 남는 위험

- 회사가 이후 `*.vercel.app`도 차단할 수 있음 → 그때 대안은 개인 도메인 연결
- 회사 PC에서 Drive 업로드가 막히면 "이 기기에 보관됨" 상태로 동작 (기존 설계대로)
