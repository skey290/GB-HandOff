# Gabrielle Content Studio — 화면/플로우 종합본

> 이 문서는 GB_Compass.md(지표 설계 스펙)와 달리 별도의 원본 스펙 문서가 없어, Figma 파일(GB_Content-Studio)의 화면/플로우를 역으로 분석해 정리한 문서다. GB_Self.md와 동일한 방식으로 작성한다.
> 용어 원칙: "persona" 사용 금지, "self"(내부) / "identity"(사용자 대상 카피)만 사용 (GB_all.md 4절).

## 0. 모듈 정의 (GB_all.md 5.2절, 6절 기준)

- identity를 기반으로 SNS 게시물을 자동 생성한다 (LinkedIn 우선, 이후 블로그/뉴스레터/Twitter 등으로 확장 예정).
- 생성된 콘텐츠에 대한 전략적 분석을 제공한다 (Analysis).
- 기본 스케줄링이 이미 세팅되어 있어 사용자가 처음부터 일정을 짜야 하는 부담이 없다 ("시작의 부담 제거").
- 일회성 생성이 아니라 **지속적인 일관성**을 사용자의 추가 노력 없이 자동으로 유지하는 것이 핵심 가치다.

**핵심 가치**: (1) 시작의 어려움 제거 (2) 일관성이 사용자의 지속적 노력 없이 자동 발생.

**참고 — 콘텐츠 생성 상세 로직 (GB_all.md 6절, 화면에서 확인되는 대로 아래 섹션에 반영)**

- Core Objective 3요소(포지셔닝/타깃/목표 수치)가 콘텐츠 생성의 기준이 됨
- 포스팅 이미지 카테고리화: 인물 포함(행위/표정 × 무그래픽/그래픽 2x2), 인물 미포함(자료 업로드 여부 × 캐러셀/단일 이미지)
- LinkedIn은 네이티브 멀티이미지 캐러셀 미지원 → 캐러셀은 문서(PDF 등) 업로드로 구현, 참여율이 가장 높은 포맷

## 1. 첫 포스팅 생성

5개 화면으로 구성된 온보딩성 첫 생성 플로우.

1. **Analysis 탭 빈 상태** — 포스팅이 하나도 없어 Reach/How people see you/Top Performers/Posts This Month/What people say가 전부 빈 카드. 우측 Action Items에 "No post yet" + **Create posts** CTA.
2. **대화형 생성 화면 진입** — 좌측 "My Post Created" 패널은 아직 비어있고(스케줄 리스트 없음), 중앙에 Gabrielle(브랜드 보이스)이 사용자와 대화하며 톤/방향성을 탐색. "Not just written. Already scheduled.", "SCATTERED / BUT DIRECTION", "Something!", "REFLECTIONS — captured at the right angle", "BEYOND THE SURFACE" 등 타이포그래피 중심 이미지 컨셉 후보를 순차 제시. Compass·Brand Scoring 언급으로 보아 Compass에 쌓인 데이터(강점/방향성)를 근거로 카피를 생성하는 것으로 추정.
3. **같은 대화 + 생성 파라미터 입력** — 좌측 패널에 Today/Tomorrow/Thursday 3일치 스케줄 슬롯(각 3개 시간대, 전부 "No content")과 **Schedule All Draft** 버튼 등장. 대화 중 인라인으로 **Where to post?**(LinkedIn, GB_all.md 5.2절 기준 1순위 채널) / **Select Post Type**(Image/Text) / **Auto-generate** 버튼이 채팅 흐름 안에 나타남.
4. **프로세싱** — Auto-generate 클릭 후 상단 탭이 Analysis→Content로 전환, 9개 포스트 카드 자리가 스켈레톤으로 블러 처리되고 중앙에 "We're creating your brand-fit posts now" 모달(진행률 바 + Cancel) 노출.
5. **생성 완료** — 9개 포스트 카드가 "Data Storyteller" 명의 실제 콘텐츠(이미지+카피+해시태그, Like/Comment/Share/Send, Schedule Draft 버튼)로 채워짐. 좌측 스케줄 리스트의 각 시간대도 "No content"→"Draft" 배지로 전환, 리스트 하단에 **Create More Post +** 버튼 추가.

> 리액션 데이터 없이 화면 배치 순서(좌→우)로 추정한 플로우. Create posts/Auto-generate 버튼의 실제 클릭 트리거 여부는 미확인.

