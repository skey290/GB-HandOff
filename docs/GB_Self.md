# Gabrielle Self — 화면/플로우 종합본

> 이 문서는 Compass(`GB_Compass.md`)와 달리 처음부터 주어진 스펙 문서가 없었다. GB_Self Figma 페이지(`❄️ GB_Self`, fileKey `Wp6AZNGqC4qf2Sz5zQ2PzQ`, 과거 "Assets"에서 개명됨)의 11개 섹션을 직접 분석·어노테이션하면서 역으로 정리한 **구현 현황 기준 스펙**이다. 숫자/카피는 목업 값이며, 핵심은 화면 간 전환 로직과 상태 분기가 실제로 어떻게 짜여 있는지다.
> 용어는 `GB_all.md` 4절 원칙을 따른다 — **persona는 쓰지 않고 self/identity만 사용**.

---

## 0. 모듈 정의 (GB_all.md 5.1절 기준)

- Self 모듈은 **identity(= self)를 생성하고, 그 이미지를 만들거나 변경**하는 역할을 한다.
- 여기서 만들어진 이미지는 단순 사진이 아니라 **브랜드 키트**로 기능한다.
- **Content Studio에서 생성된 이미지도 Self에 함께 모인다** — 브랜드 관련 이미지의 단일 관리 공간. (실제로 디테일뷰의 "Created in: Assets / Content Studio" 필터 칩으로 구현되어 있음 — 1부 참고)
- 핵심 가치: 사용자의 모든 면을 보여주는 게 아니라, 실제로 보여줄 가치가 있는 하나의 각도/이미지를 찾아주고 시작을 쉽게 만드는 것(blank page 없음).

---

## 1. 전체 레이아웃

Self Page는 좌→우 3단 구성이다.

| 영역                     | 내용                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GNB** (최좌측)         | 기본 48px 아이콘 레일, hover/클릭 시 250px로 확장되며 라벨 노출. 별도로 **Work History \| Archive 토글 필**이 GNB 바로 오른쪽에 항상 붙어 있다(GNB 확장 여부와 무관하게 유지되는 독립 요소). 자세한 내용은 7부.                                                                                                                        |
| **Canvas** (중앙)        | 현재 보고 있는 Self를 중심으로 한 방사형 다이어그램. 중앙에 Self 아바타 + 이름 라벨(chevron 포함, 클릭 시 컨텍스트 메뉴 — 5부), 주변에 다이아몬드 모양의 빈 "+" 슬롯들이 배치되어 신규 Self 생성 진입점이 된다(4부). 다이어그램 하단 라벨은 Self가 1개면 "self", 2개 이상이면 "**selves**"로 복수형 전환된다.                          |
| **Detail view** (최우측) | 현재 Self의 에셋 썸네일 그리드. 맨 상단에 **Self 전환 Tabs**가 있고(Self가 여러 개일 때 탭으로 전환 가능 — 아래 11부 참고), 그 아래 "Created in: Assets / Content Studio" 필터 칩이 있어 Self에서 만든 이미지와 Content Studio에서 만든 이미지를 전환해서 볼 수 있다(2부, 6부). 그리드 마지막 칸은 항상 "Create more asset" 추가 타일. |

우상단에는 모든 화면에 공통으로 **Floating profile** 아바타 아이콘이 떠 있으며, 클릭 시 현재 Self의 요약 카드 패널이 열린다(8부).

**캔버스 슬롯 최대치**: 중앙 Self + 주변 다이아몬드 슬롯 총 8개가 방사형으로 배치된다. 8개가 모두 채워지면 더 이상 빈 "+" 슬롯이 남지 않고, 중앙에는 특정 Self의 아바타 대신 **"selves you've created."** 텍스트 라벨만 남는다(1개일 때 아바타가 중앙을 차지하던 것과 대비).

### 1.1 Self 이미지 클릭 — 확대 미리보기

캔버스의 채워진 Self 카드(중앙·주변 다이아몬드 모두)를 클릭하면, 기존 선택 동작(그 Self를 중앙으로 전환)과 함께 캔버스 영역 안에 그 Self의 확대 미리보기가 뜬다.

