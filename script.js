const statusEl = document.getElementById("status");
const matchesEl = document.getElementById("matches-list");
const refreshBtn = document.getElementById("refresh");
const tabs = [...document.querySelectorAll(".tab")];
let selectedDay = "today";
document.getElementById("year").textContent = new Date().getFullYear();

function localDate(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function esc(s="") {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function teamHTML(team) {
  const logo = team.crest ? `<img src="${esc(team.crest)}" alt="" loading="lazy" onerror="this.style.display='none'">` : "";
  return `<div class="team">${logo}<span class="team-name">${esc(team.name || "نادیار")}</span></div>`;
}
function renderMatches(matches) {
  if (!matches.length) {
    matchesEl.innerHTML = `<div class="empty">ل ڤێ ڕۆژێ داتای یارییان نەهاتە دۆزینەوە. دڤێت API Token و دابەشبوونا لیگان پشتڕاست بکەی.</div>`;
    return;
  }
  matchesEl.innerHTML = matches.map(m => {
    const home = m.homeTeam || {}, away = m.awayTeam || {}, score = m.score || {};
    const h = score.fullTime?.home ?? score.halfTime?.home ?? "-";
    const a = score.fullTime?.away ?? score.halfTime?.away ?? "-";
    const time = m.utcDate ? new Date(m.utcDate).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) : "";
    const state = m.status === "IN_PLAY" || m.status === "PAUSED" ? "● لایڤ" :
      m.status === "FINISHED" ? "کۆتایی هات" :
      m.status === "POSTPONED" ? "هەڵوەشاندنەوە" : `کات: ${time}`;
    return `<article class="match-card">
      <div class="match-meta"><span class="competition">${esc(m.competition?.name || "یاری")}</span><span>${esc(m.matchday ? "هەفتە " + m.matchday : "")}</span></div>
      <div class="match-teams">${teamHTML(home)}<div class="score">${esc(h)} : ${esc(a)}</div>${teamHTML(away)}</div>
      <div class="match-state">${esc(state)}</div>
    </article>`;
  }).join("");
}
async function loadMatches() {
  statusEl.textContent = "دگەڕێین بۆ ئەنجامان...";
  matchesEl.innerHTML = "";
  refreshBtn.disabled = true;
  const date = localDate(selectedDay === "today" ? 0 : 1);
  try {
    const response = await fetch(`/.netlify/functions/matches?date=${date}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "نەشیا داتا بهێنرێت");
    renderMatches(data.matches || []);
    statusEl.textContent = `${date} • ${data.matches?.length || 0} یاری`;
  } catch (e) {
    matchesEl.innerHTML = `<div class="empty">ئێستا داتای لایڤ نەهاتە وەرگرتن.<br>پشتڕاست بکە وێبسایت ل Netlify بڵاوکریتەوە و FOOTBALL_DATA_TOKEN دانراوە.</div>`;
    statusEl.textContent = "پەیوەندی ب سەرچاوەیا داتا نەهاتە ئەنجامدان.";
  } finally {
    refreshBtn.disabled = false;
  }
}
tabs.forEach(tab => tab.addEventListener("click", () => {
  selectedDay = tab.dataset.day;
  tabs.forEach(t => t.classList.toggle("active", t === tab));
  loadMatches();
}));
refreshBtn.addEventListener("click", loadMatches);
loadMatches();
setInterval(loadMatches, 60000);
