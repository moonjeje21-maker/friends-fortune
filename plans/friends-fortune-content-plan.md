# friends-fortune 콘텐츠 계획 (content-plan): 실제 대사 기반 운세 200개

> **상태: 구현 완료.** 대본 파싱 → 에이전트 4개가 6화씩 선별 → 검증(원문 일치·중복·등급 분포) 후 `fortunes.js`에 반영했다. 확인 단계에서 카드 높이를 580px로 늘렸지만, 이후 화면 전체를 [design-plan](friends-fortune-design-plan.md)대로 다시 만들었다.

## Context
지금 `friends-fortune/fortunes.js`의 운세 200개는 에피소드 분위기만 따서 지어낸 문장이에요. 사용자는 **프렌즈 시즌 1 실제 대사**에서 운세를 뽑아내기를 원해요.
- 대사 출처: `https://edersoncorbari.github.io/friends-scripts/season/0101.html` ~ `0124.html`. `line-of-the-day`에서 쓴 것과 같은 대본 사이트예요.
- 기존 200개는 **전부 교체**하고, 카드에 원문 대사도 함께 보여줘요.

## 1. 대사 수집 (한 번만 하는 작업, 결과물은 스크래치패드에 저장)
1. `curl`로 0101~0124 HTML 24개를 스크래치패드에 내려받아요.
2. 짧은 Python 스크립트로 `<p><b>인물:</b> 대사</p>` 구조를 읽어 `(화, 인물, 대사)` 목록 JSON을 만들어요. 이때 `[Scene…]`, `(…)` 같은 무대 지시문은 빼고 HTML 엔티티를 정리해요.
3. 에피소드마다 8~9개를 골라 **총 200개**를 채워요(16화 × 8 + 8화 × 9). 고르는 기준은 `line-of-the-day`와 같아요.
   - 앞뒤 맥락 없이도 뜻이 통하는 5~25단어 정도의 한두 문장
   - 사랑·일·돈·우정·용기·휴식처럼 운세로 풀 수 있는 심상이 있는 대사
   - 성적인 농담이나 모욕 위주의 대사는 제외
   - 원문은 그대로 두고 앞뒤 군말("Okay,", "Uh," 등)만 다듬어요
   - `line-of-the-day/lines.js`의 96개와 겹쳐도 괜찮아요. 좋은 대사는 다시 써요.
4. 대사마다 한국어 번역, 등급(1~5), 운세 한/영 문장을 작성해요. 등급은 5개 모두에 고르게 나눠요.

## 2. 데이터 형식 변경 (`friends-fortune/fortunes.js`)
운세 하나하나가 자기 대사를 갖도록 배열에 4번째 칸을 추가해요.
```js
fortunes: [
  [5, "운세 한국어", "Fortune English",
    { who: { ko: "레이첼", en: "Rachel" }, en: "원문 대사", ko: "한국어 번역" }],
  ...
]
```
- 에피소드의 `code`, `title`, `moment`, `lucky`는 그대로 둬요.
- 쓰이지 않던 에피소드 단위 `quote` 필드와 파일 맨 위 안내 주석을 새 형식에 맞게 고쳐요.

## 3. 화면 표시 (`friends-fortune/app.js`)
- `POOL`을 만들 때 `([grade, ko, en, line])`로 4번째 칸도 받아요.
- `render()`에서 기존 `ep.quote` 블록쿼트를 운세별 대사로 바꿔요. 원문 영어와 한국어 번역, 그리고 "— Rachel · 레이첼"처럼 말한 사람을 보여줘요. 모든 값은 `escapeHtml()`을 거쳐요.
- 필요하면 `style.css`에 `blockquote` 안 인물/번역 줄 스타일을 조금 추가해요. 기존 `blockquote` 스타일이 있는지 먼저 확인해요.
- 헤더의 개수(`.fortune-count`)는 이미 `POOL.length`로 자동 계산돼서 손댈 필요가 없어요.

## 4. 문서 (`friends-fortune/CLAUDE.md`)
Data shape 부분을 새 4칸 형식과 대사 출처 URL로 고쳐요.

## 확인 방법
1. 개수 확인: 아래 명령이 `24 200`을 출력해야 해요.
   ```bash
   node -e 'global.window={};require("./fortunes.js");const E=window.EPISODES;console.log(E.length,E.reduce((a,e)=>a+e.fortunes.length,0))'
   ```
2. 형식 확인: 모든 운세가 4칸이고, 등급이 1~5이며, 대사의 `who`/`en`/`ko` 값이 비어 있지 않은지 node 한 줄로 검사해요.
3. 대사 진위 확인: 원문 `en` 200개가 내려받은 대본 텍스트에 실제로 들어 있는지 스크립트로 대조해요. 군말만 다듬은 경우를 고려해 부분 일치로 봐요.
4. 브라우저 확인: `open index.html` 후 여러 번 뽑아서 대사, 번역, 인물, 운세가 카드에 잘 보이는지, 긴 대사도 카드 밖으로 넘치지 않는지 봐요.