- 미리보기는 Polaroid 스타일 카드로, hover하면 이미지가 블러 처리되며 "Update this image" 안내문 + **Edit Profile Portrait** 편집 CTA가 오버레이로 나타난다(6부 에셋 수정 진입점과 동일한 톤).
- 미리보기는 GNB 같은 좌측 고정 영역은 가리지 않고 캔버스 영역 안에서만 가운데 정렬된다 — 우측 Detail view는 계속 보인다.
- 카드 우측 변 바깥쪽에 닫기(X) 버튼이 있어, 클릭하면 미리보기만 닫히고 선택 상태는 유지된다.

---

## 2. 에셋 생성 (Create more asset)

디테일뷰의 "Create more asset" 타일 클릭 → 다음 순서로 진행된다.

1. (최초 1회) 온보딩 안내 영상 모달
2. **"Tell me about your asset idea"** 입력 챗박스 — 자료 첨부([+]) 버튼과 생성 실행(sparkle) 버튼이 함께 있다
3. **"Please Select 'Brand Image Style'"** 모달 — 4개 스타일 중 하나 선택
   - Deep Chroma
   - Artistic Duotone
   - Monochrome
   - Editorial
   - 각 옵션에 개별 Select 버튼이 있고, 선택 즉시 생성이 시작된다
4. **Processing** — Polaroid 프레임 안에 스피너가 표시되며 이미지 생성 중. 이 단계에서는 Cancel/Confirm 버튼이 **비활성화** 상태
5. **생성 완료, 확인 대기** — Cancel/Confirm이 **활성화**로 전환. Confirm 시 디테일뷰 에셋 그리드에 새 이미지가 추가되고, Cancel 시 생성을 취소한다

> Brand Image Style 4종 선택 모달은 3부(셀프생성), 아래 플로우 전체에서 공용으로 재사용되는 패턴이다.

---

## 3. 셀프 생성 (빈 슬롯 클릭)

캔버스의 빈 다이아몬드 "+" 슬롯 클릭 시 신규 Self 생성 플로우가 시작된다. 에셋 생성(2부)과 달리 **1차 러프 입력 → AI 자동 확장**의 2단계 구조를 가진다.

1. **"Create a 'Self'" 모달 (러프 입력)** — 단순한 "Your Goal" 텍스트 영역 + Save 버튼만 있는 1차 입력 모달. 사용자는 대략적인 목표만 적어도 된다.
2. **Save → Self 상세 브리프 (AI 자동 확장)** — 1차 입력을 바탕으로 AI가 구조화된 브리프 폼으로 자동 확장한다:
   - Your Goal
   - What do you do?
   - 스타일 포커스 / 차별점
   - Target Audience (칩 입력)
   - Target Platforms (칩 입력)
   - What They Need
   - Desired Outcome / Success Metric / Timeframe
   - 하단 Continue 버튼
3. **Continue → Brand Image Style 선택** — 2부와 동일한 4개 스타일 선택 모달
4. **Processing** — Polaroid + 스피너, Cancel/Confirm 비활성화
5. **생성 완료, 확인 대기** — Cancel/Confirm 활성화. Confirm 시 새 Self가 정식 생성된다

**생성 완료 후 변화**

- 새 Self 탭이 기존 Self 탭 옆에 추가된다
- 캔버스 중앙 라벨이 단수형 "self"에서 복수형 "**selves**"로 바뀐다
- 클릭했던 빈 슬롯이 새로 생성된 Self의 아바타 + 이름으로 채워진다

---

## 4. Self 컨텍스트 메뉴 (공용 진입점)

캔버스 중앙, Self 이름 라벨 옆의 **chevron(˅)** 을 클릭하면 드롭다운 메뉴가 열린다. 이 메뉴는 아래 4개 섹션(5~8부에서 각각 상세 설명)의 공통 진입점이며, 메뉴 로컬 노드 ID까지 Figma 인스턴스 전반에서 동일하게 재사용된다.

| 메뉴 항목            | 동작                                                         |
| -------------------- | ------------------------------------------------------------ |
| **Create a Post**    | Content Studio로 이동해 해당 Self로 포스팅 작성을 시작 (5부) |
| **Edit Asset Image** | 해당 Self의 에셋 수정 플로우로 진입 (6부)                    |
| **Move to Archive**  | 해당 Self를 아카이브로 이동 (7부)                            |
| **Edit Goal**        | Goal/브리프 수정 모달 오픈 (8부)                             |

같은 4개 액션은 **플로팅 프로필 패널**(9부)에서도 단축 접근 형태로 중복 제공된다(공유 버튼 제외 Edit Assets/Edit Goal/Create a post 3개).

---

## 5. 컨텐츠 스튜디오로 이동 (Create a Post)

