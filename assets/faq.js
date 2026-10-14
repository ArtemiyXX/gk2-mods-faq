/* GK2 mods FAQ: renders index.html (search + one card per mod), mods/index.html (a redirect) and one page per mod
   (most asked first, the rest in collapsed groups by topic). Data comes from data.js (window.FAQ); no network, works from
   disk. All links are relative. */
(function () {
"use strict";
const D = window.FAQ, META = D.meta, ENTRIES = D.entries, REDIR = D.redirects || {};
const PAGE = document.body.dataset.page, ROOT = document.body.dataset.root || "";
const MODS = Object.fromEntries(META.mods.map(m => [m.id, m]));
const BYSLUG = Object.fromEntries(META.mods.map(m => [m.slug, m]));
const BYID = Object.fromEntries(ENTRIES.map(e => [e.id, e]));
const PUBLIC_ROOT = META.root || "https://artemiyxx.github.io/gk2-mods-faq/";
const THIS_MOD = BYSLUG[PAGE] || null;           // null on index and mods
const COUNT = {}; ENTRIES.forEach(e => { COUNT[e.mod] = (COUNT[e.mod] || 0) + 1; });
const topOf = id => ENTRIES.filter(e => e.mod === id && e.top).sort((a, b) => a.top - b.top);

function plRu(n, a, b, c) { const m = n % 10, h = n % 100; return m == 1 && h != 11 ? a : (m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c); }

const UI = {
  title: { en: "GK2 Mods FAQ", ru: "FAQ по модам GK2", zh: "GK2 模组 FAQ" },
  sub: { en: "How do I…? Can it…? Answers about Graveyard Keeper 2 mods: the key, the button, the setting.",
         ru: "Как мне…? А можно…? Ответы про моды Graveyard Keeper 2: какая клавиша, где кнопка, какая настройка.",
         zh: "怎么做…？能不能…？关于《守墓人2》模组的解答：按哪个键、点哪个按钮、改哪项设置。" },
  navAll: { en: "← All mods", ru: "← Все моды", zh: "← 全部模组" },
  othersTitle: { en: "Other mods", ru: "Другие моды", zh: "其他模组" },
  othersSub: { en: "SaintArchI's six mods and Travalgard's Keeper's Lantern collection, one line each. Links go to Nexus Mods.",
               ru: "Шесть модов SaintArchI и коллекция Keeper's Lantern от Travalgard, по строке на мод. Ссылки ведут на Nexus Mods.",
               zh: "SaintArchI 的六个模组和 Travalgard 的 Keeper's Lantern 合集，每个一行。链接指向 Nexus Mods。" },
  search: { en: "What do you want to do?", ru: "Что вы хотите сделать?", zh: "你想做什么？" },
  searchHere: { en: "Search this page", ru: "Поиск по этой странице", zh: "搜索本页" },
  ph: { en: "e.g. move a chest, find planks, stuck zombie", ru: "например: перенести сундук, найти доски, застрял зомби", zh: "例如：移动箱子、找木板、僵尸卡住" },
  try: { en: "Try:", ru: "Например:", zh: "试试：" },
  tries: { en: ["move a chest", "where to sell", "stuck zombie", "factory"], ru: ["перенести сундук", "кому продать", "зомби застрял", "фабрика"], zh: ["移动箱子", "卖给谁", "僵尸卡住", "工厂"] },
  found: { en: n => n + (n == 1 ? " answer" : " answers"), ru: n => n + " " + plRu(n, "ответ", "ответа", "ответов"), zh: n => "共 " + n + " 条解答" },
  none: { en: "Nothing found. Try another word, or switch language: names of buttons differ.", ru: "Ничего не нашлось. Попробуйте другое слово или другой язык: названия кнопок отличаются.", zh: "没有找到。换个词试试，或切换语言：按钮名称可能不同。" },
  keys: { en: "Keys", ru: "Клавиши", zh: "按键" },
  setting: { en: "Setting", ru: "Настройка", zh: "设置" },
  see: { en: "See also", ru: "См. также", zh: "另见" },
  copy: { en: "Copy link", ru: "Ссылка на ответ", zh: "复制链接" },
  copied: { en: "Link copied", ru: "Ссылка скопирована", zh: "链接已复制" },
  copyFail: { en: "Select the address bar and copy it", ru: "Скопируйте адрес из строки браузера", zh: "请从地址栏复制链接" },
  off: { en: "Off by default", ru: "Выкл. по умолчанию", zh: "默认关闭" },
  on: { en: "on", ru: "вкл.", zh: "默认开启" },
  miss: { en: "Easy to miss", ru: "Легко пропустить", zh: "容易错过" },
  by: { en: "by", ru: "автор", zh: "作者" },
  open: { en: "Opens with", ru: "Открывается", zh: "打开键" },
  ours: { en: "SaintArchI's mods", ru: "Моды SaintArchI", zh: "SaintArchI 的模组" },
  theirs: { en: "Travalgard's mods (Keeper's Lantern)", ru: "Моды Travalgard (Keeper's Lantern)", zh: "Travalgard 的模组（Keeper's Lantern）" },
  version: { en: v => "v" + v, ru: v => "v" + v, zh: v => "v" + v },
  all: { en: n => "All " + n + (n == 1 ? " question" : " questions") + " →", ru: n => "Все " + n + " " + plRu(n, "вопрос", "вопроса", "вопросов") + " →", zh: n => "全部 " + n + " 个问题 →" },
  openPage: { en: "Open the page →", ru: "Открыть страницу →", zh: "打开页面 →" },
  most: { en: "Most asked", ru: "Чаще всего спрашивают", zh: "常见问题" },
  moreN: { en: (n, t) => n + " more " + (n == 1 ? "question" : "questions") + (t ? ": " + t : ""),
           ru: (n, t) => "Ещё " + n + " " + plRu(n, "вопрос", "вопроса", "вопросов") + (t ? ": " + t : ""),
           zh: (n, t) => "另外 " + n + " 个问题" + (t ? "：" + t : "") },
  expandAll: { en: "Expand all topics", ru: "Раскрыть все темы", zh: "展开全部主题" },
  collapseAll: { en: "Collapse all topics", ru: "Свернуть все темы", zh: "收起全部主题" },
  nexusMore: { en: "More about this mod, and questions not answered here: its page on Nexus Mods.",
               ru: "Остальное про этот мод и вопросы, которых здесь нет: его страница на Nexus Mods.",
               zh: "更多内容和这里没有的问题：请看该模组的 Nexus Mods 页面。" },
  about: { en: ["This site answers questions about two authors' mods for Graveyard Keeper 2: SaintArchI (GK2 Codex, Shopping List, Move Buildings, Thoughtful Week, Faster Doors, Zombie++) and Travalgard (the Keeper's Lantern collection). Answers describe the current released versions.",
            "SaintArchI's mod settings: one window for all six, open it with F7, from the pause menu (“SaintArchI mods”) or from the Keeper's Lantern wheel. Travalgard's: J or Esc → Keeper's Lantern.",
            "Missing an answer, or something works differently in your game? Ask on the mod's Nexus page."],
           ru: ["Здесь ответы про моды двух авторов для Graveyard Keeper 2: SaintArchI (GK2 Codex, Shopping List, Move Buildings, Thoughtful Week, Faster Doors, Zombie++) и Travalgard (коллекция Keeper's Lantern). Ответы про текущие вышедшие версии.",
            "Настройки модов SaintArchI: одно окно на все шесть. Откройте его по F7, кнопкой «Моды SaintArchI» в меню паузы или из колеса Keeper's Lantern. Моды Travalgard: J или Esc → Keeper's Lantern.",
            "Не нашли ответа или в игре всё иначе? Спросите на странице мода на Nexus."],
           zh: ["本站解答两位作者的《守墓人2》模组问题：SaintArchI（GK2 Codex、Shopping List、Move Buildings、Thoughtful Week、Faster Doors、Zombie++）和 Travalgard（Keeper's Lantern 合集）。解答基于当前已发布的版本。",
            "SaintArchI 模组的设置：六个模组共用一个窗口，按 F7、在暂停菜单里点“SaintArchI mods”，或从 Keeper's Lantern 轮盘打开。Travalgard 的模组：J 或 Esc → Keeper's Lantern。",
            "没找到答案，或游戏里的情况不同？请到该模组的 Nexus 页面提问。"] }
};

let lang = "en", query = "";

function L(o) { if (o == null) return ""; if (typeof o === "string") return o; return o[lang] || o.en || ""; }
function T(k, ...a) { const v = UI[k][lang] || UI[k].en; return typeof v === "function" ? v(...a) : v; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function rich(s) { return esc(s).replace(/\[\[(.+?)\]\]/g, (_, k) => "<kbd>" + k + "</kbd>"); }
function stem_(t) { return /^[а-яё]{5,}$/.test(t) ? t.slice(0, Math.max(4, t.length - 4)) : t; }     // Russian endings: «продать» finds «продаёт»
function terms_(q) { return q.toLowerCase().replace(/ё/g, "е").split(/[\s,.;:!?]+/).filter(Boolean).map(stem_); }
function hl(html) {
  if (!query) return html; const terms = terms_(query); if (!terms.length) return html;
  return html.replace(/(<[^>]+>)|([^<]+)/g, (m, tag, txt) => {
    if (tag) return tag; let out = txt;
    for (const t of terms) { if (t.length < 2 && !/[㐀-鿿]/.test(t)) continue;
      out = out.replace(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>"); }
    return out; });
}
function store(k, v) { try { v === undefined ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function modName(m) { return L(m.name); }
function pageHref(m, hash) { return ROOT + m.slug + "/index.html" + (hash ? "#" + hash : ""); }
function hasPage(m) { return (COUNT[m.id] || 0) > 0; }
function siteRoot() {
  try { if (/^https?:$/.test(location.protocol)) return new URL(ROOT || "./", location.href).href; } catch (e) {}
  return PUBLIC_ROOT;
}
function initials(m) {
  if (m.tile) return m.tile;
  const w = modName(m).replace(/^GK2\s+/, "").replace(/\+\+/g, "+").split(/\s+/).filter(Boolean);
  if (w.length === 1) return w[0].endsWith("+") ? w[0][0] + "+" : w[0].slice(0, 2);
  return (w[0][0] + w[1][0]).toUpperCase();
}
function tile(m, small) {
  const cls = "mi " + (m.author === "saintarchi" ? "ours" : "theirs") + (small ? " sm" : "");
  return m.icon ? `<img class="${cls}" src="${ROOT}assets/modicons/${esc(m.icon)}" alt="">` : `<span class="${cls}" aria-hidden="true">${esc(initials(m))}</span>`;
}

/* search */
const HAY = {};
function hay(e) {
  const k = e.id + "|" + lang; if (HAY[k]) return HAY[k];
  const parts = [];
  for (const lg of new Set([lang, "en"])) {
    const p = o => o && (o[lg] || "");
    parts.push(p(e.q), p(e.alt), p(e.a), p(e.note), p(e.setting));
    (e.steps || []).forEach(s => parts.push(p(s)));
  }
  parts.push(L(MODS[e.mod].name), (e.keys || []).join(" "));
  return HAY[k] = parts.join(" \n ").toLowerCase().replace(/ё/g, "е");
}
function score(e, terms) {
  const h = hay(e); let s = 0; const qt = (L(e.q) + " " + L(e.alt)).toLowerCase().replace(/ё/g, "е");
  for (const t of terms) { if (!h.includes(t)) return 0; s += qt.includes(t) ? 3 : 1; }
  return s;
}
function modOrder(e) { return META.mods.findIndex(m => m.id === e.mod); }
function pool() { return THIS_MOD ? ENTRIES.filter(e => e.mod === THIS_MOD.id) : ENTRIES; }

/* entries */
function tagHtml(e, flat) {
  const m = MODS[e.mod]; const t = [];
  if (flat && !THIS_MOD) t.push(`<span class="tag ${m.author === "saintarchi" ? "ours" : "theirs"}">${esc(modName(m))}</span>`);
  if (e.default === "off") t.push(`<span class="tag off">${esc(T("off"))}</span>`);
  if (e.hidden) t.push(`<span class="tag miss">${esc(T("miss"))}</span>`);
  return `<span class="tags">${t.join("")}</span>`;
}
function entryHtml(e, open, flat) {
  const b = [];
  b.push(`<p class="ans">${hl(rich(L(e.a)))}</p>`);
  if (e.steps && e.steps.length) b.push(`<ol class="steps">${e.steps.map(s => `<li>${hl(rich(L(s)))}</li>`).join("")}</ol>`);
  if (e.keys && e.keys.length) b.push(`<div class="row"><span class="k">${esc(T("keys"))}</span><span class="v">${e.keys.map(k => `<kbd>${esc(k)}</kbd>`).join(" ")}</span></div>`);
  if (e.setting) b.push(`<div class="row"><span class="k">${esc(T("setting"))}</span><span class="v">${hl(rich(L(e.setting)))}${e.default ? ` <span class="tag ${e.default === "off" ? "off" : ""}">${esc(e.default === "off" ? T("off") : T("on"))}</span>` : ""}</span></div>`);
  if (e.note) b.push(`<div class="note">${hl(rich(L(e.note)))}</div>`);
  if (e.media) b.push(`<figure class="media"><img loading="lazy" src="${esc(ROOT + e.media)}" alt="${esc(L(e.q))}"></figure>`);
  const see = (e.see || []).filter(id => BYID[id]);
  const m = MODS[e.mod];
  const seeHtml = see.map(id => {
    const s = BYID[id];
    if (THIS_MOD && s.mod === THIS_MOD.id) return `<a href="#${id}" data-go="${id}">${esc(L(s.q))}</a>`;
    return `<a href="${esc(pageHref(MODS[s.mod], id))}">${esc(L(s.q))}</a>`;
  }).join(" · ");
  b.push(`<div class="foot">${see.length ? `<span>${esc(T("see"))}: ${seeHtml}</span>` : ""}<button type="button" class="copy" data-copy="${e.id}">${esc(T("copy"))}</button></div>`);
  return `<details class="e" id="${e.id}"${open ? " open" : ""}><summary><span class="qt">${hl(rich(L(e.q)))}</span>${tagHtml(e, flat)}</summary><div class="eb">${b.join("")}</div></details>`;
}
function qs(list, openId, flat, style) { return `<div class="qs"${style ? ` style="${style}"` : ""}>${list.map(e => entryHtml(e, e.id === openId, flat)).join("")}</div>`; }

function modHead(m) {
  const links = []; if (m.nexus) links.push(`<a href="${esc(m.nexus)}" target="_blank" rel="noopener">Nexus Mods</a>`);
  const vers = m.version ? " · " + esc(T("version", m.released || m.version)) : "";
  return `<div class="modhead">${tile(m)}<div class="nm"><h2 class="mname">${esc(modName(m))}</h2><span class="by">${esc(T("by"))} ${esc(META.authors[m.author].name)}${vers}${m.key ? ` · ${esc(T("open"))} <kbd>${esc(m.key)}</kbd>` : ""}</span></div><span class="links">${links.join("")}</span>${m.blurb ? `<p class="blurb">${esc(L(m.blurb))}</p>` : ""}</div>`;
}

/* ---- top block: search (+ mod head on a mod page) */
function renderTop() {
  const el = document.getElementById("top"); const out = [];
  if (THIS_MOD) { out.push(`<a class="back" href="${esc(ROOT + "index.html")}">${esc(T("navAll"))}</a>`); out.push(modHead(THIS_MOD)); }
  out.push(`<div class="searchrow" style="margin-top:${THIS_MOD ? 18 : 0}px"><label for="q">${esc(THIS_MOD ? T("searchHere") : T("search"))}</label><input id="q" type="search" autocomplete="off" spellcheck="false" placeholder="${esc(T("ph"))}" value="${esc(query)}"><div class="hint">${esc(T("try"))} ${T("tries").map(t => `<button type="button" data-try="${esc(t)}">${esc(t)}</button>`).join(", ")}</div></div>`);
  el.innerHTML = out.join("");
  const q = document.getElementById("q");
  let t; q.addEventListener("input", ev => { clearTimeout(t); t = setTimeout(() => { query = ev.target.value.trim(); renderList(); }, 120); });
}

/* ---- groups of a mod page */
function groupsOf(m) {
  const secs = (m.sections || []);
  const rest = ENTRIES.filter(e => e.mod === m.id && !e.top);
  if (!rest.length) return [];
  if (!secs.length) return [{ id: "more", t: null, es: rest }];
  return secs.map(s => ({ id: s.id, t: s.t, d: s.d, es: rest.filter(e => e.section === s.id) })).filter(g => g.es.length);
}
function modBody(m, openId) {
  const out = [];
  const tops = topOf(m.id);
  if (tops.length) out.push(`<section class="most" id="most"><h2>${esc(T("most"))}</h2>${qs(tops, openId)}</section>`);
  const gs = groupsOf(m);
  if (gs.length) {
    const sole = gs.length === 1;
    if (!sole) out.push(`<div class="tools"><button type="button" data-grpall="1">${esc(T("expandAll"))}</button></div>`);
    out.push(`<div class="grps">${gs.map(g => `<details class="grp" id="${g.id}"><summary><span>${esc(T("moreN", g.es.length, g.t ? L(g.t) : ""))}</span></summary>${qs(g.es, openId)}</details>`).join("")}</div>`);
  }
  if (m.nexus && ENTRIES.filter(e => e.mod === m.id && !e.top).length === 0)
    out.push(`<p class="more-nexus"><a href="${esc(m.nexus)}" target="_blank" rel="noopener">${esc(T("nexusMore"))}</a></p>`);
  return out.join("");
}

/* ---- index: one card per mod */
function card(m) {
  const tops = topOf(m.id).slice(0, 3);
  const n = COUNT[m.id] || 0;
  const meta = [m.version ? T("version", m.released || m.version) : "", m.key || ""].filter(Boolean).join(" · ");
  return `<div class="card"><div class="hd">${tile(m)}<div><b><a href="${esc(pageHref(m))}">${esc(modName(m))}</a></b>${meta ? `<div class="meta">${esc(meta)}</div>` : ""}</div></div>` +
    `<p>${esc(L(m.blurb || ""))}</p>` +
    `<ul>${tops.map(e => `<li><a href="${esc(pageHref(m, e.id))}">${rich(L(e.q))}</a></li>`).join("")}</ul>` +
    `<a class="more" href="${esc(pageHref(m))}">${esc(n > tops.length ? T("all", n) : T("openPage"))}</a></div>`;
}
function renderCards() {
  const grp = a => META.mods.filter(m => m.author === a && hasPage(m)).map(card).join("");
  return `<section class="sec"><h2>${esc(T("ours"))}</h2><div class="cards">${grp("saintarchi")}</div></section>` +
         `<section class="sec"><h2>${esc(T("theirs"))}</h2><div class="cards">${grp("travalgard")}</div></section>`;
}

function renderList(openId) {
  const el = document.getElementById("list"); const out = [];
  if (query) {
    const terms = terms_(query);
    const hits = pool().map(e => [e, score(e, terms)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1] || modOrder(a[0]) - modOrder(b[0]));
    out.push(`<div class="count">${esc(T("found", hits.length))}</div>`);
    out.push(hits.length ? qs(hits.map(h => h[0]), openId || (hits.length <= 3 ? hits[0][0].id : null), true, "margin-top:10px") : `<div class="empty">${esc(T("none"))}</div>`);
  } else if (THIS_MOD) out.push(modBody(THIS_MOD, openId));
  else out.push(renderCards());
  el.innerHTML = out.join("");
}

/* ---- chrome */
function renderStatic() {
  const app = document.getElementById("app"); app.lang = lang === "zh" ? "zh-Hans" : lang; document.documentElement.lang = app.lang;
  // the header is the same on every page; the mod's name, version and blurb are the first heading below it
  document.getElementById("h1").innerHTML = esc(T("title")) + `<small id="sub">${esc(T("sub"))}</small>`;
  document.title = (THIS_MOD ? modName(THIS_MOD) + " · " + T("title") : T("title"));
  document.querySelectorAll(".langs button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  document.getElementById("about").innerHTML = T("about").map(p => `<p>${esc(p)}</p>`).join("");
}
function render(openId) {
  renderStatic();
  renderTop();
  renderList(openId);
}

/* ---- hash: an entry id opens that answer (and its group), a section id opens and shows its group,
   an old id is sent to the entry that replaced it */
function toast(msg) { const t = document.getElementById("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => t.hidden = true, 2600); }
function scrollTo_(el) { if (!el) return; el.scrollIntoView({ block: "start", behavior: "instant" }); }
function secOf(id) { return THIS_MOD && (id === "more" || id === "most" || (THIS_MOD.sections || []).some(s => s.id === id)); }
function resolveOld(id) {          // -> {mod, hash} or null
  const r = REDIR[id]; if (!r) return null;
  if (r.id && BYID[r.id]) return { mod: MODS[BYID[r.id].mod], hash: r.id };
  if (r.mod && BYSLUG[r.mod]) return { mod: BYSLUG[r.mod], hash: r.sec || "" };
  return null;
}
function go(m, hash) { location.replace(pageHref(m, hash)); }
function openEntry(id, fromHash) {
  query = ""; const q = document.getElementById("q"); if (q) q.value = "";
  render(id);
  const el = document.getElementById(id);
  if (el) { const g = el.closest("details.grp"); if (g) g.open = true; el.open = true; scrollTo_(el); const s = el.querySelector("summary"); if (s && !fromHash) s.focus({ preventScroll: true }); }
}
function goTo(id, fromHash) {
  const e = BYID[id];
  if (e) {
    if (!THIS_MOD || e.mod !== THIS_MOD.id) { go(MODS[e.mod], id); return; }
    openEntry(id, fromHash); return;
  }
  if (secOf(id)) {
    if (query) { query = ""; const q = document.getElementById("q"); if (q) q.value = ""; renderList(); }
    const el = document.getElementById(id) || document.getElementById("most");
    if (el) { if (el.matches("details")) el.open = true; scrollTo_(el); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 2500); }
    return;
  }
  const r = resolveOld(id);
  if (r) { if (THIS_MOD && r.mod.id === THIS_MOD.id && r.hash) { history.replaceState(null, "", "#" + r.hash); goTo(r.hash, fromHash); } else go(r.mod, r.hash); }
}

document.addEventListener("click", ev => {
  const b = ev.target.closest("button,a[data-go]"); if (!b) return;
  if (b.dataset.lang) { lang = b.dataset.lang; store("gk2faq.lang", lang); const h = location.hash.slice(1); const keep = THIS_MOD && BYID[h] && BYID[h].mod === THIS_MOD.id; render(keep ? h : undefined); if (keep) { const el = document.getElementById(h); if (el) { const g = el.closest("details.grp"); if (g) g.open = true; el.open = true; } } }
  else if (b.dataset.try) { query = b.dataset.try; const q = document.getElementById("q"); if (q) q.value = query; renderList(); }
  else if (b.dataset.grpall) {
    const gs = document.querySelectorAll("details.grp"); const anyClosed = Array.from(gs).some(g => !g.open);
    gs.forEach(g => g.open = anyClosed); b.textContent = T(anyClosed ? "collapseAll" : "expandAll"); b.dataset.state = anyClosed ? "open" : "closed";
  }
  else if (b.dataset.go) { ev.preventDefault(); history.replaceState(null, "", "#" + b.dataset.go); goTo(b.dataset.go); }
  else if (b.dataset.copy) {
    const e = BYID[b.dataset.copy];
    const url = siteRoot() + MODS[e.mod].slug + "/#" + e.id;
    const ok = () => toast(T("copied")), bad = () => toast(T("copyFail") + ": " + url);
    try { navigator.clipboard.writeText(url).then(ok, bad); } catch (err) { bad(); }
  }
});

/* the text fonts arrive after the first paint and move everything: scroll to the target again when they are in, unless the reader has already moved */
function settleScroll(id) {
  let moved = false;
  ["wheel", "touchstart", "keydown", "mousedown"].forEach(t => addEventListener(t, () => { moved = true; }, { once: true, passive: true }));
  const again = () => { if (moved) return; const el = document.getElementById(id) || (THIS_MOD && document.getElementById("most")); if (el && (!el.matches("details") || el.open || el.classList.contains("grp"))) scrollTo_(el); };
  try { if (document.fonts && document.fonts.load) Promise.all(['400 18px "PT Sans"', '700 18px "PT Sans"', '700 18px "Pixelify Sans"'].map(f => document.fonts.load(f))).then(again, again); } catch (e) {}
  addEventListener("load", again); setTimeout(again, 700);
}

(function init() {
  let qp = ""; try { qp = new URLSearchParams(location.search).get("lang") || ""; } catch (e) {}
  const saved = load("gk2faq.lang"); const nav = (navigator.language || "en").toLowerCase();
  const pick = s => /^ru/.test(s) ? "ru" : /^zh/.test(s) ? "zh" : /^en/.test(s) ? "en" : "";
  lang = pick(qp.toLowerCase()) || saved || pick(nav) || "en";
  if (!UI.title[lang]) lang = "en";
  let h = ""; try { h = decodeURIComponent((location.hash || "").slice(1)); } catch (e) {}
  // an entry on the index (old links), or on another mod's page, goes to its own page before anything is drawn
  const e0 = BYID[h];
  if (h && e0 && (!THIS_MOD || e0.mod !== THIS_MOD.id)) { go(MODS[e0.mod], h); return; }
  if (h && !e0 && !secOf(h)) { const r = resolveOld(h); if (r && (!THIS_MOD || r.mod.id !== THIS_MOD.id)) { go(r.mod, r.hash); return; } if (r) { h = r.hash; history.replaceState(null, "", "#" + h); } }
  render(BYID[h] && THIS_MOD && BYID[h].mod === THIS_MOD.id ? h : undefined);
  if (h) { goTo(h, true); settleScroll(h); }
  window.addEventListener("hashchange", () => { let x = ""; try { x = decodeURIComponent(location.hash.slice(1)); } catch (e) {} if (x) goTo(x, true); });
})();
})();
