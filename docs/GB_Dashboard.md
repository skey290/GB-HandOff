# Gabrielle Dashboard — 화면/플로우 종합본

> 이 문서는 GB_Compass.md(지표 설계 스펙)와 달리 별도의 원본 스펙 문서가 없어, Figma 파일(GB_Dashboard)의 화면/플로우를 역으로 분석해 정리한 문서다. GB_Self.md/GB_Content_Studio.md/GB_Know_Thyself.md와 동일한 방식으로 작성한다.
> 용어 원칙: "persona" 사용 금지, "self"(내부) / "identity"(사용자 대상 카피)만 사용 (GB_all.md 4절).

## 0. 모듈 정의

- GB_all.md에는 "Dashboard"라는 별도 모듈이 명시적으로 정의되어 있지 않다 — GNB 네비게이션 항목으로만 등장(Dashboard/Self/Compass/Contents Studio/Know Thyself 5개 중 하나).
- 화면 구성상 Dashboard는 **홈(진입) 화면**으로, 사용자의 여러 Self를 한눈에 보여주는 원형(8슬롯) 시각화가 핵심이다. GB_all.md 5.3절 Compass Home이 설명한 "파티클이 뭉쳐 하나의 구체(sphere)를 이루는 브랜드 시그니처 모먼트"와 유사한 성격의 시각화가 Compass가 아닌 **Dashboard(홈)**에 구현되어 있다 — Compass Home과 Dashboard가 동일한 시각화 컨셉을 공유하거나 역할이 재배치된 것으로 추정(5부 Open Items 참고, 번호는 추후 확정).
- 핵심 UI: 중앙에 8개 슬롯("Part/self" 컴포넌트)이 방사형으로 배치된 원형 차트. 각 슬롯은 사용자가 만든 Self를 표현하며, 아직 만들지 않은 슬롯은 "No Self" 점선 placeholder로 표시된다. 호버하는 대상(Self 아바타/성장 아크/빈 슬롯/빈 링 영역)에 따라 중앙 텍스트와 배지 내용이 동적으로 바뀐다.
- GNB: 좌측에 홈/Self/Compass/Content Studio/Know Thyself 5개 모듈 아이콘이 상시 노출되는 축약형 사이드바 + 상단 "Floating pill"(홈 아이콘 + Self/Compass/Content Studio 바로가기) + 우상단 "Floating profile" 아바타, 이렇게 3종의 내비게이션이 동시에 존재.

## 1. 대시보드 호버할 때 — 포스팅 분석없음

5개 화면. "Data Scientist" Self 1개만 생성되어 있고 포스팅 분석에 필요한 데이터가 아직 없는 상태에서, 차트의 각기 다른 영역에 호버했을 때의 반응을 보여준다.

1. **Self 아바타 호버** — 8슬롯 중 1개("Data Scientist")만 채워짐, 나머지 7개는 점선 "No Self". 아바타에 호버하면 위에 "Data Scientist" 배지, 중앙 텍스트 "Hover to see analysis"(레이어명 "Reach" — Compass Analysis의 Reach 지표 레이어 재사용 흔적).
2. **성장 아크 호버** — 같은 Self에 연결된 호(arc)에 호버하면 배지가 "80%"로, 중앙 텍스트가 "Growth Potential"로 전환.
3. **빈 링 영역 호버** — 특정 슬롯이 아닌 차트 배경(링)에 호버하면 바깥 2개 링이 흰색으로 하이라이트, 중앙 텍스트 "Create Posts to analyze".
4. **빈 링 영역 호버(배지 추가)** — ③과 거의 동일하나 중앙 텍스트 아래 별도 "Not Enough Data Yet" 배지가 추가로 노출.
5. **빈 슬롯("No Self") 호버** — 특정 빈 슬롯에 직접 호버하면 해당 슬롯 테두리가 흰색으로 하이라이트, 중앙 텍스트 "Create a Self".