컨텍스트 메뉴 → "Create a Post" 선택 시:

- **확인 다이얼로그**: "Exit this page and start creating a post in 'Content Studio'." — 현재 페이지를 벗어난다는 경고성 확인창
- 하단에 **"Do not ask again"** 체크박스 — 체크 시 이후부터는 이 확인창을 건너뛰고 바로 이동하는 것으로 추정(다른 확인 다이얼로그들과 동일한 UX 패턴)
- Cancel → 캔버스로 복귀 / Confirm → Content Studio로 이동해 해당 Self로 포스트 작성 시작

> 이 다이얼로그는 Figma 상에서 "Create a 'Self'" 레이아웃(스타일)을 재사용하고 있어 `get_metadata`의 노드/텍스트 레이어 명이 실제 문구와 다르게 나온다 — 스크린샷 기준 실제 렌더링 텍스트를 신뢰해야 한다.

---

## 6. 디테일뷰에서 에셋 수정/삭제

### 6.1 에셋 수정

디테일뷰의 에셋 타일에 hover하면 3개 아이콘 툴바(프로필 교체 / 수정 / 삭제)와 **"Create a post using this asset"** 라벨이 나타난다.

- 수정(edit) 아이콘 클릭 → 아이디어 입력 패널이 열리되, **기존 에셋 썸네일이 미리 첨부된 상태**로 시작한다(X로 제거 가능)
- 이후 Processing → 생성 완료 흐름은 2부와 동일
- Processing/입력 단계에서 Cancel 시 **"Cancel this step? Your progress on this step will not be saved."** 확인 다이얼로그가 뜬다

### 6.2 에셋 삭제

삭제(trash) 아이콘 클릭 → **"Are you sure you want to delete this? This will take effect immediately and will not be able to restore."** 확인 다이얼로그. 에셋 삭제는 복구 불가(아래 7부의 Self 아카이브/복원과는 다른 동작).

---

## 7. Self 아카이브 / Work History (GNB)

### 7.1 Self 아카이브 (컨텍스트 메뉴 → Move to Archive)

컨텍스트 메뉴에서 "Move to Archive" 선택 시:

- **확인 다이얼로그**: "Archive this Self? This Self will be moved to your archive." (경고성 빨간 테두리 강조)
- Cancel → 캔버스로 복귀 / Archive → 해당 Self가 캔버스에서 제거되고 아카이브로 이동(다른 Self들은 그대로 유지)

### 7.2 GNB — Work History / Self Archive 패널

GNB 옆에 항상 떠 있는 **"Work History | Archive"** 토글을 클릭하면 GNB가 고정 확장(657px)되면서 오른쪽에 사이드패널이 열린다.

- **Work History 패널**: 현재 Self에 대한 작업 이력(Edited/Created/Deleted)이 시간순으로 나열. 각 항목에 복원(↺) 아이콘이 있어 해당 시점 상태로 되돌릴 수 있다(undo/redo와 유사).
- **Self Archive 패널**: 7.1에서 아카이브로 이동한 Self들이 리스트로 표시된다. 각 항목에 **복원(↺)** / **삭제(🗑)** 아이콘이 있다 — 복원은 아카이브→캔버스 되돌리기(7.1의 반대 동작), 삭제는 영구 삭제.
- 패널 상단 X 버튼으로 닫으면 GNB도 다시 축소 가능한 상태로 돌아간다.

> Self 아카이브(7.1)와 에셋 삭제(6.2)는 서로 다른 동작이다 — 에셋 삭제는 즉시 복구 불가, Self 아카이브는 Self Archive 패널에서 복원 가능하다.

---

## 8. Goal 수정 (컨텍스트 메뉴 → Edit Goal)

컨텍스트 메뉴에서 "Edit Goal" 선택 시, 3부의 ④ 화면(Self 상세 브리프)과 동일한 구조화된 폼이 **기존 입력값이 모두 채워진 상태**로 열린다 — 신규 생성이 아니라 수정 모드.

- 레이아웃 재사용으로 인해 모달 타이틀이 "Create a 'Self'"로 표시되지만 실제 맥락은 Goal 수정이다(Figma 레이어명 stale 이슈, 5부와 동일 패턴)
- Continue 클릭 시 3부와 달리 **Brand Image Style 선택 → Processing 단계를 거치지 않고** 바로 캔버스로 돌아간다 — 이미지 재생성이 필요 없는 텍스트성 정보 갱신이기 때문으로 추정

