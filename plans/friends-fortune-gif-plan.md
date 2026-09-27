# 결과 화면에 프렌즈 GIF 넣기

## Context
결과 화면이 글자뿐이라 밋밋하다. 뽑힌 대사를 말한 인물이 나오는 프렌즈 GIF를 대사 박스 맨 위에 보여 줘서 생동감을 더한다.
GIF 출처는 GIPHY 공식 Friends 채널의 Season 1 에피소드 24개(https://giphy.com/friends/seasons/season-1)이다.

**사용자와 정한 것**
- 출처: GIPHY의 Season 1 에피소드 24개에 있는 GIF 전체 (파일을 받지 않고 GIPHY 주소로 불러오기)
- 고르는 기준: 대사를 말한 인물 (`line.who.en`). 같은 에피소드에 그 인물 GIF가 있으면 그중에서, 없으면 다른 에피소드의 그 인물 GIF에서 고른다
- 조연(캐롤, 재니스 등) 대사: GIF 없이 지금 화면 그대로
- 위치: 대사 박스(`.card`) 맨 위, ☕ 등급보다 위
- 과한 설계(over-engineering) 피하기: 필요한 만큼만 만든다

**조사 결과**
- 에피소드 24개에 GIF가 300개 있다. GIF마다 붙은 태그(검색어)에 인물 이름(`rachel green`, `jennifer aniston` 등)이 있어서 누가 나오는지 자동으로 알 수 있다.
- 운세 200개 중 162개는 같은 에피소드에서 GIF가 나온다. 14개는 다른 에피소드에서 나오고, 24개(조연 대사)는 GIF가 없다.
- 인물 태그가 없는 GIF 27개는 이 규칙으로는 화면에 나오지 않는다.

## 기술 선택 (스택): 지금 그대로, 더하는 것 없음
- 지금처럼 **HTML/CSS/JS 파일만** 쓴다. 라이브러리(남이 만든 코드 묶음), 프레임워크, 빌드 단계, 패키지 설치는 추가하지 않는다.
- GIF 목록은 `fortunes.js`처럼 **데이터 파일 하나(`gifs.js`)**에 담는다.
- 목록을 만드는 스크립트는 **한 번 쓰고 버린다**. 대사를 모을 때처럼 스크래치패드(임시 작업 폴더)에서 한 번 돌리고, 결과물 `gifs.js`만 프로젝트에 넣는다. 태그가 틀린 GIF가 있으면 `gifs.js`를 손으로 고친다.
- 화면에는 GIF 대신 **같은 장면의 MP4 영상**을 `<video>` 태그 하나로 넣는다. 추가 코드는 필요 없다.
  - 원본 GIF는 4.4MB라 너무 무겁고, MP4는 0.58MB다. 소리 없이 자동 반복되게 하면 보기에는 GIF와 똑같다.
- 넣지 않기로 한 것: 미리 불러오기(preload), 로딩 실패 처리, 태그 수정용 설정 칸, 에피소드마다 다른 가로세로 비율 저장

## 방법

### 1. `gifs.js` 만들기 (한 번만 하는 작업)
- 스크래치패드의 짧은 파이썬 스크립트가 GIPHY 웹사이트가 내부적으로 쓰는 주소를 읽는다.
  - 에피소드 목록: `https://giphy.com/api/v4/channels/10034962/children`
  - 에피소드별 GIF: `https://giphy.com/api/v4/channels/{에피소드id}/feed/`
- `"Episode N: ..."`을 `S01E0N`으로 바꿔 `fortunes.js`의 `code`와 맞춘다.
- 태그에서 주인공 6명의 이름을 찾는다. 에피소드 제목 태그(`the one…`)는 무시한다(인물 이름이 섞여 있어서).
- 결과 파일의 모습:
  ```js
  // 프렌즈 시즌1 GIPHY GIF 목록 (출처: https://giphy.com/friends/seasons/season-1)
  window.GIFS = {
    S01E01: [["LoUmCyntgoQA6Rf2Mz", ["Rachel"]], ...],
    ...
  };
  ```
  에피소드 코드별로 `[GIF id, [나오는 인물]]`만 적는다. 이 id만 있으면 영상 주소를 만들 수 있다.
- 목록을 파일로 저장하는 이유: 브라우저에서 GIPHY 내부 주소를 직접 부르면 보안 규칙(CORS)에 막힌다.

### 2. `index.html`
- `<script src="gifs.js">`를 `fortunes.js`와 `app.js` 사이에 한 줄 추가한다.

### 3. `app.js`
- `pickGif(f)` 함수를 새로 만든다(10줄 안팎).
  1. `GIFS[f.ep.code]` 중 말한 사람이 들어 있는 GIF를 찾는다.
  2. 없으면 모든 에피소드에서 그 인물의 GIF를 찾는다.
  3. 그래도 없으면(조연) `null`을 돌려준다.
  4. 후보가 있으면 하나를 랜덤으로 고른다.
- `render()`: `pickGif`가 id를 주면 `.card` 맨 앞에 아래 내용을 넣는다.
  ```html
  <figure class="gif">
    <video src="https://media.giphy.com/media/{id}/giphy.mp4" autoplay loop muted playsinline></video>
    <figcaption><a href="https://giphy.com/gifs/{id}" target="_blank" rel="noopener">via GIPHY</a></figcaption>
  </figure>
  ```
  - `id`도 지금처럼 `escapeHtml()`을 거친다.
  - "via GIPHY"는 출처 표시다. GIPHY 이용 규칙이 출처 표시를 요구한다.

### 4. `style.css`
- `.gif video`: `width: 100%; aspect-ratio: 6 / 5; object-fit: cover; border-radius: 10px; display: block`
  - GIPHY 영상은 480×400(6:5) 크기다. 비율을 CSS로 고정하면 영상이 늦게 떠도 아래 글자가 밀리지 않는다.
- `.gif figcaption`: 오른쪽 정렬, 11px, `--muted` 색
- 기존 `prefers-reduced-motion`(움직임 줄이기 설정) 부분에는 추가하지 않는다. 영상은 CSS로 멈출 수 없어서다. 대신 필요하면 나중에 다룬다.

### 5. 문서
- `CLAUDE.md`: `gifs.js`의 형식, 스크립트 불러오는 순서, `pickGif` 규칙을 적는다
- `plans/friends-fortune-design-plan.md`: "3차: 결과 화면 GIF" 절을 추가하고, "현재 화면 (최종)" 절을 고친다

## 바뀌는 파일
- 새 파일: `gifs.js`
- 고칠 파일: `index.html`, `app.js`, `style.css`, `CLAUDE.md`, `plans/friends-fortune-design-plan.md`

## 확인 방법
1. node로 숫자 점검: `gifs.js`에 에피소드 24개, GIF 300개가 있는지 본다. 운세 200개마다 규칙을 적용해 같은 에피소드 162 / 다른 에피소드 14 / 없음 24가 나오는지도 본다.
2. `python3 -m http.server 8000`으로 띄워 브라우저에서 여러 번 뽑아 본다.
   - 레이첼 대사에 레이첼 GIF가 나오는지 확인한다.
   - 조연 대사는 GIF 없이 지금 화면 그대로인지 확인한다.
   - 휴대폰 폭(480px 이하)에서도 괜찮은지 확인한다.
3. `open index.html`(file:// 방식)로도 잘 되는지 확인한다.
