# Gabrielle Know Thyself — 화면/플로우 종합본

> 이 문서는 GB_Compass.md(지표 설계 스펙)와 달리 별도의 원본 스펙 문서가 없어, Figma 파일(GB_Know-thyself)의 화면/플로우를 역으로 분석해 정리한 문서다. GB_Self.md/GB_Content_Studio.md와 동일한 방식으로 작성한다.
> 용어 원칙: "persona" 사용 금지, "self"(내부) / "identity"(사용자 대상 카피)만 사용 (GB_all.md 4절).

## 0. 모듈 정의 (GB_all.md 5.4절 기준)

- 핵심 원칙: **"한 번의 성찰, 세 부분으로 분할"** — 사용자는 질문에 정확히 한 번만 답하고, 그 답이 3개 섹션(Foundations)으로 구조화된다. 나머지는 전부 그 3개 답변에서 자동 생성된다.
- **Foundations (사용자가 직접 답하는 3개)**
  - **Inner Self** — 실제 성격(지향 아닌, 인식에 좌우되지 않는 것). TIPI 10문항, 1~7 척도.
  - **Outer Self** — 의도한 브랜드 이미지/포지셔닝(성격 아님). 포지셔닝 축 기반 paired-trait 8문항, 1~7 척도.
  - **My Story So Far** — 사실 기반 경력/경험 + 성격유형(MBTI 등) + 관심사. 이력서/포트폴리오 업로드 + 성격유형 선택 + 관심사 응답/업로드 → AI가 사실만 요약(해석 금지).
- **Your Brand (자동 생성되는 3개)**
  - **Core Objective** — Inner+Outer+My Story 전부를 소스로 함.
  - **Tone of Voice** — Inner+Outer만 소스(My Story는 톤에 영향 없음).
  - **Self-Gap** — Outer Self와는 별개의 자체 설문. 내 쪽은 8문항에 직접 응답(새 설문), 상대 쪽은 친구가 같은 설문의 3자 응답자용 변형판에 응답. Outer Self는 "내가 어떤 이미지로 보이고 싶은가"(의도)를 측정하고, Self-Gap은 "내가 생각하는 나 vs 남이 실제로 보는 나"의 격차를 측정 — 둘 다 본인이 응답하지만 묻는 내용과 목적이 다름.
- **Self-Gap 상세**: 친구 설문은 내가 응답한 것과 동일한 문항·축을 쓰되 문구/순서/포맷만 3자 응답자용으로 재설계. 개인 응답은 비공개, 최소 응답자 수(기본 3명) 충족 시에만 집계 공개. 결과는 (1) 기본 요약(매치율+일치 1개+격차 1개) (2) 상세(문항별 넘버라인 비교) 2단계.
- **모듈 성격**: 선택(optional) 모듈. 다른 모듈은 기본 정보만으로 작동하며, Know Thyself에 더 깊이 답할수록 다른 모듈 산출물이 정교해짐. 가치는 "더 나은 산출물"이 아니라 **자기 통찰 그 자체**.

## 1. Know Thyself 처음 들어왔을 경우 — my story 작성

5개 화면. 아직 My Story를 쓰지 않은 사용자가 넛지를 거쳐 My Story를 완성하는 플로우.

1. **진입 초기 상태 + 넛지 모달** — 배경 대시보드엔 **Goal as(Data Scientist)** 카드만 이미 완료(녹색 체크), My Story/Self-Gap/Inner Self/Outer Self는 전부 빨간 "Not started". 중앙에 "Let's make your brand sharper" 모달 — "Just a few things about you — it'll only take a sec." + "Do not ask again" 체크박스 + **Share Your Story** 버튼.
2. **Tell My Story 모달(빈 상태)** — 4개 입력 그룹: "What's my personality type?"(file upload + MBTI/Enneagram 드롭다운) / "Could you share your work story?"(file upload + URL) / "What are you into?"(자유 텍스트, 1000자 제한) / "Upload your interest"(file upload + URL). 하단 Save + **My Basics** 링크.
3. **Tell My Story 모달(입력 완료)** — File.pdf 업로드 2건, MBTI "ISTJ" 선택, "What are you into?" 텍스트 입력 완료 — 저장 직전.
4. **My Basics 서브모달** — "What should we call you?"(이름), Profile image(브랜드 키트 생성용 안내문 포함), "What do you do?", 생년월일+출생시간, 연락처, "Where do you want to post?"(채널) + Save.
5. **저장 완료 최종 대시보드** — My Story가 "Completed" 배지 + 경력 요약 문단 + 태그 배지(7 years/Enterprise sales/Growth-stage)로 채워짐.

