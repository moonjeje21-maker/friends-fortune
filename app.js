// 에피소드 구조를 펼쳐 운세 하나하나를 뽑기 대상으로 만든다
const POOL = window.EPISODES.flatMap((ep) =>
  ep.fortunes.map(([grade, ko, en, line]) => ({ ep, grade, ko, en, line }))
);

const pick = document.getElementById("pick");
const mugs = document.getElementById("mugs");
const result = document.getElementById("result");
const again = document.getElementById("again");
let lastIndex = -1;

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function cups(grade) {
  let html = "";
  for (let i = 1; i <= 5; i++) html += `<span class="${i <= grade ? "on" : "off"}">☕</span>`;
  return html;
}

function render(f) {
  const { ep, line } = f;
  // 박스(.card)에는 대사만, 해석과 에피소드는 박스 밖에 둔다
  result.innerHTML = `
    <div class="card">
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
    </div>
    <p class="episode"><strong>${escapeHtml(ep.code)}</strong> · ${escapeHtml(ep.title)}</p>`;
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
    result.hidden = false;
    again.hidden = false;
    again.focus();
  }, 500);
}

function reset() {
  result.hidden = true;
  again.hidden = true;
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