> 호버 대상별 반응 정리: **채워진 Self 아바타** → Self 이름 / **Self의 성장 아크** → 성장률(%) / **빈 슬롯** → "Create a Self"(새 Self 생성 유도) / **빈 링 영역(비특정)** → "Create Posts to analyze"+"Not Enough Data Yet"(포스팅 생성 유도). 이 섹션은 Self는 있지만 포스팅 분석 데이터가 없는 상태를 다룬다(2부는 분석 데이터가 있는 상태).

## 2. 대시보드 호버할 때 — 포스팅 분석있음

5개 화면. 1부와 같은 "Data Scientist" 1개 Self 구성이지만, 포스팅 분석 데이터가 쌓여 성장 아크가 실제 지표를 담은 3중 밴드로 표현된다.

1. **Self 아바타 호버** — 1부와 동일(배지 "Data Scientist", 중앙 "Hover to see analysis")이나, 아크가 더 선명하고 두꺼운 3중 동심 밴드로 표현됨.
2. **아크 바깥쪽 밴드 호버** — 배지 "80%", 중앙 "Growth Potential".
3. **아크 중간 밴드 호버** — 배지 "8,340"(절대 수치), 중앙 "Qualified Reach".
4. **아크 안쪽 밴드 호버** — 배지 "14.5%", 중앙 "Engagement Intensity".
5. **빈 슬롯 호버** — 1부와 동일, 중앙 "Create a Self".

> **중요 발견**: 성장 아크가 Growth Potential(%)/Qualified Reach(절대수치)/Engagement Intensity(%) 3개 밴드로 구성되어 있다 — GB_all.md 5.3절 **Compass Analysis**가 정의한 reach·engagement·growth potential 3대 지표와 명칭·구성이 거의 동일하다. Dashboard 홈 화면의 원형 시각화가 Compass Analysis 데이터를 그대로 가져와 보여주는 것으로 보이며, 이는 Compass Analysis와 Dashboard 간 데이터 중복/공유 가능성을 시사한다(5부 Open Items 참고).

## 3. 대시보드 호버할 때 — 포스팅 분석있음, 셀프 8개

5개 화면. 8개 슬롯이 전부 Self로 채워진("Data Scientist/Vegan Chef/Team Leader/Yoga Meditator/Fashion Editor/Novelist/Fashionista/Entrepreneur") 완성 상태.

1. **기본 상태** — 8개 Self 이름 배지가 전부 동시에 노출(1~2부는 호버 중인 Self 하나만 표시). 중앙 텍스트 기본값 "Hover to see analysis".
2. **Growth Potential 밴드 호버** — 8개 Self 전원의 % 값이 각자 위치에 동시 노출(50/80/50/10/20/80/70/40%).
3. **Qualified Reach 밴드 호버** — 8개 Self 전원의 절대 수치 동시 노출(5,431/8,340/4,008/6,453/125/6,762/976/4,784).
4. **Engagement Intensity 밴드 호버** — 8개 Self 전원의 % 값 동시 노출(1.8/14.5/0.5/1.8/3.7/0.3/2.0/0.4%).
5. **Self 아바타 직접 호버** — "Data Scientist" 아바타가 컬러풀한 그라데이션으로 하이라이트되고, 중앙 텍스트가 "Go to Content Studio"라는 실행형 CTA로 전환.

> **중요 발견 1**: Self가 여러 개일 때는 각 지표 밴드 호버 시 전체 Self를 가로지르는 비교 뷰(스파이더차트형)로 작동한다 — Self가 1개일 때(1~2부)는 그 Self 하나의 값만 뜨지만, 8개일 때는 8개 Self의 같은 지표를 한 번에 비교해서 보여준다.
> **중요 발견 2**: Self 아바타에 직접 호버했을 때의 중앙 텍스트가 1~2부의 "Hover to see analysis"가 아니라 **"Go to Content Studio"**로 바뀐다 — 데이터가 충분한 완성 상태의 Self는 호버가 분석 안내가 아니라 바로 콘텐츠 제작으로 연결되는 실행 버튼 역할을 하는 것으로 추정. **확정(2026-10-02)**: Figma 리액션 확인 결과 실제 연결된 네비게이션은 없음(5부 Open Items 참고) — 현재는 시각적 CTA일 뿐 클릭해도 이동하지 않음.