> **중요 발견**: 상단 "Goal as [Data Scientist]" 카드가 포지셔닝("Finance-Fluent Modeling Partner")·타깃("early-stage SaaS founders")·빈도("3 times a week")·수치("~1,000 targeted followers")·측정주기("monthly reach")를 전부 포함한 문장형 콘텐츠로, GB_all.md 6.1절 **Core Objective 3요소**와 거의 동일하다. GB_all.md 5.4절의 3개 Foundation(Inner/Outer/My Story)에는 이런 "Goal" 카드가 명시되어 있지 않다 — Figma에만 존재하는 별도 입력 카드로, Core Objective를 구성하는 네 번째 입력 소스로 보인다(9부 Open Items 참고). 하단 Core Objective/Tone of Voice 카드는 "Fill in more sections, and this gets more refined." 안내만 있는 미생성 상태 — Inner/Outer Self가 채워져야 자동 생성될 것으로 추정.
> **용어 메모**: Tell My Story 모달이 MBTI(성격유형)와 "What are you into?"(관심사)까지 함께 수집하는 것은 GB_all.md의 "My Story So Far" 정의 범위다(2026-10-01 화면 기준으로 정의 확장 반영 완료).

## 2. Know Thyself 처음 들어왔을 경우 — my story 미작성

2개 화면. 1부와 같은 진입점에서 시작하지만, 넛지 모달을 닫고 My Story 작성을 건너뛰는 경로.

1. **진입 + 넛지 모달** — 1부 ①과 동일 화면.
2. **건너뛴 뒤 상태** — 모달을 닫으면(X 또는 "Do not ask again") My Story 카드가 여전히 빨간 "Not started"로 남고 "Share Your Story" 버튼도 그대로 노출.

> Goal as 카드는 이 경로와 무관하게 이미 완료 상태(녹색 체크)로 유지된다 — **My Story 작성 여부와 Goal 완료 여부는 서로 독립적**인 것으로 보인다.

## 3. Self-gap 진행

13개 화면. Self-Gap 카드의 "Start Test"부터 친구 초대, 결과 확인까지 전체 플로우.

1. **베이스라인** — My Story Completed, Self-Gap/Inner Self/Outer Self 전부 Not started.
2. **Self-Gap 인트로 모달** — "Do people really see you the way you think?" + "Answer a few quick questions about yourself, then send the same ones to people who know you. See where you match — and where you don't." + Start Test.
   3~10. **8문항 설문(1~5 척도)** — Q1 "When something goes wrong, I stay calm and steady" / Q2 "I'm the one who makes the room laugh" / Q3 "If I say I'll do it, it gets done" / Q4 "People find it easy to open up to me" / Q5 "I take bigger risks than most people around me" / Q6 "I know what I want out of life" / Q7 "I act like a different person depending on who I'm with" / Q8 "The first impression I give matches who I really am".
3. **완료 + 친구 초대 모달** — 녹색 체크 + "Invite your friends to see 'Self-Gap' result." + 콤마 구분 이메일 입력(Invite) 또는 Copy link + "They'll answer about you. You'll see where you match — and where you don't."
4. **Survey open 상태 대시보드** — Self-Gap 배지가 "Survey open"으로, 진행률 바 + "3/5 Responded". 1단계 요약이 "You are [Funnier] [more open] [more of a risk-taker] than what you think yourself." 배지 문장으로 노출. 하단 버튼 Invite friends / View result.
5. **상세 Result 모달** — "Respondents 3/5 Responded" + Friends(빨강)/Me(파랑) 범례 + 8문항 전체 넘버라인(1~5) 비교. 하단 Start Test / Edit Answer.

> GB_all.md 5.4절 매칭: ②~⑩(인트로+8문항)은 "내 쪽" 응답, ⑪~⑬은 "친구 초대→집계→상세 비교" 단계로 **(1) 기본 요약 (2) 상세 넘버라인 비교**라는 2단계 결과 구조와 정확히 일치한다. 단, 1단계 요약(⑫)에 매치율(%)이나 "일치 포인트"가 보이지 않고 격차 포인트 3개만 배지로 나열되는 점은 스펙과 다르다 — **[디자인 수정 필요] 2026-10-01 결정: 스펙(매치율+일치 포인트 1개+격차 포인트 1개)이 맞는 기준이며, 추후 Figma 디자인에 반영 필요(9부 Open Items 참고).** 척도가 1~7이 아니라 1~5로 보이는 점은 현재 상태 유지로 결정됨(3부 Open Items 참고).
> Outer Self가 여전히 "Not started"인 상태에서도 Self-Gap의 8문항을 바로 진행할 수 있다 — Self-Gap은 Outer Self와 무관한 자체 설문이므로(Outer Self는 "의도한 이미지", Self-Gap은 "인식 격차"를 측정) 선후 관계 없이 독립적으로 진행 가능한 것이 정상 동작이다(2026-10-01 확인, GB_all.md 반영 완료).