## 2. 개별 포스팅 수정 후 포스팅 확정 (계정 추가, 스케줄 변경)

11개 화면, 좌측 스케줄 리스트의 한 슬롯을 선택해 개별 포스트 수정 모달을 열고 계정/스케줄을 바꾼 뒤 확정하는 플로우.

1. **시작 상태** — Content 탭, 9개 draft 카드 + 좌측 스케줄 리스트 전부 "Draft" (1부 마지막 화면과 동일).
2. **슬롯 선택** — 좌측 리스트에서 "Today, Sep 01 — 10:00 PM" 슬롯 클릭(하이라이트).
3. **수정 모달 오픈** — 좌: Where to post?(LinkedIn + 계정추가 "+"), Date/Time to post, 콘텐츠 타입 탭(All/Image/Text), AI 재작성 지시 입력창, Apply Changes. 우: LinkedIn 미리보기 + Save Changes/Schedule Draft.
4. **계정 추가 드롭다운** — "+" 클릭 시 LinkedIn/X (Twitter)/Instagram/Threads 중 선택.
5. **계정 추가 완료** — X (Twitter) 추가 후 좌측 Where to post?와 우측 미리보기 상단 모두에 "LinkedIn | X (Twitter)" 탭 생성 — **하나의 포스트를 여러 계정에 동시 예약**하는 구조.
6. **날짜 변경 시작** — Date to post 클릭 → 캘린더 데이트피커.
7. **날짜 확정** — 09/18/2026로 반영.
8. **시간 변경 시작** — Time to post 필드 클리어.
9. **시간 확정** — 12:00 PM으로 반영.
10. **플랫폼별 미리보기 차이** — 미리보기를 X(Twitter) 탭으로 전환하면 동일 콘텐츠가 다른 계정 아이덴티티로 보임: LinkedIn "Data Storyteller" → X "Cloe Mitchell"(@Cloe_Mitchell).
11. **확정 완료** — 모달 닫힘 후 해당 슬롯/카드 배지가 "Draft"→"Scheduled"로, 카드 액션 버튼이 "Schedule Draft"→"Edit Post"로 전환.

> 핵심 패턴: draft 상태에서는 액션 버튼이 "Schedule"류, 확정(Scheduled) 상태로 전환되면 "Edit"류로 바뀐다. 계정별로 플랫폼에 맞는 다른 계정 아이덴티티(이름/핸들)가 자동 매핑된다.

## 3. 개별 포스팅에서 아카이빙

3개 화면, 포스트 카드에서 모달을 열지 않고 직접 아카이빙하는 플로우.

1. **다양한 상태 공존** — 2부 이후 상태. Today 3슬롯 "Posted"(Edit Post 버튼 비활성화 회색), Tomorrow 11AM "Draft", 2:25PM "Scheduled", Thursday 3개 "Draft" — 포스트 상태 5종이 동시에 노출됨. 각 카드 좌측 상단에 **archive 아이콘 버튼**이 있음.
2. (①과 동일 화면, 좌측 리스트 hover 대상만 다름 — 상태 차이 없음)
3. **Move to Archive? 확인 다이얼로그** — Draft 카드의 archive 아이콘 클릭 시 모달을 열지 않고 **카드 위에 바로** "Move to Archive?" 다이얼로그가 뜬다. "This will be moved to your archive and take effect immediately." + Cancel/Confirm (GB_Self.md 4부와 동일한 공용 Button Group 패턴).

> 4부(포스팅 모달에서 아카이빙)와의 차이: 이 섹션은 카드에서 직접, 4부는 모달을 연 상태에서 같은 아카이빙 액션을 수행하는 경로.

## 4. 포스팅 모달에서 아카이빙

5개 화면, 3부와 동일한 "Move to Archive?" 다이얼로그를 **포스트 수정 모달 안**에서 트리거하는 경로.

1~2. **베이스라인** — 3부와 동일(Posted/Scheduled/Draft 혼재 상태). 3. **수정 모달 오픈** — "Tomorrow, Sep 02 — 11:00 AM" Draft 슬롯 클릭 → 2부와 동일 구조의 개별 포스트 수정 모달. 4. **모달 내 archive 버튼** — 우측 미리보기 패널 하단 "Save Changes" 버튼 왼쪽에 작은 archive 아이콘이 함께 배치. 5. **확인 다이얼로그** — 그 아이콘 클릭 시 모달이 닫히고 카드 그리드 위에 3부와 동일한 "Move to Archive?" 다이얼로그(Cancel/Confirm)가 뜬다.