---

## 9. 플로팅 프로필 패널

모든 화면 우상단에 떠 있는 Floating profile 아바타 아이콘을 클릭하면(아이콘 자체에는 `get_reactions`로 확인되는 실제 ON_CLICK 리액션은 없었으나, 패널 내부 버튼들에는 리액션이 걸려 있어 Compass의 동일 패턴에 근거해 추정) 요약 프로필 패널이 열린다.

패널 구성:

- 상단 Tabs — Self가 여러 개일 때 전환용으로 추정
- Polaroid 스타일 Self 사진 카드 (생성 일시 타임스탬프 포함)
- 하단 액션 버튼 4개: **공유 / Edit Assets / Edit Goal / Create a post** (강조 스타일) — 4부의 컨텍스트 메뉴 액션과 동일한 기능의 단축 접근
- 하단 Self 소개 — 짧은 한 줄 요약 + 긴 설명 문단
- 우상단 닫기(X) 버튼

---

## 10. Self 최대치 상태 / 디테일뷰 Tabs

11번째 참조 화면(섹션 타이틀 없이 Self 페이지 최상위에 단독으로 배치된 인스턴스)에서 확인된 내용.

- 캔버스에 8개 Self(Data Scientist, Vegan Chef, Yoga meditator, Team Leader, English Novelist, Fashion Editor, Fashionista, Entrepreneur)가 모두 채워진 **최대치 상태**를 보여준다. 빈 "+" 슬롯 없이 8개 자리가 전부 실제 Self 아바타로 채워지며, 중앙 라벨은 "selves you've created."로 고정된다.
- Detail view 최상단에 **Self 전환 Tabs**가 있다 — 이번 화면에서는 5개 탭(순서대로 임시 라벨/배지가 있는 탭 1개 + Fashionista(활성) + Yoga meditator + English Novelist + Entrepreneur)이 보인다. 8개 Self 중 일부만 탭으로 노출되는 것으로 보아 전체 목록이 아니라 최근 작업했거나 선택 가능한 일부 Self만 노출되는 것으로 추정된다(스크롤/더보기 여부는 미확인).
- 탭 클릭 시 Detail view의 에셋 그리드가 해당 Self의 것으로 전환되고, 캔버스 중앙 강조(현재 하이라이트된 다이아몬드, 이 화면에서는 Fashionista)도 함께 바뀌는 것으로 추정된다 — 이는 Compass 쪽 좌측 원형 시각화 클릭과 우측 패널 Self 전환이 분리된 인터랙션이라는 패턴(`GB_Compass.md` 8부)과 유사한 구조일 가능성이 있다.
- 9부(플로팅 프로필 패널)의 상단 Tabs도 이 Detail view Tabs와 동일한 컴포넌트/역할로 추정된다.

## 11. 남은 확인 필요 사항 (Open Items)

- ~~Work History 패널의 "복원" 동작이 정확히 어느 범위까지 되돌리는지~~ → **확정(2026-10-02, 사용자 확인)**: 해당 에셋 하나만 직전 상태로 복원됨(전체 화면/다른 에셋에는 영향 없음).
- ~~플로팅 프로필 아바타의 클릭 트리거가 실제 프로토타입 리액션으로 연결되어 있는지~~ → **확정(2026-10-02)**: Figma 리액션 확인 결과, 접힌 상태의 아바타 자체에는 리액션이 전혀 없음(화면 배치 순서로 추정했던 것이 맞음). 열린 패널 내부 버튼(Edit Assets/Edit Goal/Create a post, 닫기 X)에는 `ON_CLICK` 트리거가 걸려있지만 전부 `action: null` — 이쪽도 실제 연결된 동작 없음. 코드 구현 시 이 버튼들의 실제 동작을 디자이너에게 확인 필요.
- ~~"Do not ask again" 체크박스가 실제로 이후 세션에 어떻게 영향을 주는지~~ → **확정(2026-10-02, 사용자 확인)**: 영구 설정으로 유지됨(로그아웃/재세션에도 계속 적용). 구현 시 세션 스토리지가 아니라 유저 설정(Firebase)에 저장해야 함.
- Self 삭제(아카이브 패널에서의 영구 삭제)와 에셋 삭제(6.2) 각각의 복구 불가 경고 문구가 사용자에게 충분히 구분되어 전달되는지는 11부(유저플로우 검증, 전체 앱 완료 후 진행 예정)에서 다룰 사안