## 4. Inner Self 진행

13개 화면. "Start Test"부터 TIPI 10문항 응답, 결과 확인까지.

1. **베이스라인** — Self-Gap은 3부 결과까지 완료, Inner Self/Outer Self 전부 Not started.
2. **Inner Self 인트로 모달** — "Let's find the real you" + "A few honest questions about who you are" + "The more honest you are, the more accurate your foundation becomes." + Start Test.
   3~12. **TIPI 10문항(1~7 척도)** — "10 Item Personality Test (TIPI)" 타이틀 고정. Q1 "extraverted, enthusiastic" / Q2 "critical, quarrelsome" / Q3 "dependable, self-disciplined" / Q4 "anxious, easily upset" / Q5 "open to new experiences, complex" / Q6 "reserved, quiet" / Q7 "sympathetic, warm" / Q8 "disorganized, careless" / Q9 "calm, emotionally stable" / Q10 "conventional, uncreative" — 전부 "I see myself as [특성1], [특성2]" 포맷.
3. **완료 결과** — Inner Self 카드 "Completed" 배지 + "Grounded and steady, even when no one's watching." 한 줄 요약 + 특성 배지 3개(Grounded/Honest/Steady). 하단 버튼 "Edit Answer".

> GB_all.md 5.4절이 정의한 **TIPI(Ten-Item Personality Inventory) 10문항, 1~7 척도**와 완벽히 일치하는 유일한 Foundation 카드다(3부 Self-Gap의 1~5 척도와 대비). 결과 표시는 Self-Gap과 동일하게 "서술형 한 줄 + 특성 배지" 포맷을 공유한다 — Know Thyself 전체에서 결과 요약 UI 패턴이 통일되어 있는 것으로 보인다.

## 5. Outer Self 진행

11개 화면. "Start Test"부터 paired-trait 8문항 응답, 결과 확인 + **Core Objective/Tone of Voice 자동 생성**까지.

1. **베이스라인** — My Story/Self-Gap/Inner Self 완료, Outer Self만 Not started.
2. **Outer Self 인트로 모달** — "Let's shape how you're seen" + "A few quick choices about the image you want to lead with." + "The clearer your choices, the sharper your brand becomes." + Start Test.
   3~10. **paired-trait 8문항(1~5 척도)** — 타이틀 "Outer-Self". Q1 "approachable, not authoritative" / Q2 "bold, not minimal" / Q3 "playful, not serious" / Q4 "an expert, not a peer" / Q5 "innovative, not traditional" / Q6 "high-energy, not calm" / Q7 "polished, not raw/authentic" / Q8 "niche, not broadly relatable" — 전부 "I want to be seen as [축 A], not [축 B]" 포맷.
3. **완료 + Core Objective/Tone of Voice 동시 생성** — Outer Self 카드 "Completed" + "Approachable over impressive, calm over high-energy." + 배지(Approachable/Calm/Consistent). 동시에 하단 **Core Objective**("To be remembered as someone who delivers trusted insight, built on real experience." + 배지 Finance-credible modeling/Trusted advisor)와 **Tone of Voice**("Warm yet logical, a voice that simplifies complexity and earns trust." + 배지 Grounded/Calm/Precise)가 녹색 체크로 바뀌며 자동 생성.

> **핵심 발견**: 이 섹션 마지막 화면에서 GB_all.md 5.4절의 "Your Brand(자동 생성 3개)" 로직이 실제로 작동하는 것을 확인했다. Outer Self까지 전부 채워지는 순간 Core Objective와 Tone of Voice가 동시에 생성되며, Tone of Voice의 배지("Grounded"/"Calm")가 각각 Inner Self 결과 배지("Grounded")와 Outer Self 결과 배지("Calm")를 그대로 재사용하는 것이 화면상 확인된다 — "Tone of Voice는 Inner+Outer만 소스로 한다"는 스펙과 정확히 일치.
> 문항 포맷(paired-trait, "포지셔닝 축 기반")은 GB_all.md 스펙과 일치하지만, 척도는 1~5로 스펙(1~7)과 다르다(3부 Self-Gap과 동일한 1~5 척도 — TIPI/Inner Self만 1~7을 쓰는 것으로 보인다. 2026-10-01 결정: 현재 상태 유지, 9부 Open Items 참고). 이 8문항이 3부 Self-Gap의 문항과 전혀 다른 질문 세트인 것은 의도된 설계다 — Self-Gap은 Outer Self 답변을 재사용하지 않는 별개의 자체 설문(2026-10-01 확인, GB_all.md 반영 완료).

## 6. Goal 수정

2개 화면. "Goal as [Self]" 카드의 "Edit Goal" 버튼으로 여는 수정 모달.

