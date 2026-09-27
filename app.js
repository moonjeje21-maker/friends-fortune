// 에피소드 구조를 펼쳐 운세 하나하나를 뽑기 대상으로 만든다
const POOL = window.EPISODES.flatMap((ep) =>
  ep.fortunes.map(([grade, ko, en, line]) => ({ ep, grade, ko, en, line }))
);

const pick = document.getElementById("pick");
const mugs = document.getElementById("mugs");
const result = document.getElementById("result");
const again = document.getElementById("again");
const title = document.getElementById("title");
const episode = document.getElementById("episode");
let lastIndex = -1;

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function cups(grade) {
  let html = "";
  for (let i = 1; i <= 5; i++) html += `<span class="${i <= grade ? "on" : "off"}">☕</span>`;
  return html;
}

// 대사를 말한 인물의 GIF id를 고른다: 같은 에피소드 → 다른 에피소드 → 없으면 null(조연)
function pickGif(f) {
  const who = f.line.who.en;
  const has = ([, chars]) => chars.includes(who);
  let list = (window.GIFS[f.ep.code] || []).filter(has);
  if (!list.length) list = Object.values(window.GIFS).flat().filter(has);
  return list.length ? list[Math.floor(Math.random() * list.length)][0] : null;
}

function gifHtml(id) {
  if (!id) return "";
  const safe = escapeHtml(id);
  return `
      <figure class="gif">
        <video src="https://media.giphy.com/media/${safe}/giphy.mp4" autoplay loop muted playsinline></video>
        <figcaption><a href="https://giphy.com/gifs/${safe}" target="_blank" rel="noopener">via GIPHY</a></figcaption>
      </figure>`;
}

function render(f) {
  const { ep, line } = f;
  // 박스(.card)에는 GIF와 대사만, 해석은 박스 밖에 둔다 (에피소드는 버튼 아래 #episode)
  result.innerHTML = `
    <div class="card">${gifHtml(pickGif(f))}
      <div class="cups" aria-label="${f.grade} / 5">${cups(f.grade)}</div>
      <blockquote>
        <p class="line-en">“${escapeHtml(line.en)}”</p>
        <p class="line-ko">${escapeHtml(line.ko)}</p>
        <cite>— ${escapeHtml(line.who.en)} · ${escapeHtml(line.who.ko)}</cite>
      </blockquote>
    </div>
    <div class="fortune">
      <p class="en">${escapeHtml(f.en)}</p>
      <p class="ko">${escapeHtml(f.ko)}</p>
    </div>`;
  episode.innerHTML = `<strong>${escapeHtml(ep.code)}</strong> · ${escapeHtml(ep.title)}`;
}

function draw(mug) {
  let i;
  do i = Math.floor(Math.random() * POOL.length);
  while (i === lastIndex && POOL.length > 1);
  lastIndex = i;

  // 고른 잔만 들썩이고 나머지는 흐려진다 (CSS .mug.chosen 애니메이션 0.5s)
  mugs.querySelectorAll(".mug").forEach((m) => (m.disabled = true));
  mugs.classList.add("picking");
  mug.classList.add("chosen");
  setTimeout(() => {
    render(POOL[i]);
    pick.hidden = true;
    title.hidden = true; // 결과 화면에서는 타이틀을 숨긴다
    result.hidden = false;
    again.hidden = false;
    episode.hidden = false;
    again.focus();
  }, 500);
}

function reset() {
  result.hidden = true;
  again.hidden = true;
  episode.hidden = true;
  title.hidden = false;
  mugs.classList.remove("picking");
  mugs.querySelectorAll(".mug").forEach((m) => {
    m.classList.remove("chosen");
    m.disabled = false;
  });
  pick.hidden = false;
  mugs.querySelector(".mug").focus();
}

mugs.addEventListener("click", (e) => {
  const mug = e.target.closest(".mug");
  if (mug && !mug.disabled) draw(mug);
});
again.addEventListener("click", reset);