## 4. GNB 오픈하고 플로팅 필 누를 때

2개 화면.

1. **기본 상태** — 3부 ①과 동일한 8개 Self 완성 대시보드.
2. **GNB + Floating profile 동시 오픈** — 좌상단 GNB와 우상단 Floating profile("필") 버튼을 함께 연 상태. GNB: "GABRIELLE" 로고 + Notification/Settings + 네비게이션(**Dashboard**(활성)/Self/Compass/Contents Studio/Know Thyself). Floating profile: "Data Scientist" 이름 탭 + 폴라로이드 브랜드 이미지 + 태그라인 + 바이오 + 하단 **Edit Assets / Edit Goal / Create a post** 3버튼.

> GNB는 GB_Self.md 7.2부·GB_Content_Studio.md 15부·GB_Know_Thyself.md 7부와 동일 구조, Floating profile은 GB_Know_Thyself.md 8부와 완전히 동일한 구조 — 둘 다 전 모듈에서 재사용되는 공용 컴포넌트임을 Dashboard에서도 재확인. 두 패널이 서로 다른 트리거(좌상단 메뉴 버튼 vs 우상단 아바타)로 열리며 동시에 띄울 수 있다는 것도 확인됨.

## 5. 남은 확인 필요 사항 (Open Items)

- 0부: ~~Dashboard 홈의 원형 시각화와 GB_all.md 5.3절 Compass Home의 "파티클/구체 시각화"가 같은 기능의 두 가지 표현인지~~ → **확정(2026-10-02, 사용자 확인)**: 서로 다른 화면/기능. Compass Home의 파티클-구체는 **유저가 입력한 정보(키워드)를 추출해 보여주는 것이 중심**(활동량이 아니라 "입력된 정보의 키워드량" 시각화, GB_Compass.md 394행 참고) — Dashboard 홈의 8슬롯 원형 차트는 **Self별 Growth Potential/Qualified Reach/Engagement Intensity 분석 지표**를 보여주는 것으로 목적과 데이터 소스가 다름. GB_all.md 5.3절(214행)이 "Compass Home"을 모호하게 인용한 것은 단순 문서 통합 누락이었을 뿐, 실제로는 Dashboard와 기능 중복이 아니었음.
- 2부: ~~Dashboard의 성장 아크 3개 밴드가 Compass Analysis와 동일한 데이터를 공유하는지~~ → **확정(2026-10-02, 사용자 확인)**: 동일한 데이터임. Growth Potential/Qualified Reach/Engagement Intensity(Dashboard) = Growth Potential/Reach/Engagement(Compass Analysis), 같은 지표를 **표현 방식만 다르게** 보여주는 것 — Dashboard는 8개 Self를 가로지르는 통합 비교 뷰(원형 차트 한 번에), Compass Analysis는 Self 1개 기준으로 세 지표를 각각 분리된 카드로 보여줌. 데이터 레이어는 공유, UI 레이어만 모듈별로 다르게 구성된 것으로 결론. GB_Content_Studio.md 14부에 플래그된 유사 중복도 추가로 확인 완료(2026-10-02) — Reach/Engagement/Top Performer(=Ranking)는 동일하게 공유 데이터, 나머지는 Content Studio 전용 지표([[project_dashboard_compass_metric_data_shared]] 참고).
- 3부: ~~완성 상태의 Self 아바타 호버 시 뜨는 "Go to Content Studio" CTA가 실제로 클릭 가능한 링크인지~~ → **확정(2026-10-02)**: Figma 리액션 데이터 확인 결과, "대시보드 호버할때-포스팅 분석있음, 셀프 8개" 화면의 `Self curation` 인스턴스 하위 8개 `Part/self` 슬롯 전부에 `ON_CLICK` 트리거는 걸려있으나 `action`이 `null`/`actions`가 빈 배열 — **실제 연결된 네비게이션 없음**. 즉 "Go to Content Studio"는 현재 프로토타입 기준 시각적 CTA일 뿐 클릭해도 이동하지 않는 미완성 상태. 코드 구현 시 디자이너에게 실제 이동 대상(어느 Self의 Content Studio 화면인지) 확인 필요.