1. **베이스라인** — 모든 Foundation + Core Objective/Tone of Voice까지 전부 완료된 최종 상태.
2. **Edit goal 모달** — 상단 자연어 문장(Core Objective 문구) + 핵심 값 인라인 배지(삭제 가능) + 하단 구조화된 폼: Brand Position/Target(텍스트 입력), Posting Frequency(Daily/Weekly/Monthly 탭 + 빈도 스테퍼), Targeted Followers(1K~1M+ 슬라이더), Tracking Frequency(Weekly/Monthly/Quarterly 탭) + Save.

> **중요**: 이 "Edit goal" 모달은 GB_Content_Studio.md 9부의 Content Studio "My goal" 편집 모달과 **완전히 동일한 UI 구조**다 — 두 모듈이 같은 모달 컴포넌트를 공유한다. GB_all.md 5.4절 3개 Foundation에는 없는 별도 "Goal" 입력이 Core Objective 생성에 함께 쓰이는 것으로 보인다(9부 Open Items 참고).

## 7. GNB 오픈

2개 화면.

1. **기본 상태** — GNB 닫힘, 모든 Foundation/Core Objective/Tone of Voice 완료된 최종 대시보드.
2. **GNB 사이드 패널** — 좌상단 아이콘 클릭 시 열리는 패널. "GABRIELLE" 로고 + Notification/Settings + 네비게이션(Dashboard/Self/Compass/Contents Studio/**Know Thyself**(현재 활성)).

> GB_Self.md 7.2부·GB_Content_Studio.md 15부에서 확인된 GNB와 완전히 동일한 구조/항목이 Know Thyself에서도 그대로 재사용됨 — 공용 전역 네비게이션 컴포넌트.

## 8. Floating profile 오픈

2개 화면.

1. **기본 상태** — 패널 닫힘, 모든 Foundation/Core Objective/Tone of Voice 완료된 최종 대시보드.
2. **Floating profile 패널** — 우상단 아바타 아이콘 클릭 시 열리는 우측 패널. 현재 Self("Data Scientist") 이름 탭 + 폴라로이드 스타일 브랜드 이미지(타임스탬프 포함) + 태그라인 + 전체 바이오 문단. 하단 **Edit Assets / Edit Goal / Create a post** 3개 버튼.

> 이 패널 하나에서 Self 모듈(Edit Assets) · Know Thyself(Edit Goal) · Content Studio(Create a post)로 바로 진입할 수 있다 — 현재 Self를 기준으로 4대 모듈을 가로질러 연결하는 크로스 모듈 허브 패널로 추정. GNB(7부)가 모듈 간 "화면 전환"이라면, Floating profile은 "현재 Self에 대한 빠른 액션 실행" 역할로 구분된다.

## 9. 남은 확인 필요 사항 (Open Items)

- 1부·6부: "Goal as [Self]" 카드가 GB_all.md 5.4절의 3개 Foundation(Inner/Outer/My Story)에는 없는 별도 입력 카드로 존재함 — Core Objective를 구성하는 네 번째 소스로 보임. **확정(2026-10-02, 사용자 확인)**: Know Thyself의 "Edit Goal"과 Content Studio 9부의 "My goal" 편집은 **동일한 Goal 데이터를 공유**함(어느 한쪽에서 수정하면 다른 쪽에도 반영) — UI가 완전히 같은 것도 단순 컴포넌트 재사용이 아니라 실제로 같은 데이터를 바라보기 때문. GB_all.md에 "Goal"을 Core Objective의 네 번째 입력 소스로 반영 필요(문서 보강 작업).
- 3부·5부: Self-Gap·Outer Self 8문항의 척도가 둘 다 1~5로 보이는데, GB_all.md는 Outer Self를 1~7로 명시함(Inner Self 10문항만 스펙대로 1~7). **2026-10-01 결정: 현재 상태 유지(수정 보류)** — Self-Gap 내부(나 vs 친구)·Outer Self 단독 사용 모두 척도가 섞여도 UI/로직상 문제는 없음. 단, 백엔드에서 Core Objective/Tone of Voice 산출 시 모든 Self 설문이 동일 범위라고 가정하고 점수를 정규화한다면 Outer Self의 1~5 값이 왜곡될 수 있음 — 실제 문제가 발생하면 그때 재검토.
- [디자인 수정 필요] 3부: Self-Gap 결과 1단계 요약 화면(12번 화면, 노드 8082:12350)에 GB_all.md 스펙대로 매치율(%) 배지와 일치 포인트 1개를 추가하고, 격차 포인트는 현재 3개에서 1개로 축소해야 함(2026-10-01 결정, 스펙 기준 확정·Figma 반영은 추후).