> 3부와 4부는 **진입 경로만 다르고(카드 직접 vs 모달 내부) 확인 UI 컴포넌트는 완전히 동일**하게 재사용된다.

## 5. 스케줄 패널에서 기간변경 후 포스팅 생성

6개 화면. 상단 날짜 범위를 바꾸면 해당 기간용 콘텐츠가 없다는 넛지가 뜨고, 1부와 유사한 생성 플로우를 다시 거치는 구조.

1. **시작 상태** — 날짜 범위 "09/01 - 09/30", 9개 카드 + 스케줄 리스트 전부 Draft.
2. **기간 변경 시작** — 날짜 범위 필드 클릭 → Sep/Oct 2026 두 달 동시 표시 드롭다운 달력.
3. **빈 기간 넛지** — 범위가 "10/21 - 10/30"으로 바뀌면 콘텐츠 패널이 "No Post Created"로 바뀌고, 중앙에 "Ready to create your posts?" + "We'll help you shape it to fit your brand." 안내와 **Get started** 버튼 노출.
4. **생성 파라미터 입력** — Get started 클릭 후 대화형 패널. 1부와 달리 **"How many posts are you going to make?"**(-/9/+ 스테퍼)로 생성량을 직접 조절 가능. 좌측 스케줄 리스트도 "Today Oct 21/Tomorrow Oct 22/Thursday Oct 23"로 갱신되어 전부 No content.
5. **프로세싱** — 1부와 동일한 "We're creating your brand-fit posts now" 모달.
6. **생성 완료** — 변경된 기간(10/21~23)에 맞춰 9개 Draft 카드가 새 타임스탬프로 생성(콘텐츠 풀 자체는 1부 결과와 동일한 것으로 보임).

> 1부와의 차이: 진입 트리거가 "Create posts" 버튼이 아니라 **빈 기간으로의 날짜 범위 변경**이고, 생성 개수를 조절하는 스테퍼가 추가됨.

## 6. 스케줄 패널에서 생성된 포스팅 전체 확정

3개 화면. 좌측 상단 **Schedule All Draft** 버튼으로 전체 Draft를 한번에 Scheduled로 전환.

1~2. **시작 상태** — 9개 카드 + 스케줄 리스트 전부 Draft (차이 없는 동일 화면 2장). 3. **일괄 확정 완료** — Schedule All Draft 클릭 후 9개 카드와 9개 슬롯이 전부 한번에 "Scheduled"로 전환, 각 카드 버튼도 일괄로 "Schedule Draft"→"Edit Post"로 변경.

> 2부(개별 확정)와 동일한 상태 전환을 한 번의 클릭으로 전체 적용하는 버튼.

## 7. 스케줄패널에서 포스팅 추가

7개 화면. 기존 기간 끝에 "Create More Post +"로 날짜를 더 연장하고 추가 생성하는 플로우.

1. **시작 상태** — 3일치(Sep01~03) 9슬롯 전부 Draft, 리스트 하단에 **Create More Post +**.
2. (hover 상태, 클릭 직전)
3. **리스트 연장 + 생성 모달** — 클릭 시 리스트에 "Today Sep04/Tomorrow Sep05/Thursday Sep06" 3일치 9슬롯이 **추가**되며(새 슬롯은 "No content" 빨간 배지, 기존은 "Draft"), 동시에 생성 모달 오픈. 1부·5부에 없던 **"How many posts are you going to make?"** 스테퍼가 있고 기본값이 **0**(5부는 9) — 추가분 개수는 사용자가 직접 지정.
4. **계정 추가 드롭다운** — 2부·5부와 동일(LinkedIn/X/Instagram/Threads).
5. **계정 추가 완료** — X(Twitter) 탭 추가.
6. **참조 썸네일 추가** — AI 지시 입력창의 "+" 클릭 시 3개의 원형 인물 썸네일이 입력창에 추가됨 — 1부·5부엔 없던 요소(참조 이미지/언급 기능으로 추정).
7. **프로세싱** — Auto-generate 후 전체 6일치 18슬롯 배경 위에 동일한 프로세싱 모달.

> 5부(기간 변경)와 7부(기간 연장)의 차이: 5부는 **기존 범위를 다른 기간으로 교체**, 7부는 **기존 뒤에 새 기간을 이어 붙이는** 방식 — 리스트에 새/기존 슬롯이 공존하는지 여부로 구분됨.

## 8. 스케줄패널에서 포스팅 주기 변경

7개 화면. 좌측 **Repeat** 패널에서 포스팅 반복 주기를 설정.

1~2. **베이스라인** — 3부·4부와 동일 혼재 상태(차이 없는 화면 2장). 3. **Repeat 패널 — Daily** — 4개 탭(Daily/Weekly/Monthly/Custom) 중 Daily 기본 선택. "On Each Day" 섹션에 "How often would you like to post?"(빈도 스테퍼) + "When would you like to post?"(시간 필드 n개, 각각 삭제 가능) + Done. 4. **Weekly** — 요일 선택기(M~S) 추가, "On Each Day" 설정은 동일 유지. 5. **Monthly** — "On this date — Day [15] of every month"로 전환, 나머지 동일. 6. **Custom** — "Every [2] Days"로 전환, 나머지 동일. 7. **동적 폼 — 빈도 변경 효과** — 같은 Custom 탭에서 "How often" 값을 1로 줄이면 "When would you like to post?" 시간 필드도 1개로 줄어듦 — **빈도 스테퍼 값이 시간 입력 행 개수를 동적으로 결정**하는 패턴.

> 4개 반복 유형(Daily/Weekly/Monthly/Custom)은 "언제 반복되는가"만 다르고, 하단 "하루에 몇 번, 몇 시에"(On Each Day) 설정 UI는 공통으로 재사용.

## 9. 스케줄패널에서 Goal setting 변경

3개 화면. 상단 프로필 카드의 기어 아이콘(추정)으로 **Core Objective(Goal)** 를 편집.

1~2. **베이스라인** — 3부·4부와 동일 혼재 상태(미미한 hover 차이 1장 포함). 3. **My goal 편집 모달** — 상단에 자연어 문장으로 요약된 Core Objective("I'm a data scientist who... positioned as a **Finance-Fluent Modeling Partner** for **early-stage SaaS founders**... I share **3 times a day**... approximately **5,000** targeted followers, maintaining consistent **Monthly** reach...")가 있고, 문장 속 핵심 값이 인라인 배지로 강조된다. 그 아래 구조화된 폼이 문장의 변수와 1:1 대응:

- **Brand Position / Target** (텍스트 입력 2개)
- **Posting Frequency** (Daily/Weekly/Monthly 탭 + 빈도 스테퍼)
- **Targeted Followers** (1K~1M+ 슬라이더)
- **Tracking Frequency (Reach & Engagement Data)** (Weekly/Monthly/Quarterly 탭)
- 하단 Save

> GB_all.md 6.1절의 **Core Objective 3요소(포지셔닝/타깃/목표 수치)**와 이 화면의 Brand Position/Target/Posting Frequency·Targeted Followers가 거의 1:1로 매칭된다 — "자연어 문장 + 그 문장을 구성하는 구조화된 폼"이라는 패턴은 8부(Repeat)의 "On Each Day" 공용 설정과도 유사한 설계 철학(복잡한 설정을 읽기 쉬운 한 문장으로 요약).
> **확정(2026-10-02, 사용자 확인)**: 이 "My goal" 편집 모달은 GB_Know_Thyself.md 6부/9부의 "Edit Goal" 모달과 **동일한 Goal 데이터를 공유**함 — UI만 같은 게 아니라 실제로 하나의 Goal 엔티티를 양쪽에서 편집하는 구조. 구현 시 단일 데이터 소스/API로 설계해야 함.

## 10. 스케줄패널에서 프로필 카드 조작

3개 화면. 좌측 상단 프로필 카드의 확장 인터랙션과 **Self 전환**.

1. **시작 상태** — 프로필 카드 완전 축소(아바타 + 기어/확장 아이콘만).
2. **카드 확장** — 확장(⤢) 아이콘 클릭 시 카드가 펼쳐져 이름 "Cloe" + 태그라인("4 years in finance, 3 in data science — forecasting Finance teams trust.")이 나타나고, 그 아래 현재 Self를 표시하는 **"Data Scientist" 드롭다운**이 추가 노출.
3. **Self 전환 드롭다운** — 드롭다운을 열면 다른 Self 목록(Morning Jogger/Workflow Sculptor/Sunday Baker/Vintage Curator/Brooklyn Observer)이 나타남.

> Content Studio에도 Self 전환 셀렉터가 존재함을 확인 — GB_Compass.md 8부(좌측 원형 시각화와 분리된 우측 패널 Self 전환), GB_Self.md 10부(디테일뷰 상단 Self 탭)와 동일한 "Self별로 보는 화면을 바꾸는" 패턴이 Content Studio에서는 프로필 카드 드롭다운 형태로 구현된 것으로 추정. 선택 시 실제로 콘텐츠/스케줄 리스트가 해당 Self 기준으로 전환되는지는 리액션 데이터 없음(추정).

## 11. 개별 포스팅 상태가 서로 다를 때 모달 (Posted, Draft, Scheduled)

9개 화면. 상태별로 수정 모달의 편집 가능 범위가 다르다는 것을 보여주는 핵심 비교 섹션.

| 상태          | 필드 편집 가능 여부              | 하단 버튼                                         |
| ------------- | -------------------------------- | ------------------------------------------------- |
| **Posted**    | 전부 회색/비활성 — **읽기 전용** | "Save Changes" 1개, 비활성                        |
| **Scheduled** | 전부 정상 편집 가능              | "Save Changes" 1개, 활성                          |
| **Draft**     | 전부 정상 편집 가능              | "Save Changes" + "Schedule Draft" 2개, 둘 다 활성 |

- 이미 발행된(Posted) 포스트는 내용을 바꿀 수 없는 열람 전용 모달로 바뀐다(Where to post?/Date·Time/콘텐츠 타입/AI 재작성 입력창 전부 비활성).
- Scheduled는 예약된 내용을 수정할 수 있지만, 이미 예약 확정된 상태라 "Schedule Draft" 버튼은 없다(= 재확정 액션이 불필요).
- Draft만 "Schedule Draft"라는 별도 확정 액션이 필요하다(아직 예약되지 않았으므로).

> 1~2/4~5/7~8 화면은 각 상태의 슬롯을 선택하는 중간 단계, 3/6/9 화면이 각각 Posted/Scheduled/Draft 모달의 실제 비교 대상.

## 12. 아카이브에서 포스팅 복원

3개 화면. GNB의 trash/archive 아이콘(Analysis/Content 탭 옆에 위치)으로 진입하는 삭제된 포스팅 보관함.

1. **아카이브 화면** — 좌측에 "Deleted at [시간]" 형식의 삭제 항목 리스트(이 예시 6개), 우측에 해당 카드들이 "Deleted" 배지 + 하단 **Restore** 버튼과 함께 노출.
2. **항목 선택** — 리스트에서 특정 "Deleted at" 항목 선택 시 해당 카드에도 테두리 강조가 동기화.
3. **복원 확인 다이얼로그** — Restore 클릭 시 뜨는 다이얼로그. 타이틀은 "My goal"로 표시되지만 재사용 컴포넌트의 스테일 기본값일 뿐 실제 내용과 무관(GB_Self.md에서도 동일 현상 기록됨). 안내 문구 "Move this back to your schedule. It will be visible again and ready to use." + Cancel/Confirm으로 실제는 복원 확인임을 확인.

## 13. 아카이브에서 포스팅 삭제

3개 화면. 아카이브 카드 자체의 "x" 아이콘으로 영구 삭제.

1. **기준 상태** — 12부와 동일한 아카이브 화면, 각 카드 우상단에 "x"(영구 삭제) 아이콘.
2. **삭제 아이콘 hover** — 특정 카드의 "x" 아이콘 선택 상태.
3. **영구 삭제 확인** — "⚠ Are you sure you want to delete this?" + "This will not be saved and take effect immediately." + Cancel/Confirm. GB_Self.md의 영구 삭제 다이얼로그와 동일한 문구/구조 — 12부(Restore, 복구 가능)와 달리 되돌릴 수 없는 삭제임을 명시적으로 경고.

## 14. Analysis에서 분석 상세보기

3개 화면. Analysis 탭 요약 카드가 상세 보기로 단계적으로 확장.

1. **기본 대시보드** — 프로필+Top Performers / **Reach**(총 도달률, 참여율·신규팔로워·공유, Top Channel 드롭다운, Funnel Analysis 버튼) / Posts This Month(채널별 개수, Weekly Goal Progress) / **How people see you**(Perception Alignment %, 특성별 Matched/Weak signal/Not detected) / **What people say**(댓글 기반 인지 특성 해시태그 + 반응 유형 비율) / **Action Items**(4개, 각 Create a post) / Why don't you try this?(추천 카드).
2. **채널 선택 시 확장** — Top Channel을 "LinkedIn"으로 선택하면 Reach 카드가 전체 합계에서 해당 채널 전용 수치로 전환되고, 동시에 "Posts This Month"가 **달력 뷰**(Published/Reserved/Draft 점 표시)로 확장되며 Weekly Goal Progress/Posting Frequency/Tone consistency 3개 지표가 추가 노출.
3. **Funnel Analysis 상세** — Reach 카드 전체가 **"Growth funnel on [Social Media ▾]"** 테이블로 교체 — Reach/Engagement/New Followers/Conversion 4개 지표를 플랫폼별(Pinterest/YouTube/Instagram/Facebook/LinkedIn/TikTok/Thread 등)로 동시 비교.

> **확정(2026-10-02, 사용자 확인)**: Reach/Engagement/Top Performer는 Compass Analysis와 **동일 데이터를 공유**함(Top Performer는 Compass의 Ranking에 대응 — GB_Compass.md 415행, Compass는 별도 카드 없이 좌측 원형 시각화가 Ranking 비교 역할을 대신). 나머지(Posts This Month, How people see you/Perception Alignment, What people say, Funnel Analysis의 New Followers/Conversion 등)는 **Content Studio 전용 지표**로 Compass와 무관하게 Content Studio에서만 계산됨.

## 15. GNB 오픈

2개 화면.

1. **기본 상태** — GNB 닫힘, 9개 포스트 카드 + 스케줄 리스트 전부 Draft.
2. **GNB 사이드 패널** — 좌상단 아이콘 클릭 시 열리는 패널. "GABRIELLE" 로고 + Notification/Settings + 네비게이션(Dashboard/Self/Compass/**Contents Studio**(현재 활성)/Know Thyself).

> GB_Self.md 7.2부에서 확인된 GNB와 동일한 구조/항목이 Content Studio에서도 그대로 재사용됨 — 공용 전역 네비게이션 컴포넌트.

## 16. 남은 확인 필요 사항 (Open Items)

- 1부: ~~Create posts, Auto-generate 버튼에 실제 프로토타입 리액션이 연결되어 있는지~~ → **확정(2026-10-02)**: Figma 리액션 확인 결과 Create posts/Auto-generate 버튼 모두 리액션 0건 — 화면 배치 순서로 추정했던 것이 맞으며, 실제 연결된 네비게이션은 없음.
- 1부: ~~Cancel(프로세싱 모달) 클릭 시 어떤 화면으로 돌아가는지~~ → **확정(2026-10-02)**: Cancel 버튼도 리액션 0건 — Figma상 연결된 동작 없음. 코드 구현 시 생성 중단 로직은 디자이너 의도(진행 중단 후 직전 화면 복귀)를 따로 확인해 구현 필요.
- 2부: ~~"Apply Changes"(좌측 편집 패널)와 "Save Changes"(우측 미리보기 패널) 두 저장 버튼의 역할 차이~~ → **확정(2026-10-02, 사용자 확인)**: Apply Changes = AI 재작성 지시를 적용(재생성), Save Changes = 현재 편집 내용을 단순 저장.
- 2부: ~~멀티 계정(LinkedIn+X) 동시 예약 시 플랫폼별 커스터마이징 가능 여부~~ → **확정(2026-10-02, 사용자 확인)**: 계정을 추가하면 하나의 콘텐츠가 모든 계정에 동일하게 복제됨. 플랫폼별로 다른 것은 미리보기 상의 계정 아이덴티티(프로필명 등)뿐, 캡션/본문은 플랫폼별 개별 수정 불가.
- 14부: ~~Content Studio Analysis와 Compass Analysis가 같은 데이터를 공유하는지~~ → **확정(2026-10-02)**: Reach/Engagement/Top Performer(=Compass Ranking)는 공유 데이터, 나머지(Posts This Month/Perception Alignment/What people say/Funnel의 New Followers·Conversion 등)는 Content Studio 전용 지표. 구현 시 공유 3종은 Dashboard·Compass와 동일 API/데이터 소스 사용([[project_dashboard_compass_metric_data_shared]] 참고), 전용 지표는 Content Studio 쪽에서 별도 계산.
