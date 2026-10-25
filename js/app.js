// 소비자 관리 + 제품 가이드 앱 화면
import { CATEGORIES, CONCERNS, DEVICE_MODELS } from './catalog.js';
import * as store from './store.js';
import * as L from './logic.js';
import { sampleData } from './sample.js';

// ───────── 공통 ─────────
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = n => (Number(n) || 0).toLocaleString('ko-KR') + '원';
const today = () => L.todayStr();
const D = () => store.db();
const byId = (coll, id) => D()[coll].find(r => r.id === id);
const custName = id => byId('customers', id)?.name || '(삭제된 소비자)';
const korSort = (a, b) => a.localeCompare(b, 'ko');
const KDAY = ['일', '월', '화', '수', '목', '금', '토'];
const mdKor = md => md ? `${Number(md.slice(0, 2))}월 ${Number(md.slice(3, 5))}일` : '';
const LABEL = Object.fromEntries(CONCERNS.flatMap(g => g.items));

const SVG = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
  drop: '<path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5Z"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  msg: '<path d="M4 5h16v11H8l-4 4V5Z"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
  bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  share: '<path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 13v6h14v-6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  pill: '<rect x="2.8" y="8.5" width="18.4" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="m9.2 8.2 5.6 7.6"/>',
};
const ic = n => `<svg class="i" viewBox="0 0 24 24">${SVG[n]}</svg>`;

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2000);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('복사했어요. 카톡이나 문자에 붙여넣기 하세요'); }
  catch { prompt('아래 내용을 복사하세요', text); }
}
async function shareText(text) {
  if (navigator.share) { try { await navigator.share({ text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  copyText(text);
}
const telHref = phone => 'tel:' + String(phone || '').replace(/[^\d+]/g, '');
const smsHref = (phone, body) => `sms:${String(phone || '').replace(/[^\d+]/g, '')}${/iPhone|iPad/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(body)}`;

const opt = (v, cur, label = v) => `<option value="${esc(v)}" ${String(v) === String(cur ?? '') ? 'selected' : ''}>${esc(label)}</option>`;
const fld = (label, inner, req) => `<label class="fld"><span>${label}${req ? ' <em>*</em>' : ''}</span>${inner}</label>`;

// ───────── 화면 상태 ─────────
const ui = {
  homeTab: 'today', homeQ: '',
  custQ: '', custGrade: '',
  filterKind: '정수기', filterMonth: L.ym(today()),
  sopChip: '전체', sopMulti: false,
  interestCat: '', interestOnly: true,
  buyersProduct: '', buyersMonth: '',
  prodQ: '',
  guide: { sub: 'rec', age: '', gender: '', budget: '', cats: new Set(), concerns: new Set(), ran: false, q: '', fc: '', sort: 'pg', dq: '' },
  showAllPurchases: false,
};
let picks = {};
try { picks = JSON.parse(localStorage.getItem('picks') || '{}'); } catch {}
const savePicks = () => { try { localStorage.setItem('picks', JSON.stringify(picks)); } catch {} };

// ───────── 라우팅 ─────────
function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [name, id] = h.split('/');
  return { name: name || 'home', id: id ? decodeURIComponent(id) : null };
}
const go = path => { location.hash = '#/' + path; };
const NAV = [['home', '홈', 'home'], ['customers', '소비자', 'users'], ['filters', '필터 교체', 'drop'], ['sop', 'SOP', 'repeat'], ['guide', '제품', 'box']];
const NAV_GROUP = { c: 'customers', buyers: 'home', interests: 'home', settings: 'home', products: 'home' };

const SCREENS = {};
const LIVE = {}; // 검색어 입력 시 목록만 다시 그리는 함수 (한글 입력이 끊기지 않게)
let lastRoute = '';

function render() {
  const r = route();
  const screen = SCREENS[r.name] || SCREENS.home;
  const same = lastRoute === location.hash;
  const y = scrollY;
  $('#app').innerHTML = screen(r);
  $('#app').classList.toggle('has-bar', r.name === 'guide' && pickLines().length > 0);
  const group = NAV_GROUP[r.name] || r.name;
  $('#nav').innerHTML = `<div class="in-nav">${NAV.map(([k, label, icon]) =>
    `<a href="#/${k}" class="${group === k ? 'on' : ''}">${ic(icon)}<span>${label}</span></a>`).join('')}</div>`;
  if (same) scrollTo(0, y); else scrollTo(0, 0);
  lastRoute = location.hash;
}
function updateLive() {
  const r = route();
  const el = $('#live');
  if (el && LIVE[r.name]) el.innerHTML = LIVE[r.name](r);
}

// ───────── 할 일 표시 ─────────
function dueBadge(t) {
  const td = today();
  if (t.type === '소개 후속') {
    const it = byId('intros', t.introId);
    return `<span class="badge warn">${it ? L.diffDays(it.date, td) : ''}일 경과</span>`;
  }
  const n = L.diffDays(td, t.due);
  if (n < 0) return `<span class="badge warn">${-n}일 지남</span>`;
  if (n === 0) return `<span class="badge warn">오늘</span>`;
  return `<span class="badge">D-${n}</span>`;
}
function taskRow(t) {
  return `<div class="task ${t.done ? 'done' : ''}">
    <button class="chk" data-act="task-toggle" data-key="${esc(t.key)}" aria-label="완료"><span class="box">${t.done ? ic('check') : ''}</span></button>
    <div class="body" data-act="open-customer" data-id="${t.customerId}">
      <div class="nm">${esc(custName(t.customerId))} <small>· ${t.type}</small></div>
      <div class="tx">${esc(t.text)}</div>
    </div>
    ${t.done ? '<span class="badge gray">완료</span>' : dueBadge(t)}
    <button class="more" data-act="task-menu" data-key="${esc(t.key)}" aria-label="더보기">${ic('more')}</button>
  </div>`;
}

// ───────── 홈 ─────────
SCREENS.home = () => {
  const data = D(), td = today();
  const now = new Date();
  const tasks = L.visibleTasks(data, td);
  const tToday = L.todayTasks(tasks, td), tWeek = L.weekTasks(tasks, td);
  const left = tToday.filter(t => !t.done).length;
  const list = ui.homeTab === 'today' ? tToday : tWeek;
  const doneN = list.filter(t => t.done).length;

  const thisMonth = L.ym(td);
  const filterN = new Set(L.allFilterCycles(data, td)
    .filter(c => !c.repurchasedAt && L.ym(c.due) === thisMonth && !c.device.reminderOff).map(c => c.customer.id)).size;
  const we = L.weekEnd(td);
  const sopN = data.sops.filter(s => { const p = L.nextPayDate(s, td); return p && p <= we; }).length;
  const introN = new Set(L.buildTasks(data, td).filter(t => t.type === '소개 후속').map(t => t.customerId)).size;
  const gap = L.topInterestGap(data);

  const empty = !data.customers.length;
  return `
  <div class="top">
    <div><div class="date">${now.getMonth() + 1}월 ${now.getDate()}일 ${KDAY[now.getDay()]}요일</div>
      <h1>${left ? `오늘 할 일 ${left}건` : '오늘 할 일 끝!'}</h1></div>
    <div class="acts">
      <a class="round ghost" href="#/settings" aria-label="설정">${ic('gear')}</a>
      <button class="round" data-act="customer-new" aria-label="새 소비자">${ic('plus')}</button>
    </div>
  </div>
  <label class="search">${ic('search')}<input id="homeQ" data-live="homeQ" type="search" placeholder="소비자 이름, 제품으로 검색" value="${esc(ui.homeQ)}"></label>
  <div id="live">${LIVE.home()}</div>
  ${empty ? `
    <div class="card pad" style="margin-top:16px">
      <b style="font-size:17px">처음 오셨네요</b>
      <p class="muted" style="margin:6px 0 14px;font-size:14px">소비자를 등록하면 필터 교체, SOP 결제, 소개 후속, 생일을 날짜에 맞춰 알려드려요.</p>
      <div class="row-btns"><button class="btn pri" data-act="customer-new">소비자 추가</button><button class="btn" data-act="load-sample">예시로 둘러보기</button></div>
    </div>` : ''}
  <div class="tiles">
    <a class="tile" href="#/filters"><div class="t">필터 교체</div><div class="n">${filterN}<small>명</small></div><div class="s">이번 달 예정</div></a>
    <a class="tile" href="#/sop"><div class="t">SOP 결제</div><div class="n">${sopN}<small>건</small></div><div class="s">이번 주 예정</div></a>
    <button class="tile" data-act="home-tab" data-v="today"><div class="t">소개 후속</div><div class="n">${introN}<small>명</small></div><div class="s">반응 확인 필요</div></button>
  </div>
  <div class="seg">
    <button class="${ui.homeTab === 'today' ? 'on' : ''}" data-act="home-tab" data-v="today">오늘 ${tToday.filter(t => !t.done).length}</button>
    <button class="${ui.homeTab === 'week' ? 'on' : ''}" data-act="home-tab" data-v="week">이번 주 ${tWeek.filter(t => !t.done).length}</button>
  </div>
  <div class="sec"><h2>${ui.homeTab === 'today' ? '오늘 할 일' : '이번 주 할 일'}</h2><span class="r">완료 ${doneN} / ${list.length}</span></div>
  <div class="card list">${list.map(taskRow).join('') || `<div class="empty">${ui.homeTab === 'today' ? '오늘은 연락할 사람이 없어요' : '이번 주 할 일이 없어요'}</div>`}</div>
  ${gap ? `<a class="promo" href="#/interests" data-act="interest-go" data-cat="${esc(gap.category)}">
      <span class="ic">${ic('star')}</span>
      <div><b>제품 소개 추천</b><span>${esc(gap.category)}에 관심 있는데 아직 안 산 소비자 ${gap.count}명</span></div>${ic('right')}</a>`
    : `<a class="promo" href="#/interests"><span class="ic">${ic('star')}</span><div><b>관심 항목별 소비자</b><span>관심사에 맞는 제품을 소개해 보세요</span></div>${ic('right')}</a>`}
  <a class="btn block green-txt" href="#/buyers" style="margin-top:12px;min-height:54px">제품·월별 구매자 조회</a>`;
};
LIVE.home = () => {
  const q = ui.homeQ.trim().replace(/\s/g, '');
  if (!q) return '';
  const data = D();
  const cs = data.customers.filter(c => (c.name + (c.phone || '')).replace(/[\s-]/g, '').includes(q.replace(/-/g, ''))).slice(0, 6);
  const ps = L.allProducts(data).filter(p => p.n.replace(/\s/g, '').includes(q)).slice(0, 5);
  if (!cs.length && !ps.length) return `<div class="empty">검색 결과가 없어요</div>`;
  return `<div class="card list" style="margin-top:8px">
    ${cs.map(c => `<a class="item" href="#/c/${c.id}"><span class="avatar">${esc(c.name[0])}</span><div class="info"><b>${esc(c.name)}</b><span class="sub">${esc(c.phone || '')}</span></div>${ic('right')}</a>`).join('')}
    ${ps.map(p => `<button class="item" style="width:100%;border-left:0;border-right:0;border-bottom:0;background:none;text-align:left" data-act="guide-search" data-q="${esc(p.n)}">
      <span class="avatar">${ic('pill')}</span><div class="info"><b>${esc(p.n)}</b><span class="sub">${won(p.p)} · ${esc(p.s)}</span></div>${ic('right')}</button>`).join('')}
  </div>`;
};

// ───────── 소비자 목록 ─────────
function custBadges(c) {
  const sops = D().sops.filter(s => s.customerId === c.id && s.status !== '해지').length;
  const g = c.grade || '소비자';
  return `${g !== '소비자' ? `<span class="badge sm ${g === '단골' ? 'dark' : 'gray'}">${esc(g)}</span>` : ''}${sops ? `<span class="badge sm">SOP ${sops}개</span>` : ''}`;
}
SCREENS.customers = () => {
  const s = D().settings;
  return `
  <div class="top"><div><h1>소비자</h1><div class="date">${D().customers.length}명</div></div>
    <button class="round" data-act="customer-new" aria-label="새 소비자">${ic('plus')}</button></div>
  <label class="search">${ic('search')}<input data-live="custQ" type="search" placeholder="이름, 연락처로 검색" value="${esc(ui.custQ)}"></label>
  <div class="chips" style="margin-top:12px">
    ${['', ...s.grades].map(g => `<button class="chip sm ${ui.custGrade === g ? 'on' : ''}" data-act="cust-grade" data-v="${esc(g)}">${g || '전체'}</button>`).join('')}
  </div>
  <div id="live">${LIVE.customers()}</div>`;
};
LIVE.customers = () => {
  const q = ui.custQ.replace(/[\s-]/g, '');
  const list = D().customers
    .filter(c => !ui.custGrade || (c.grade || '소비자') === ui.custGrade)
    .filter(c => !q || (c.name + (c.phone || '')).replace(/[\s-]/g, '').includes(q))
    .sort((a, b) => korSort(a.name, b.name));
  if (!list.length) return `<div class="empty">${D().customers.length ? '찾는 소비자가 없어요' : '아직 등록한 소비자가 없어요'}</div>`;
  return `<div class="card list" style="margin-top:14px">${list.map(c => `
    <a class="person" href="#/c/${c.id}"><span class="avatar">${esc(c.name[0])}</span>
      <div class="info"><div class="nm">${esc(c.name)} ${custBadges(c)}</div><div class="sub">${esc(c.phone || '연락처 없음')}</div></div>
      <span class="chev">${ic('right')}</span></a>`).join('')}</div>`;
};

// ───────── 소비자 카드 ─────────
SCREENS.c = r => {
  const data = D(), td = today();
  const c = byId('customers', r.id);
  if (!c) return `<a class="back" href="#/customers">${ic('left')}소비자 목록</a><div class="empty">소비자를 찾을 수 없어요</div>`;
  const pm = L.productMap(data);
  const purchases = data.purchases.filter(p => p.customerId === c.id).sort((a, b) => b.date.localeCompare(a.date));
  const first = c.firstPurchaseDate || purchases.at(-1)?.date;
  const interests = data.interests.filter(i => i.customerId === c.id).sort((a, b) => a.rank - b.rank);
  const iUpdated = interests.map(i => i.updatedAt || '').sort().at(-1);
  const recos = L.recommendFor(data, c, td);
  const sops = data.sops.filter(s => s.customerId === c.id).sort((a, b) => (a.status === '해지') - (b.status === '해지'));
  const devices = data.devices.filter(d => d.customerId === c.id);
  const cycles = L.allFilterCycles(data, td).filter(x => x.customer.id === c.id && !x.repurchasedAt);
  const intros = data.intros.filter(i => i.customerId === c.id).sort((a, b) => b.date.localeCompare(a.date));
  const shownP = ui.showAllPurchases ? purchases : purchases.slice(0, 5);

  return `
  <a class="back" href="#/customers">${ic('left')}소비자 목록</a>
  <div class="card profile">
    <div class="head"><span class="avatar lg">${esc(c.name[0])}</span>
      <div><h1>${esc(c.name)}</h1><div class="badges">${custBadges(c) || '<span class="badge sm gray">소비자</span>'}</div></div>
      <button class="icon-btn edit" data-act="customer-edit" data-id="${c.id}" aria-label="수정">${ic('edit')}</button></div>
    <div class="kv">
      <div><span>연락처</span><b>${esc(c.phone || '-')}</b></div>
      <div><span>생일</span><b>${c.birthday ? mdKor(c.birthday) : '-'}</b></div>
      <div><span>소개자</span><b>${esc(c.referrer || '-')}</b></div>
      <div><span>첫 구매</span><b>${first ? L.dotDate(first).slice(0, 7) : '-'}</b></div>
      ${c.family ? `<div style="grid-column:1/-1"><span>가족</span><b>${esc(c.family)}</b></div>` : ''}
      ${c.memo ? `<div style="grid-column:1/-1"><span>메모</span><b style="white-space:pre-wrap">${esc(c.memo)}</b></div>` : ''}
    </div>
    <div class="row-btns">
      ${c.phone ? `<a class="btn pri" href="${telHref(c.phone)}">전화</a>` : `<button class="btn pri" disabled style="opacity:.5">전화</button>`}
      <button class="btn" data-act="kakao" data-id="${c.id}">카톡</button>
      <button class="btn" data-act="memo" data-id="${c.id}">메모</button>
    </div>
  </div>

  <div class="sec"><h2>관심 항목 Top 5</h2><button class="link" data-act="interests-edit" data-id="${c.id}">${interests.length ? '편집' : '+ 추가'}</button></div>
  ${interests.length ? `<div class="card list">${interests.map(i => `
    <div class="interest"><span class="rank">${i.rank}</span><div class="info"><b>${esc(i.category)}</b>${i.memo ? `<div class="m">${esc(i.memo)}</div>` : ''}</div>
      <span class="badge sm ${i.source === '직접 들음' ? '' : 'gray'}">${esc(i.source)}</span></div>`).join('')}</div>
    <div class="small muted" style="margin:6px 2px 0;text-align:right">업데이트 ${L.dotDate((iUpdated || '').slice(0, 10))}</div>`
    : `<div class="card empty">관심사를 기록해 두면 맞는 제품을 추천해 드려요</div>`}

  ${interests.length ? `
  <div class="sec"><h2>추천 제품 <small>관심 항목 기준 · 아직 안 산 것</small></h2></div>
  ${recos.length ? `<div class="grid2">${recos.map(x => `
    <div class="card reco"><span class="cat">${esc(x.category)}</span><b>${esc(x.product.n)}</b>
      <span class="pr">${won(x.product.p)}</span>${x.recentlyIntroduced ? '<span class="badge sm gray" style="align-self:flex-start">최근 소개함</span>' : ''}
      <button class="btn sm out" data-act="intro-new" data-id="${c.id}" data-product="${esc(x.product.id)}" style="margin-top:6px">소개 기록</button></div>`).join('')}</div>`
    : `<div class="card empty">추천할 제품이 없어요</div>`}
  <button class="btn block green-txt" data-act="guide-for" data-id="${c.id}" style="margin-top:8px">제품 가이드에서 더 찾아보기</button>` : ''}

  <div class="sec"><h2>이용 중인 SOP</h2></div>
  <div class="card list">
    ${sops.map(s => {
      const pay = L.nextPayDate(s, td);
      return `<div class="item" data-act="sop-edit" data-id="${s.id}"><div class="info"><b>${esc(L.sopName(s))}</b>
        <span class="sub">${s.status === '해지' ? `${L.dotDate(s.endedAt)} 해지${s.endReason ? ' · ' + esc(s.endReason) : ''}` : `${esc(s.cycle)} ${s.payDay}일 결제 · ${L.dotDate(s.startDate).slice(0, 7)} 시작${pay ? ` · 다음 ${L.mmdd(pay)}` : ''}`}</span></div>
        <span class="badge sm ${s.status === '이용 중' ? '' : 'warn'}">${esc(s.status)}</span></div>`;
    }).join('')}
    <div class="pad" style="padding:14px 16px">
      <b style="font-size:15px">SOP 추가</b>
      <div class="two" style="margin-top:8px">
        ${fld('SOP 종류', `<select class="in" id="qsType" data-on="qs-type">${D().settings.sopTypes.map(t => opt(t, '일반 SOP')).join('')}</select>`)}
        ${fld('품목', `<select class="in" id="qsItem">${D().settings.sopItems.map(t => opt(t)).join('')}${opt('기타', '', '기타(직접 입력)')}</select>`)}
      </div>
      <button class="btn pri block" data-act="sop-quick" data-id="${c.id}">추가</button>
    </div>
  </div>

  <div class="sec"><h2>필터 관리</h2></div>
  <div class="card list">
    ${devices.map(dv => {
      const cy = cycles.filter(x => x.device.id === dv.id).sort((a, b) => a.due.localeCompare(b.due))[0];
      const n = cy ? L.diffDays(td, cy.due) : null;
      const lastF = cy ? cy.last : null;
      return `<div class="item" data-act="device-edit" data-id="${dv.id}"><div class="info"><b>${esc(dv.kind)} · ${esc(dv.location || dv.model || '')}</b>
        <span class="sub">${dv.installedAt ? `설치 ${L.dotDate(dv.installedAt).slice(0, 7)}` : ''}${lastF ? ` · 마지막 필터 ${L.dotDate(lastF)}` : ''}${dv.reminderOff ? ' · 알림 끔' : ''}</span></div>
        ${cy ? `<span class="badge sm ${n <= 21 ? 'warn' : ''}">${n < 0 ? `${-n}일 지남` : `D-${n}`}</span>` : ''}</div>`;
    }).join('')}
    <button class="add-link" data-act="device-new" data-id="${c.id}">${ic('plus')}기기 추가 (정수기·공기청정기)</button>
  </div>

  <div class="sec"><h2>최근 구매</h2>${purchases.length > 5 ? `<button class="link" data-act="toggle-purchases">${ui.showAllPurchases ? '접기' : `전체 ${purchases.length}건`}</button>` : ''}</div>
  <div class="card list">
    ${shownP.map(p => `<div class="item" data-act="purchase-edit" data-id="${p.id}"><div class="info"><b>${esc(pm[p.productId]?.n || '삭제된 제품')}</b>
      <span class="sub">${L.dotDate(p.date)}${p.amount ? ' · ' + won(p.amount) : ''}${p.viaSop ? ' · SOP' : ''}</span></div><span class="rt">${p.quantity || 1}개</span></div>`).join('')}
    <button class="add-link" data-act="purchase-new" data-id="${c.id}">${ic('plus')}구매 기록</button>
  </div>

  <div class="sec"><h2>소개 이력</h2></div>
  <div class="card list">
    ${intros.map(i => {
      const bought = L.introPurchased(data, i);
      return `<div class="item" data-act="intro-edit" data-id="${i.id}"><div class="info"><span class="sub">${L.mmdd(i.date)} · ${esc(i.method)}</span>
        <b>${esc(pm[i.productId]?.n || '삭제된 제품')}</b>
        <span class="small" style="color:var(--accent);font-weight:600">반응: ${esc(i.reaction)} · ${bought ? '구매로 이어짐' : '구매 전'}</span></div></div>`;
    }).join('')}
    <button class="add-link" data-act="intro-new" data-id="${c.id}">${ic('plus')}소개 기록</button>
  </div>`;
};

// ───────── 필터 교체 ─────────
SCREENS.filters = () => {
  const data = D(), td = today();
  const all = L.allFilterCycles(data, td).filter(x => x.kind === ui.filterKind);
  const month = all.filter(x => L.ym(x.due) === ui.filterMonth && x.status !== '놓친 고객').sort((a, b) => a.due.localeCompare(b.due));
  const missed = all.filter(x => x.status === '놓친 고객').sort((a, b) => a.due.localeCompare(b.due));
  const [y, m] = ui.filterMonth.split('-').map(Number);
  const cnt = s => month.filter(x => x.status === s).length;
  const statusBadge = x => x.status === '재구매 완료' ? '<span class="badge">재구매 완료</span>'
    : x.status === '연락함' ? `<span class="badge gray">연락함${x.note ? ' · ' + esc(x.note) : ''}</span>`
    : '<span class="badge warn">아직 연락 안 함</span>';
  const card = (x, missedCard) => {
    const n = L.diffDays(td, x.due);
    return `<div class="card fcard ${missedCard ? 'missed' : ''}" data-act="filter-menu" data-key="${esc(x.key)}">
      <div class="l1"><b>${esc(x.customer.name)} <span class="loc">· ${esc(x.device.location || x.device.model || '')}</span></b>
        <span class="due ${missedCard ? 'w' : ''}">${missedCard ? `${-n}일 지남` : `${L.mmdd(x.due)}${x.status !== '재구매 완료' && n >= 0 ? ` (D-${n})` : ''}`}</span></div>
      <div class="l2">${esc(x.product.f?.type || x.product.n)} · ${missedCard ? `예정일 ${L.dotDate(x.due)}` : `지난 구매 ${L.dotDate(x.last)}`}</div>
      <div class="l3">${missedCard ? (x.contacted ? '<span class="badge gray">연락함</span>' : '<span class="badge warn">재구매 없음</span>') : statusBadge(x)}
        <span class="row-btns" style="flex:none">
          ${x.customer.phone ? `<a class="icon-btn" href="${telHref(x.customer.phone)}" aria-label="전화">${ic('phone')}</a>` : ''}
          <button class="icon-btn" data-act="filter-msg" data-key="${esc(x.key)}" aria-label="메시지">${ic('msg')}</button></span></div>
    </div>`;
  };
  return `
  <div class="top"><h1>필터 교체 예정</h1></div>
  <div class="seg" style="margin-top:0">${['정수기', '공기청정기'].map(k => `<button class="${ui.filterKind === k ? 'on' : ''}" data-act="filter-kind" data-v="${k}">${k}</button>`).join('')}</div>
  <div class="month-nav"><button class="icon-btn" data-act="filter-month" data-v="-1" aria-label="이전 달">${ic('left')}</button>
    <b>${y}년 ${m}월</b><button class="icon-btn" data-act="filter-month" data-v="1" aria-label="다음 달">${ic('right')}</button></div>
  <div class="tiles center">
    <div class="tile"><div class="n">${month.length}</div><div class="s">교체 예정</div></div>
    <div class="tile"><div class="n">${cnt('연락함')}</div><div class="s">연락함</div></div>
    <div class="tile"><div class="n g">${cnt('재구매 완료')}</div><div class="s">재구매 완료</div></div>
  </div>
  <div class="sec"><h2>${ui.filterMonth === L.ym(td) ? '이번 달' : `${m}월`} 교체 예정자</h2></div>
  ${month.map(x => card(x, false)).join('') || `<div class="card empty">${data.devices.some(d => d.kind === ui.filterKind) ? '이 달에 교체 예정인 소비자가 없어요' : `등록된 ${ui.filterKind}가 없어요.<br>소비자 카드의 '필터 관리'에서 기기를 추가하세요.`}</div>`}
  ${missed.length ? `<div class="sec"><h2>놓친 고객 <small>기한 지남 · 재구매 없음</small></h2></div>${missed.map(x => card(x, true)).join('')}` : ''}`;
};

// ───────── SOP ─────────
SCREENS.sop = () => {
  const data = D(), td = today();
  const live = data.sops.filter(s => s.status !== '해지');
  const chipName = s => L.sopName(s);
  const chips = ['전체', ...new Set(live.map(chipName).sort((a, b) => (a.startsWith('장바구니') ? -1 : 0) - (b.startsWith('장바구니') ? -1 : 0) || korSort(a, b)))];
  if (!chips.includes(ui.sopChip)) ui.sopChip = '전체';
  const byCust = {};
  live.forEach(s => (byCust[s.customerId] ||= []).push(s));
  let rows = Object.entries(byCust).map(([cid, list]) => ({ c: byId('customers', cid), list })).filter(r => r.c);
  if (ui.sopChip !== '전체') rows = rows.filter(r => r.list.some(s => chipName(s) === ui.sopChip));
  if (ui.sopMulti) rows = rows.filter(r => r.list.length >= 2);
  rows.forEach(r => { r.next = r.list.map(s => L.nextPayDate(s, td)).filter(Boolean).sort()[0] || null; r.paused = r.list.every(s => s.status === '일시중지'); });
  rows.sort((a, b) => korSort(a.c.name, b.c.name));
  const churn = data.sops.filter(s => s.status === '해지' && s.endedAt && s.endedAt >= L.addDays(td, -120)).sort((a, b) => b.endedAt.localeCompare(a.endedAt));
  return `
  <div class="top"><h1>SOP 관리</h1></div>
  <div class="chips">${chips.map(ch => `<button class="chip ${ui.sopChip === ch ? 'on' : ''}" data-act="sop-chip" data-v="${esc(ch)}">${esc(ch)}</button>`).join('')}</div>
  <div class="card toggle" data-act="sop-multi"><div><b>SOP 2개 이상 소비자만 보기</b><span>핵심 소비자 관리용</span></div><span class="cbox ${ui.sopMulti ? 'on' : ''}">${ui.sopMulti ? ic('check') : ''}</span></div>
  <div class="sec"><h2>${ui.sopChip === '전체' ? 'SOP 소비자 전체' : esc(ui.sopChip)}</h2><span class="r">${rows.length}명</span></div>
  <div class="card list">${rows.map(r => `
    <a class="person" href="#/c/${r.c.id}"><div class="info"><div class="nm">${esc(r.c.name)}</div><div class="sub">${r.list.map(s => esc(L.sopName(s))).join(' · ')}</div></div>
      <div class="rt"><span>다음 결제 ${r.next ? L.mmdd(r.next) : '—'}</span><span class="badge sm ${r.paused ? 'warn' : ''}">${r.paused ? '일시중지' : '이용 중'}</span></div></a>`).join('')
    || `<div class="empty">${data.sops.length ? '조건에 맞는 소비자가 없어요' : 'SOP는 소비자 카드에서 추가할 수 있어요'}</div>`}</div>
  ${churn.length ? `<div class="sec"><h2>최근 해지 <small>다시 연락할 대상</small></h2></div>
  <div class="card list">${churn.map(s => `<a class="person" href="#/c/${s.customerId}"><div class="info"><div class="nm">${esc(custName(s.customerId))}</div>
    <div class="sub">${esc(L.sopName(s))}${s.endReason ? ' · 사유: ' + esc(s.endReason) : ''}</div></div><div class="rt">${L.dotDate(s.endedAt)} 해지</div></a>`).join('')}</div>` : ''}`;
};

// ───────── 제품별 구매자 조회 ─────────
SCREENS.buyers = () => {
  const data = D(), pm = L.productMap(data);
  const bought = [...new Set(data.purchases.map(p => p.productId))].filter(id => pm[id]).sort((a, b) => korSort(pm[a].n, pm[b].n));
  if (!bought.includes(ui.buyersProduct)) ui.buyersProduct = bought.find(id => pm[id].f) || bought[0] || '';
  const prod = pm[ui.buyersProduct];
  const ps = data.purchases.filter(p => p.productId === ui.buyersProduct);
  const months = [...new Set(ps.map(p => L.ym(p.date)))].sort().reverse();
  if (!months.includes(ui.buyersMonth)) ui.buyersMonth = months[0] || '';
  const list = ps.filter(p => L.ym(p.date) === ui.buyersMonth).sort((a, b) => a.date.localeCompare(b.date));
  const nextLabel = prod?.f ? '다음 교체' : '다 드실 때';
  const days = prod && !prod.f ? L.daysOf(prod) : null;
  return `
  <a class="back" href="#/home">${ic('left')}홈</a>
  <div class="top"><h1>제품별 구매자 조회</h1></div>
  ${bought.length ? `
  <div class="two">
    ${fld('제품', `<select class="in" data-on="buyers-product">${bought.map(id => opt(id, ui.buyersProduct, pm[id].n)).join('')}</select>`)}
    ${fld('구매 월', `<select class="in" data-on="buyers-month">${months.map(m => opt(m, ui.buyersMonth, `${m.slice(0, 4)}년 ${Number(m.slice(5))}월`)).join('')}</select>`)}
  </div>
  <div class="sec" style="margin-top:6px"><h2>이 달 구매자 ${list.length}명</h2><span class="r">${prod?.f ? `교체 주기 ${prod.f.months}개월` : days ? `1통 약 ${days}일분` : ''}</span></div>
  <div class="card list">${list.map(p => {
    const nx = L.nextDateForPurchase(data, p, prod);
    return `<a class="person" href="#/c/${p.customerId}"><div class="info"><div class="nm">${esc(custName(p.customerId))}</div><div class="sub">구매 ${L.mmdd(p.date)} · ${p.quantity || 1}개</div></div>
      ${nx ? `<div class="rt"><span>${nextLabel}</span><b style="color:var(--accent);font-size:16px">${L.dotDate(nx)}</b></div>` : ''}</a>`;
  }).join('')}</div>
  ${prod?.f || days ? `<div class="notice">${ic('bell')}<span>이 분들은 ${prod?.f ? `다음 교체 예정일 ${D().settings.leadFilter}일 전` : `다 드시기 ${D().settings.leadRefill}일 전`}에 홈의 할 일로 알려드려요.</span></div>` : ''}
  <button class="btn pri block" data-act="bulk-msg" style="min-height:54px">구매자에게 일괄 안내 보내기</button>`
  : `<div class="card empty">아직 구매 기록이 없어요.<br>소비자 카드의 '최근 구매'에서 기록할 수 있어요.</div>`}`;
};

// ───────── 관심 항목별 소비자 ─────────
SCREENS.interests = () => {
  const data = D();
  const used = [...new Set(data.interests.map(i => i.category))];
  const cats = [...data.settings.interestCats.filter(c => used.includes(c)), ...used.filter(c => !data.settings.interestCats.includes(c))];
  if (!cats.includes(ui.interestCat)) ui.interestCat = cats[0] || '';
  const list = ui.interestCat ? L.customersByInterest(data, ui.interestCat, ui.interestOnly) : [];
  const pm = L.productMap(data);
  return `
  <a class="back" href="#/home">${ic('left')}홈</a>
  <div class="top"><h1>관심 항목별 소비자</h1></div>
  ${cats.length ? `
  <div class="chips">${cats.map(c => `<button class="chip ${ui.interestCat === c ? 'on' : ''}" data-act="interest-cat" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <div class="card toggle" data-act="interest-only"><div><b>관련 제품 아직 안 산 소비자만</b></div><span class="cbox ${ui.interestOnly ? 'on' : ''}">${ui.interestOnly ? ic('check') : ''}</span></div>
  <div class="sec"><h2>${esc(ui.interestCat)} 관심 소비자</h2><span class="r">${list.length}명</span></div>
  ${list.map(x => `<div class="card fcard">
    <div class="l1"><b>${esc(x.customer.name)} <span class="loc">· ${x.interest.rank}순위</span></b>${x.bought ? '<span class="badge sm">구매함</span>' : '<span class="badge sm warn">미구매</span>'}</div>
    ${x.interest.memo ? `<div class="l2">${esc(x.interest.memo)}</div>` : ''}
    <div class="l3"><span class="small muted">${x.lastIntro ? `${L.mmdd(x.lastIntro.date)} ${esc(pm[x.lastIntro.productId]?.n || '')} ${esc(x.lastIntro.method)}` : '소개 이력 없음'}</span>
      <button class="btn sm out" data-act="intro-new" data-id="${x.customer.id}" data-cat="${esc(ui.interestCat)}">소개 기록</button></div>
  </div>`).join('') || `<div class="card empty">${ui.interestOnly ? '모두 관련 제품을 구매했어요' : '이 관심사를 가진 소비자가 없어요'}</div>`}`
  : `<div class="card empty">소비자 카드에서 관심 항목을 기록하면 여기에 모여요</div>`}`;
};

// ───────── 설정 ─────────
const LIST_EDIT = [['sopItems', '일반 SOP 품목'], ['interestCats', '관심 분류'], ['grades', '소비자 구분'], ['contactMethods', '연락 방법']];
SCREENS.settings = () => {
  const s = D().settings;
  const num = (k, label, unit) => `<div class="item" style="cursor:default"><div class="info"><b>${label}</b></div>
    <input class="in" style="width:84px;text-align:right" type="number" inputmode="numeric" min="0" max="365" value="${s[k]}" data-on="setting-num" data-k="${k}"><span class="muted">${unit}</span></div>`;
  return `
  <a class="back" href="#/home">${ic('left')}홈</a>
  <div class="top"><h1>설정</h1></div>
  <div class="sec" style="margin-top:4px"><h2>알림 시작 시점</h2></div>
  <div class="card list">
    ${num('leadFilter', '필터 교체 예정일', '일 전')}
    ${num('leadSop', 'SOP 결제일', '일 전')}
    ${num('introFollow', '소개 후 반응 확인', '일 뒤')}
    ${num('sopChurn', 'SOP 해지 후 근황 연락', '일 뒤')}
    ${num('leadRefill', '영양제 다 드시기', '일 전')}
  </div>
  <div class="sec"><h2>목록 편집</h2></div>
  ${LIST_EDIT.map(([k, label]) => `<div class="card pad" style="margin-bottom:10px"><b>${label}</b>
    <div class="chips" style="margin:10px 0">${s[k].map(v => `<button class="chip sm" data-act="set-del" data-k="${k}" data-v="${esc(v)}">${esc(v)} <span class="x">${ic('x')}</span></button>`).join('')}</div>
    <div style="display:flex;gap:8px"><input class="in" id="add-${k}" placeholder="새 항목"><button class="btn" data-act="set-add" data-k="${k}">추가</button></div></div>`).join('')}
  <div class="sec"><h2>제품</h2></div>
  <a class="card item" href="#/products"><div class="info"><b>제품 목록 관리</b><span class="sub">필터 교체 주기, 관심 분류 연결, 제품 직접 추가</span></div>${ic('right')}</a>
  <div class="sec"><h2>데이터 백업</h2></div>
  <div class="notice">${ic('info')}<span>소비자 정보는 이 휴대폰 안에만 저장돼요. 휴대폰을 바꾸거나 앱을 지우기 전에 꼭 내보내기 해 두세요.</span></div>
  <div class="row-btns"><button class="btn pri" data-act="export">내보내기</button><label class="btn" style="cursor:pointer">가져오기<input type="file" accept="application/json,.json" data-on="import" hidden></label></div>
  <div class="sec"><h2>기타</h2></div>
  <div class="row-btns">${D().customers.length ? '' : '<button class="btn" data-act="load-sample">예시 데이터 넣기</button>'}<button class="btn danger" data-act="reset-all">모든 데이터 지우기</button></div>
  <p class="foot-note">카탈로그 「The Choice」 Autumn 2026 Vol.75 기준. 문자·카톡은 앱이 자동으로 보내지 않고, 문구를 복사하거나 공유 창을 열어 드려요.</p>`;
};

// ───────── 제품 관리 ─────────
SCREENS.products = () => `
  <a class="back" href="#/settings">${ic('left')}설정</a>
  <div class="top"><div><h1>제품 목록 관리</h1></div><button class="round" data-act="product-new" aria-label="제품 추가">${ic('plus')}</button></div>
  <div class="notice w">${ic('info')}<span>소개 문구는 회사 공식 자료 기준으로 입력하세요. 건강기능식품은 효능 표현에 법적 제한이 있어요.</span></div>
  <label class="search">${ic('search')}<input data-live="prodQ" type="search" placeholder="제품 이름 검색" value="${esc(ui.prodQ)}"></label>
  <div id="live">${LIVE.products()}</div>`;
LIVE.products = () => {
  const q = ui.prodQ.replace(/\s/g, '');
  const ps = L.allProducts(D()).filter(p => !q || p.n.replace(/\s/g, '').includes(q))
    .sort((a, b) => (b.custom ? 2 : b.f ? 1 : 0) - (a.custom ? 2 : a.f ? 1 : 0));
  return `<div class="card list" style="margin-top:12px">${ps.slice(0, q ? 60 : 30).map(p => `
    <div class="item" data-act="product-edit" data-id="${esc(p.id)}"><div class="info"><b>${esc(p.n)}</b>
      <span class="sub">${p.custom ? '직접 추가 · ' : ''}${p.f ? `${esc(p.f.for)} 필터 · 교체 주기 ${p.f.months}개월` : esc(CATEGORIES[p.c]?.label || '')} · ${won(p.p)}</span></div>${ic('right')}</div>`).join('')}</div>
  ${!q ? '<p class="foot-note">필터와 직접 추가한 제품이 먼저 보여요. 다른 제품은 검색하세요.</p>' : ''}`;
};

// ───────── 제품 가이드 ─────────
const G = ui.guide;
function pickLines() {
  const pm = L.productMap(D());
  return Object.entries(picks).map(([k, q]) => {
    const i = k.lastIndexOf('|'); const id = k.slice(0, i), vi = +k.slice(i + 1);
    const p = pm[id]; if (!p) return null;
    return { k, p, vi, v: L.variants(p)[vi] || L.variants(p)[0], q };
  }).filter(Boolean);
}
const pickedKey = p => Object.keys(picks).find(k => k.slice(0, k.lastIndexOf('|')) === p.id);
function doseBlock(p, v) {
  if (!p.h) return '';
  const d = L.daysOf(p, v);
  return `<div class="dose"><b>섭취 방법</b>${esc(p.h)}${d ? `<span class="days">1통 약 ${d}일분 · 하루 약 ${won(Math.round(v.p / d / 10) * 10)}</span>` : ''}</div>`;
}
function gcard(p, why) {
  const vs = L.variants(p), k = pickedKey(p), vi = k ? +k.slice(k.lastIndexOf('|') + 1) : 0, cur = vs[vi] || vs[0];
  return `<div class="card gcard ${k ? 'sel' : ''}">
    <div class="meta"><span>${CATEGORIES[p.c]?.label || ''} · ${esc(p.s || '')}</span><span>${p.pg ? `카탈로그 p.${p.pg}` : '직접 추가'}</span></div>
    <h3>${esc(p.n)}</h3>${p.d ? `<p class="desc">${esc(p.d)}</p>` : ''}
    ${why?.length ? `<div class="why">${why.map(w => `<span class="badge sm">${esc(w)}</span>`).join('')}</div>` : ''}
    <div class="price">${won(cur.p)}<span class="size">${esc(cur.z || '')}</span></div>
    ${doseBlock(p, cur)}
    ${vs.length > 1 ? `<select class="in" data-on="g-variant" data-id="${esc(p.id)}" style="min-height:44px;font-size:15px">${vs.map((v, i) => opt(i, vi, `${v.z} · ${won(v.p)}`)).join('')}</select>` : ''}
    ${p.m ? `<div class="monthly">${esc(p.m)}</div>` : ''}
    <button class="btn ${k ? 'pri' : 'out'}" data-act="g-pick" data-id="${esc(p.id)}">${k ? '선택됨' : '+ 선택'}</button>
  </div>`;
}
function guideRecommend() {
  const age = parseInt(G.age, 10), budget = +G.budget || Infinity;
  if (!G.concerns.size) return `<div class="card empty">고민·증상을 하나 이상 선택해 주세요</div>`;
  const res = [];
  for (const p of L.allProducts(D())) {
    if (p.f) continue;
    if (G.cats.size && !G.cats.has(p.c)) continue;
    if (p.g && G.gender && p.g !== G.gender) continue;
    if (p.a && !isNaN(age) && (age < p.a[0] || age > p.a[1])) continue;
    if (p.p > budget) continue;
    const hit = (p.t || []).filter(t => G.concerns.has(t));
    if (!hit.length) continue;
    let score = hit.length * 10 - (p.t || []).length;
    const why = hit.map(t => LABEL[t]);
    if (p.a && !isNaN(age)) { score += 3; why.push(age < 13 ? '어린이 적합' : age < 20 ? '청소년 적합' : `${Math.floor(age / 10) * 10}대 적합`); }
    if (p.g && G.gender) { score += 2; why.push(p.g === 'F' ? '여성용' : '남성용'); }
    res.push({ p, score, why });
  }
  res.sort((a, b) => b.score - a.score || a.p.p - b.p.p);
  const byCat = {};
  res.forEach(r => (byCat[r.p.c] ||= []).push(r));
  const parts = Object.keys(CATEGORIES).filter(k => byCat[k]).map(k => `
    <div class="sec"><h2>${CATEGORIES[k].label}</h2><span class="r">${byCat[k].length}개</span></div>${byCat[k].map(r => gcard(r.p, r.why)).join('')}`);
  return parts.join('') || `<div class="card empty">조건에 맞는 제품이 없어요. 예산이나 분야를 넓혀 보세요.</div>`;
}
SCREENS.guide = () => {
  const lines = pickLines();
  const head = `<div class="top"><h1>제품 가이드</h1></div>
  <div class="seg" style="margin-top:0">${[['rec', '추천 받기'], ['all', '전체 제품'], ['dose', '섭취 방법']].map(([k, l]) =>
    `<button class="${G.sub === k ? 'on' : ''}" data-act="g-sub" data-v="${k}">${l}</button>`).join('')}</div>`;
  const bar = lines.length ? `<div class="selbar"><div class="in-bar"><div class="sum">선택 <b>${lines.reduce((s, l) => s + l.q, 0)}</b>개 · <b>${won(lines.reduce((s, l) => s + l.v.p * l.q, 0))}</b></div>
    <button class="btn pri" data-act="g-sheet">선택 목록</button></div></div>` : '';
  if (G.sub === 'rec') return head + `
    <div class="card pad" style="margin-top:14px">
      <div class="two">
        ${fld('나이', `<input class="in" type="number" inputmode="numeric" min="0" max="110" placeholder="예: 45" value="${esc(G.age)}" data-bind="age">`)}
        ${fld('예산(1개당)', `<select class="in" data-on="g-budget">${[['', '제한 없음'], ['30000', '3만 원 이하'], ['50000', '5만 원 이하'], ['100000', '10만 원 이하'], ['300000', '30만 원 이하'], ['1000000', '100만 원 이하']].map(([v, l]) => opt(v, G.budget, l)).join('')}</select>`)}
      </div>
      <span class="grp-title" style="margin-top:0">성별</span>
      <div class="chips">${[['F', '여성'], ['M', '남성']].map(([v, l]) => `<button class="chip sm soft ${G.gender === v ? 'on' : ''}" data-act="g-gender" data-v="${v}">${l}</button>`).join('')}</div>
      <span class="grp-title">관심 분야 (선택 안 하면 전체)</span>
      <div class="chips">${Object.entries(CATEGORIES).map(([k, c]) => `<button class="chip sm soft ${G.cats.has(k) ? 'on' : ''}" data-act="g-cat" data-v="${k}">${c.label}</button>`).join('')}</div>
    </div>
    <div class="card pad" style="margin-top:10px">
      <b style="font-size:16px">고민·증상</b>
      ${CONCERNS.map(g => `<span class="grp-title">${g.group}</span><div class="chips">${g.items.map(([k, l]) =>
        `<button class="chip sm soft ${G.concerns.has(k) ? 'on' : ''}" data-act="g-concern" data-v="${k}">${l}</button>`).join('')}</div>`).join('')}
      <div class="row-btns" style="margin-top:16px"><button class="btn" data-act="g-reset">초기화</button><button class="btn pri" data-act="g-run" style="flex:2">추천 보기</button></div>
    </div>
    <div id="g-out">${G.ran ? guideRecommend() : ''}</div>
    <p class="foot-note">가격은 카탈로그 게재 기준이며 변동될 수 있어요. 건강기능식품은 질병의 예방·치료를 위한 의약품이 아니에요.</p>${bar}`;
  if (G.sub === 'all') return head + `
    <label class="search" style="margin-top:14px">${ic('search')}<input data-live="gq" type="search" placeholder="제품명 검색 (예: 오메가, 샴푸)" value="${esc(G.q)}"></label>
    <div class="two" style="margin-top:10px">
      <select class="in" data-on="g-fc">${opt('', G.fc, '전체 분야')}${Object.entries(CATEGORIES).map(([k, c]) => opt(k, G.fc, c.label)).join('')}</select>
      <select class="in" data-on="g-sort">${[['pg', '카탈로그 순'], ['low', '낮은 가격순'], ['high', '높은 가격순']].map(([v, l]) => opt(v, G.sort, l)).join('')}</select>
    </div>
    <div id="live">${LIVE.guide()}</div>${bar}`;
  return head + `
    <label class="search" style="margin-top:14px">${ic('search')}<input data-live="gdq" type="search" placeholder="영양제 이름 검색" value="${esc(G.dq)}"></label>
    <div id="live">${LIVE.guide()}</div>${bar}`;
};
LIVE.guide = () => {
  const all = L.allProducts(D());
  if (G.sub === 'all') {
    const q = G.q.replace(/\s/g, '');
    let list = all.filter(p => (!G.fc || p.c === G.fc) && (!q || (p.n + (p.s || '') + (p.d || '')).replace(/\s/g, '').includes(q)));
    if (G.sort === 'low') list = [...list].sort((a, b) => a.p - b.p);
    if (G.sort === 'high') list = [...list].sort((a, b) => b.p - a.p);
    return `<div class="sec"><h2>전체 제품</h2><span class="r">${list.length}개</span></div>${list.slice(0, 80).map(p => gcard(p)).join('')}
      ${list.length > 80 ? '<p class="foot-note">80개까지 보여요. 검색어나 분야로 좁혀 보세요.</p>' : ''}${list.length ? '' : '<div class="card empty">검색 결과가 없어요</div>'}`;
  }
  const q = G.dq.replace(/\s/g, '');
  const list = all.filter(p => p.h && (!q || p.n.replace(/\s/g, '').includes(q)));
  return `<div class="sec"><h2>영양제 섭취 방법</h2><span class="r">${list.length}개</span></div>
  <div class="card list">${list.map(p => {
    const dts = L.variants(p).map(v => { const d = L.daysOf(p, v); return d ? `${v.z} → 약 ${d}일` : ''; }).filter(Boolean);
    return `<div class="item" style="cursor:default;display:block"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(p.n)}</b><span class="small muted">p.${p.pg}</span></div>
      <div style="font-size:14px;margin-top:3px">${esc(p.h)}</div>${dts.length ? `<div class="small muted">${esc(dts.join(' · '))}</div>` : ''}</div>`;
  }).join('') || '<div class="empty">검색 결과가 없어요</div>'}</div>`;
};

// ───────── 시트(입력 창) ─────────
let sheetCtx = null, sheetOpen = false, afterClose = null;
function openSheet(html, ctx = {}) {
  closeSheetNow();
  sheetCtx = ctx;
  const w = document.createElement('div');
  w.className = 'sheet-wrap'; w.id = 'sheet';
  w.innerHTML = `<div class="sheet-bg" data-act="close-sheet"></div><form class="sheet" novalidate data-form="${ctx.form || ''}"><div class="grip"></div>${html}</form>`;
  document.body.appendChild(w);
  document.body.style.overflow = 'hidden';
  if (!sheetOpen) history.pushState({ sheet: true }, '');
  sheetOpen = true;
}
function closeSheetNow() {
  $('#sheet')?.remove();
  document.body.style.overflow = '';
}
function closeSheet(then) {
  afterClose = then || null;
  if (sheetOpen) history.back(); else { closeSheetNow(); render(); }
}
addEventListener('popstate', () => {
  if (sheetOpen) {
    sheetOpen = false; closeSheetNow();
    const f = afterClose; afterClose = null;
    if (f) f(); else render();
  }
});
const sheetForm = () => $('#sheet form');
const val = name => sheetForm()?.elements[name]?.value?.trim() ?? '';
const checked = name => !!sheetForm()?.elements[name]?.checked;
const foot = (saveLabel = '저장', extra = '') => `<div class="foot">${extra}<button type="button" class="btn" data-act="close-sheet">취소</button><button type="submit" class="btn pri">${saveLabel}</button></div>`;
const mdSelects = (prefix, md) => {
  const [m, d] = (md || '').split('-');
  return `<div class="two"><select class="in" name="${prefix}M">${opt('', m, '월')}${Array.from({ length: 12 }, (_, i) => opt(String(i + 1).padStart(2, '0'), m, `${i + 1}월`)).join('')}</select>
    <select class="in" name="${prefix}D">${opt('', d, '일')}${Array.from({ length: 31 }, (_, i) => opt(String(i + 1).padStart(2, '0'), d, `${i + 1}일`)).join('')}</select></div>`;
};
const readMd = prefix => { const m = val(prefix + 'M'), d = val(prefix + 'D'); return m && d ? `${m}-${d}` : ''; };

// 제품 고르기 (검색해서 선택)
function productPicker(selectedId) {
  const p = selectedId ? L.productMap(D())[selectedId] : null;
  return `${fld('제품', `<input class="in" data-live="pp" type="search" placeholder="제품 이름 검색" value="${esc(p?.n || '')}" autocomplete="off">`, true)}
    <input type="hidden" name="productId" value="${esc(selectedId || '')}"><div id="pp-list" style="margin:-8px 0 14px"></div>`;
}
function ppList(q) {
  q = q.replace(/\s/g, '');
  let ps = L.allProducts(D());
  if (sheetCtx.ppFilter) ps = ps.filter(sheetCtx.ppFilter);
  if (q) ps = ps.filter(p => p.n.replace(/\s/g, '').includes(q));
  else if (!sheetCtx.ppFilter) return '';
  return `<div class="card list">${ps.slice(0, 8).map(p => `<button type="button" class="item" style="width:100%;background:none;border-left:0;border-right:0;border-bottom:0;text-align:left" data-act="pp-pick" data-id="${esc(p.id)}">
    <div class="info"><b>${esc(p.n)}</b><span class="sub">${won(p.p)}${p.z ? ' · ' + esc(p.z) : ''}</span></div></button>`).join('') || '<div class="empty">찾는 제품이 없어요</div>'}</div>`;
}

// ── 소비자 추가·수정 ──
function customerSheet(c) {
  const s = D().settings, a = c?.anniversaries || [];
  openSheet(`<h3>${c ? '소비자 정보 수정' : '새 소비자'}</h3><p class="lead">이름과 개인정보 저장 동의만 있으면 저장돼요</p>
    ${fld('이름', `<input class="in" name="name" value="${esc(c?.name)}" autocomplete="off">`, true)}
    ${fld('연락처', `<input class="in" name="phone" type="tel" inputmode="tel" placeholder="010-0000-0000" value="${esc(c?.phone)}">`)}
    <div class="two">
      ${fld('구분', `<select class="in" name="grade">${s.grades.map(g => opt(g, c?.grade || '소비자')).join('')}</select>`)}
      ${fld('성별', `<select class="in" name="gender">${opt('', c?.gender, '선택 안 함')}${opt('F', c?.gender, '여성')}${opt('M', c?.gender, '남성')}</select>`)}
    </div>
    <div class="fld"><span>생일</span>${mdSelects('bd', c?.birthday)}</div>
    ${fld('태어난 해 (제품 추천에 사용, 선택)', `<input class="in" name="birthYear" type="number" inputmode="numeric" placeholder="예: 1980" value="${esc(c?.birthYear)}">`)}
    ${fld('소개자', `<input class="in" name="referrer" value="${esc(c?.referrer)}">`)}
    ${fld('가족 구성', `<input class="in" name="family" placeholder="예: 초등학생 자녀 1명" value="${esc(c?.family)}">`)}
    ${[0, 1].map(i => `<div class="fld"><span>기념일 ${i + 1}</span><input class="in" name="an${i}L" placeholder="예: 결혼기념일" value="${esc(a[i]?.label)}" style="margin-bottom:6px">${mdSelects('an' + i, a[i]?.date)}</div>`).join('')}
    ${fld('메모', `<textarea class="in" name="memo">${esc(c?.memo)}</textarea>`)}
    <label class="check"><input type="checkbox" name="consent" ${c?.consentAt ? 'checked' : ''}> 개인정보 저장 동의를 받았어요 ${c?.consentAt ? `<span class="small muted">(${L.dotDate(c.consentAt)})</span>` : ''}</label>
    ${c ? `<button type="button" class="btn danger block" data-act="customer-del" data-id="${c.id}" style="margin-top:8px">이 소비자 삭제</button>` : ''}
    ${foot()}`, { form: 'customer', id: c?.id });
}
const FORMS = {};
FORMS.customer = () => {
  const name = val('name');
  if (!name) return toast('이름을 입력해 주세요');
  if (!checked('consent')) return toast('개인정보 저장 동의를 받은 뒤 체크해 주세요');
  const old = sheetCtx.id ? byId('customers', sheetCtx.id) : null;
  const rec = {
    name, phone: val('phone'), grade: val('grade'), gender: val('gender'), birthYear: val('birthYear'),
    birthday: readMd('bd'), referrer: val('referrer'), family: val('family'), memo: val('memo'),
    anniversaries: [0, 1].map(i => ({ label: val(`an${i}L`), date: readMd('an' + i) })).filter(x => x.date),
    consentAt: old?.consentAt || today(),
  };
  if (old) { store.update('customers', old.id, rec); closeSheet(); toast('저장했어요'); }
  else { const c = store.add('customers', rec); closeSheet(() => go('c/' + c.id)); toast('새 소비자를 추가했어요'); }
};

// ── 메모 ──
function memoSheet(c) {
  openSheet(`<h3>${esc(c.name)} 메모</h3><p class="lead">상담 내용, 취향 등을 자유롭게 적어 두세요</p>
    ${fld('메모', `<textarea class="in" name="memo" style="min-height:160px">${esc(c.memo)}</textarea>`)}${foot()}`, { form: 'memo', id: c.id });
}
FORMS.memo = () => { store.update('customers', sheetCtx.id, { memo: val('memo') }); closeSheet(); toast('저장했어요'); };

// ── 관심 항목 ──
function interestsSheet(cid) {
  const rows = D().interests.filter(i => i.customerId === cid).sort((a, b) => a.rank - b.rank).map(i => ({ ...i }));
  if (!rows.length) rows.push({ category: '', memo: '', source: '직접 들음' });
  openSheet(`<h3>관심 항목 Top 5</h3><p class="lead">위에 있을수록 순위가 높아요. 화살표로 순서를 바꿀 수 있어요.</p>
    <div id="ir-rows"></div>${foot()}`, { form: 'interests', id: cid, rows });
  drawInterestRows();
}
function drawInterestRows() {
  const s = D().settings, rows = sheetCtx.rows;
  const cats = [...s.interestCats];
  $('#ir-rows').innerHTML = rows.map((r, i) => {
    const custom = r.category && !cats.includes(r.category);
    return `<div class="irow" data-i="${i}">
      <div class="hd"><span class="rank">${i + 1}</span><span class="sp"></span>
        <button type="button" class="icon-btn" data-act="ir-move" data-i="${i}" data-d="-1" ${i ? '' : 'disabled'} aria-label="위로">${ic('up')}</button>
        <button type="button" class="icon-btn" data-act="ir-move" data-i="${i}" data-d="1" ${i < rows.length - 1 ? '' : 'disabled'} aria-label="아래로">${ic('down')}</button>
        <button type="button" class="icon-btn" data-act="ir-del" data-i="${i}" aria-label="삭제">${ic('x')}</button></div>
      <select class="in" name="cat${i}" data-on="ir-cat" style="margin-bottom:8px">${opt('', r.category, '관심 분류 선택')}${cats.map(c => opt(c, custom ? '__c' : r.category)).join('')}${opt('__c', custom ? '__c' : '', '기타(직접 입력)')}</select>
      <input class="in" name="custom${i}" placeholder="관심 분류 직접 입력" value="${esc(custom ? r.category : '')}" style="margin-bottom:8px;${custom ? '' : 'display:none'}">
      <input class="in" name="memo${i}" placeholder="메모 (예: 건성, 겨울철에 특히 고민)" value="${esc(r.memo)}" style="margin-bottom:8px">
      <div class="chips">${['직접 들음', '구매로 추정'].map(src => `<label class="chip sm soft ${r.source === src ? 'on' : ''}"><input type="radio" name="src${i}" value="${src}" ${r.source === src ? 'checked' : ''} hidden data-on="ir-src">${src}</label>`).join('')}</div>
    </div>`;
  }).join('') + (rows.length < 5 ? `<button type="button" class="add-link card" data-act="ir-add">${ic('plus')}관심 항목 추가</button>` : '');
}
function syncInterestRows() {
  sheetCtx.rows.forEach((r, i) => {
    const sel = val('cat' + i);
    r.category = sel === '__c' ? val('custom' + i) : sel;
    r.memo = val('memo' + i);
    r.source = sheetForm().elements['src' + i]?.value || r.source;
  });
}
FORMS.interests = () => {
  syncInterestRows();
  const rows = sheetCtx.rows.filter(r => r.category);
  const td = today(), cid = sheetCtx.id;
  const old = Object.fromEntries(D().interests.filter(i => i.customerId === cid).map(i => [i.id, i]));
  store.removeWhere('interests', i => i.customerId === cid);
  rows.forEach((r, i) => {
    const o = r.id && old[r.id];
    const same = o && o.category === r.category && o.memo === r.memo && o.source === r.source;
    store.add('interests', { customerId: cid, rank: i + 1, category: r.category, memo: r.memo, source: r.source, updatedAt: same ? o.updatedAt : td });
  });
  closeSheet(); toast('관심 항목을 저장했어요');
};

// ── 구매 기록 ──
function purchaseSheet(cid, rec, preset = {}) {
  const p0 = rec || { date: today(), quantity: 1, ...preset };
  openSheet(`<h3>${rec ? '구매 기록 수정' : '구매 기록'}</h3><p class="lead">${esc(custName(cid))}</p>
    ${productPicker(p0.productId)}
    <div id="pc-extra"></div>
    <div class="two">
      ${fld('구매일', `<input class="in" type="date" name="date" value="${esc(p0.date)}">`, true)}
      ${fld('수량', `<input class="in" type="number" inputmode="numeric" min="1" name="quantity" value="${esc(p0.quantity || 1)}" data-on="pc-amount">`)}
    </div>
    ${fld('금액 (선택)', `<input class="in" type="number" inputmode="numeric" name="amount" value="${esc(p0.amount ?? '')}" data-on="pc-touch">`)}
    <div class="two">
      ${fld('PV (선택)', `<input class="in" type="number" inputmode="numeric" name="pv" value="${esc(p0.pv ?? '')}">`)}
      ${fld('BV (선택)', `<input class="in" type="number" inputmode="numeric" name="bv" value="${esc(p0.bv ?? '')}">`)}
    </div>
    ${rec ? `<button type="button" class="btn danger block" data-act="purchase-del" data-id="${rec.id}">이 구매 기록 삭제</button>` : ''}
    ${foot()}`, { form: 'purchase', cid, id: rec?.id, rec: p0, amountTouched: rec?.amount != null, ppFilter: null });
  drawPurchaseExtra();
}
function drawPurchaseExtra() {
  const el = $('#pc-extra'); if (!el) return;
  const pid = val('productId'), p = L.productMap(D())[pid], r = sheetCtx.rec;
  if (!p) { el.innerHTML = ''; return; }
  const vs = L.variants(p);
  const devs = p.f ? D().devices.filter(d => d.customerId === sheetCtx.cid && d.kind === p.f.for) : [];
  const defDev = r.deviceId || devs.find(d => (d.filters || []).some(f => f.productId === pid))?.id || '';
  el.innerHTML = `
    ${vs.length > 1 ? fld('용량', `<select class="in" name="variant" data-on="pc-amount">${vs.map((v, i) => opt(i, r.variant || 0, `${v.z} · ${won(v.p)}`)).join('')}</select>`) : ''}
    ${p.f ? (devs.length ? fld('어느 기기용인가요?', `<select class="in" name="deviceId">${opt('', defDev, '선택 안 함')}${devs.map(d => opt(d.id, defDev, `${d.kind} · ${d.location || d.model || ''}`)).join('')}</select>`)
      : `<div class="notice w">${ic('info')}<span>이 소비자에게 등록된 ${p.f.for}가 없어요. 기기를 먼저 추가하면 교체 예정일을 계산해 드려요.</span></div>`) : ''}
    ${p.c === 'nutrition' ? `<label class="check"><input type="checkbox" name="viaSop" ${r.viaSop ? 'checked' : ''}> SOP(정기 구독)로 받는 제품이에요 <span class="small muted">재구매 알림 안 함</span></label>` : ''}`;
  setAutoAmount();
}
function setAutoAmount() {
  if (sheetCtx.amountTouched) return;
  const p = L.productMap(D())[val('productId')]; if (!p) return;
  const v = L.variants(p)[+val('variant') || 0] || L.variants(p)[0];
  const f = sheetForm().elements.amount;
  if (f) f.value = v.p * (+val('quantity') || 1);
}
FORMS.purchase = () => {
  const productId = val('productId');
  if (!productId) return toast('제품을 골라 주세요');
  const date = val('date'); if (!date) return toast('구매일을 입력해 주세요');
  const num = n => val(n) === '' ? null : Number(val(n));
  const rec = { customerId: sheetCtx.cid, productId, date, quantity: num('quantity') || 1, amount: num('amount'), pv: num('pv'), bv: num('bv'),
    variant: +val('variant') || 0, deviceId: val('deviceId') || null, viaSop: checked('viaSop') };
  if (sheetCtx.id) store.update('purchases', sheetCtx.id, rec); else store.add('purchases', rec);
  closeSheet(); toast('구매 기록을 저장했어요');
};

// ── 기기 ──
function deviceSheet(cid, dev) {
  const d0 = dev || { kind: '정수기', model: DEVICE_MODELS['정수기'][0], location: '', installedAt: '', filters: [] };
  openSheet(`<h3>${dev ? '기기 수정' : '기기 추가'}</h3><p class="lead">${esc(custName(cid))} · 기기마다 따로 관리해요</p>
    <div class="two">
      ${fld('종류', `<select class="in" name="kind" data-on="dev-kind">${Object.keys(DEVICE_MODELS).map(k => opt(k, d0.kind)).join('')}</select>`)}
      ${fld('설치 장소', `<input class="in" name="location" list="locs" placeholder="거실" value="${esc(d0.location)}"><datalist id="locs">${['거실', '주방', '안방', '아이 방', '사무실', '매장'].map(x => `<option value="${x}">`).join('')}</datalist>`)}
    </div>
    <div id="dev-model"></div>
    ${fld('설치일', `<input class="in" type="date" name="installedAt" value="${esc(d0.installedAt)}">`)}
    <div class="fld"><span>들어가는 필터와 마지막 교체일</span><div id="dev-filters"></div>
      <span class="small muted" style="font-weight:400">마지막 교체일을 모르면 비워 두세요. 설치일이나 이후 필터 구매 기록으로 계산해요.</span></div>
    <label class="check"><input type="checkbox" name="reminderOff" ${d0.reminderOff ? 'checked' : ''}> 이 기기는 교체 알림 끄기</label>
    ${dev ? `<button type="button" class="btn danger block" data-act="device-del" data-id="${dev.id}">이 기기 삭제</button>` : ''}
    ${foot()}`, { form: 'device', cid, id: dev?.id, dev: d0 });
  drawDeviceParts(true);
}
function drawDeviceParts(first) {
  const kind = val('kind'), d0 = sheetCtx.dev;
  const models = DEVICE_MODELS[kind] || [];
  const kindChanged = !first && sheetCtx.lastKind !== kind;
  const curModel = first ? d0.model : kindChanged ? models[0] : (val('model') || models[0]);
  const isOther = curModel && !models.includes(curModel);
  if (first || sheetCtx.lastKind !== kind) {
    $('#dev-model').innerHTML = fld('모델', `<select class="in" name="model" data-on="dev-model">${models.map(m => opt(m, isOther ? '' : curModel)).join('')}${opt('__o', isOther ? '__o' : '', '기타(직접 입력)')}</select>
      <input class="in" name="modelOther" placeholder="모델명" value="${esc(isOther ? curModel : '')}" style="margin-top:6px;${isOther ? '' : 'display:none'}">`);
    sheetCtx.lastKind = kind;
  }
  const model = val('model') === '__o' ? '' : val('model');
  const filters = L.allProducts(D()).filter(p => p.f && p.f.for === kind);
  const existing = Object.fromEntries((first ? d0.filters : []).map(f => [f.productId, f]));
  $('#dev-filters').innerHTML = `<div class="card list">${filters.map(p => {
    const on = first && d0.filters.length ? !!existing[p.id] : (p.f.fits || []).includes(model);
    return `<div style="padding:10px 12px"><label class="check" style="min-height:40px"><input type="checkbox" name="f:${esc(p.id)}" ${on ? 'checked' : ''}>
      <span><b style="font-weight:600">${esc(p.n)}</b><br><span class="small muted">${p.f.months}개월마다 · ${won(p.p)}</span></span></label>
      <input class="in" type="date" name="d:${esc(p.id)}" value="${esc(existing[p.id]?.lastReplacedAt || '')}" aria-label="마지막 교체일" style="min-height:44px"></div>`;
  }).join('') || '<div class="empty">이 종류의 필터 제품이 없어요. 제품 관리에서 추가하세요.</div>'}</div>`;
}
FORMS.device = () => {
  const f = sheetForm();
  const kind = val('kind');
  const model = val('model') === '__o' ? val('modelOther') : val('model');
  const filters = L.allProducts(D()).filter(p => p.f && p.f.for === kind && f.elements['f:' + p.id]?.checked)
    .map(p => ({ productId: p.id, lastReplacedAt: f.elements['d:' + p.id]?.value || '' }));
  if (!filters.length) return toast('들어가는 필터를 하나 이상 골라 주세요');
  const rec = { customerId: sheetCtx.cid, kind, model, location: val('location'), installedAt: val('installedAt'), filters, reminderOff: checked('reminderOff') };
  if (!rec.installedAt && !filters.some(x => x.lastReplacedAt) && !D().purchases.some(p => p.deviceId === sheetCtx.id)) {
    toast('설치일이나 마지막 교체일을 넣어야 교체 예정일을 계산할 수 있어요');
  }
  if (sheetCtx.id) store.update('devices', sheetCtx.id, rec); else store.add('devices', rec);
  closeSheet(); toast('기기를 저장했어요');
};

// ── SOP ──
function sopSheet(cid, sop, preset = {}) {
  const s = D().settings;
  const s0 = sop || { type: '일반 SOP', item: s.sopItems[0], startDate: today(), cycle: '매월', payDay: Number(today().slice(8)), status: '이용 중', ...preset };
  const customItem = s0.item && !s.sopItems.includes(s0.item);
  openSheet(`<h3>${sop ? 'SOP 수정' : 'SOP 추가'}</h3><p class="lead">${esc(custName(cid))}</p>
    <div class="two">
      ${fld('SOP 종류', `<select class="in" name="type" data-on="sop-type">${s.sopTypes.map(t => opt(t, s0.type)).join('')}</select>`)}
      <div id="sop-item" style="${s0.type === '일반 SOP' ? '' : 'display:none'}">${fld('품목', `<select class="in" name="item" data-on="sop-item">${s.sopItems.map(t => opt(t, customItem ? '__c' : s0.item)).join('')}${opt('__c', customItem ? '__c' : '', '기타(직접 입력)')}</select>`)}</div>
    </div>
    <input class="in" name="itemCustom" placeholder="품목 직접 입력" value="${esc(customItem ? s0.item : '')}" style="margin:-6px 0 14px;${customItem && s0.type === '일반 SOP' ? '' : 'display:none'}">
    <div class="two">
      ${fld('시작일', `<input class="in" type="date" name="startDate" value="${esc(s0.startDate)}">`)}
      ${fld('결제 주기', `<select class="in" name="cycle">${s.sopCycles.map(t => opt(t, s0.cycle)).join('')}</select>`)}
    </div>
    <div class="two">
      ${fld('결제일', `<select class="in" name="payDay">${Array.from({ length: 31 }, (_, i) => opt(i + 1, s0.payDay, `매 ${i + 1}일`)).join('')}</select>`)}
      ${fld('상태', `<select class="in" name="status" data-on="sop-status">${['이용 중', '일시중지', '해지'].map(t => opt(t, s0.status)).join('')}</select>`)}
    </div>
    <div id="sop-end" style="${s0.status === '해지' ? '' : 'display:none'}">
      <div class="two">${fld('해지일', `<input class="in" type="date" name="endedAt" value="${esc(s0.endedAt || today())}">`)}
      ${fld('해지 사유', `<input class="in" name="endReason" placeholder="예: 사용량 남음" value="${esc(s0.endReason)}">`)}</div>
    </div>
    ${sop ? `<button type="button" class="btn danger block" data-act="sop-del" data-id="${sop.id}">이 SOP 기록 삭제</button>` : ''}
    ${foot()}`, { form: 'sop', cid, id: sop?.id });
}
FORMS.sop = () => {
  const type = val('type');
  const item = type === '일반 SOP' ? (val('item') === '__c' ? val('itemCustom') : val('item')) : '';
  if (type === '일반 SOP' && !item) return toast('품목을 입력해 주세요');
  const status = val('status');
  const rec = { customerId: sheetCtx.cid, type, item, startDate: val('startDate'), cycle: val('cycle'), payDay: Number(val('payDay')), status,
    endedAt: status === '해지' ? val('endedAt') : '', endReason: status === '해지' ? val('endReason') : '' };
  if (sheetCtx.id) store.update('sops', sheetCtx.id, rec); else store.add('sops', rec);
  closeSheet(); toast('SOP를 저장했어요');
};

// ── 소개 기록 ──
function introSheet(cid, intro, preset = {}) {
  const s = D().settings;
  const i0 = intro || { date: today(), method: '샘플', reaction: '미확인', ...preset };
  const cats = s.interestCats.includes(preset.cat) ? s.interestCats : [...s.interestCats, preset.cat];
  const filterFn = preset.cat ? (p => !p.f && L.productCats(p, cats).includes(preset.cat)) : null;
  openSheet(`<h3>${intro ? '소개 기록 수정' : '소개 기록'}</h3><p class="lead">${esc(custName(cid))}${preset.cat ? ` · ${esc(preset.cat)} 관련 제품` : ''}</p>
    ${productPicker(i0.productId)}
    <div class="two">
      ${fld('날짜', `<input class="in" type="date" name="date" value="${esc(i0.date)}">`)}
      ${fld('방법', `<select class="in" name="method">${s.introMethods.map(t => opt(t, i0.method)).join('')}</select>`)}
    </div>
    ${fld('반응', `<select class="in" name="reaction">${s.reactions.map(t => opt(t, i0.reaction)).join('')}</select>`)}
    ${intro ? `<label class="check"><input type="checkbox" name="followUpDone" ${i0.followUpDone ? 'checked' : ''}> 반응 확인 완료</label>
      <button type="button" class="btn danger block" data-act="intro-del" data-id="${intro.id}" style="margin-top:8px">이 소개 기록 삭제</button>` : ''}
    <p class="small muted">반응이 '미확인'이면 ${s.introFollow}일 뒤 홈에 '소개 후속' 할 일로 알려드려요.</p>
    ${foot()}`, { form: 'intro', cid, id: intro?.id, ppFilter: filterFn });
  if (filterFn) $('#pp-list').innerHTML = ppList('');
}
FORMS.intro = () => {
  const productId = val('productId');
  if (!productId) return toast('제품을 골라 주세요');
  const reaction = val('reaction');
  const rec = { customerId: sheetCtx.cid, productId, date: val('date') || today(), method: val('method'), reaction,
    followUpDone: sheetCtx.id ? checked('followUpDone') : reaction !== '미확인' };
  if (sheetCtx.id) store.update('intros', sheetCtx.id, rec); else store.add('intros', rec);
  closeSheet(); toast('소개 기록을 저장했어요');
};

// ── 할 일 처리 (완료·미루기) ──
function findTask(key) { return L.buildTasks(D(), today()).find(t => t.key === key); }
function taskSheet(key, fromFilter) {
  const t = findTask(key) || (fromFilter ? fromFilter : null);
  if (!t) return;
  const s = D().settings, c = byId('customers', t.customerId);
  const log = L.logMap(D())[key];
  const intro = t.introId ? byId('intros', t.introId) : null;
  const tomorrow = L.addDays(today(), 1);
  openSheet(`<h3>${esc(c?.name)} · ${esc(t.type)}</h3><p class="lead">${esc(t.text)}</p>
    ${c?.phone ? `<div class="row-btns" style="margin-bottom:14px"><a class="btn" href="${telHref(c.phone)}">${ic('phone')}전화</a><button type="button" class="btn" data-act="kakao" data-id="${c.id}">${ic('msg')}카톡</button></div>` : ''}
    <div class="fld"><span>연락 방법</span><div class="chips">${s.contactMethods.map(m => `<label class="chip sm soft ${log?.contactMethod === m ? 'on' : ''}"><input type="radio" name="method" value="${esc(m)}" hidden data-on="radio-chip" ${log?.contactMethod === m ? 'checked' : ''}>${esc(m)}</label>`).join('')}</div></div>
    ${fld('메모', `<input class="in" name="note" placeholder="예: 다음 달에 살게요" value="${esc(log?.note)}">`)}
    ${intro ? fld('소개 반응', `<select class="in" name="reaction">${s.reactions.map(r => opt(r, intro.reaction)).join('')}</select>`) : ''}
    <button type="submit" class="btn pri block">${log?.status === '완료' ? '완료 내용 저장' : '완료로 표시'}</button>
    ${log?.status === '완료' ? `<button type="button" class="btn block" data-act="task-undo" style="margin-top:8px">완료 취소</button>` : ''}
    <div class="sec" style="margin-top:22px"><h2>미루기</h2></div>
    <div class="chips" style="margin-bottom:10px">
      <button type="button" class="chip sm" data-act="snooze-pick" data-v="${tomorrow}">내일</button>
      <button type="button" class="chip sm" data-act="snooze-pick" data-v="${L.addDays(L.endOfWeek(today()), 1)}">다음 주</button>
      <button type="button" class="chip sm" data-act="snooze-pick" data-v="${L.addMonths(today(), 1)}">다음 달</button>
    </div>
    <div style="display:flex;gap:8px"><input class="in" type="date" name="snooze" value="${tomorrow}" min="${tomorrow}"><button type="button" class="btn" data-act="snooze">미루기</button></div>
    <p class="small muted">고른 날짜까지 목록에서 숨겨요.</p>
    <div class="foot"><button type="button" class="btn" data-act="close-sheet">닫기</button><button type="button" class="btn green-txt" data-act="sheet-go" data-to="c/${t.customerId}">소비자 카드</button></div>`,
  { form: 'task', key, introId: t.introId });
}
FORMS.task = () => {
  const f = sheetForm();
  store.setTaskLog(sheetCtx.key, { status: '완료', contactMethod: f.elements.method?.value || '', note: val('note'), doneAt: today() + 'T' + new Date().toTimeString().slice(0, 8) });
  if (sheetCtx.introId) store.update('intros', sheetCtx.introId, { reaction: val('reaction') || '미확인', followUpDone: true });
  closeSheet(); toast('완료했어요');
};
function completeTask(key) {
  const t = findTask(key);
  const log = L.logMap(D())[key];
  if (log?.status === '완료') { store.setTaskLog(key, null); toast('완료를 취소했어요'); }
  else {
    store.setTaskLog(key, { status: '완료', contactMethod: '', note: '', doneAt: today() + 'T' + new Date().toTimeString().slice(0, 8) });
    if (t?.introId) store.update('intros', t.introId, { followUpDone: true });
    toast('완료! 연락 방법은 ⋯ 메뉴에서 남길 수 있어요');
  }
  render();
}

// ── 필터 교체 카드 메뉴 ──
function filterSheet(key) {
  const x = L.allFilterCycles(D(), today()).find(c => c.key === key);
  if (!x) return;
  if (x.repurchasedAt) {
    openSheet(`<h3>${esc(x.customer.name)} · 재구매 완료</h3><p class="lead">${esc(x.product.n)} · ${L.dotDate(x.repurchasedAt)} 구매</p>
      <div class="foot"><button type="button" class="btn" data-act="close-sheet">닫기</button><button type="button" class="btn green-txt" data-act="sheet-go" data-to="c/${x.customer.id}">소비자 카드</button></div>`, {});
    return;
  }
  const t = { key, customerId: x.customer.id, type: x.status === '놓친 고객' ? '놓친 고객' : '필터 교체', text: `${L.filterLabel(x.kind, x.product)} 교체 예정 ${L.dotDate(x.due)}` };
  taskSheet(key, t);
  const form = sheetForm();
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'btn out block'; btn.style.marginBottom = '14px';
  btn.dataset.act = 'filter-buy'; btn.dataset.key = key; btn.textContent = '필터 구매 기록하기';
  form.querySelector('.lead').after(btn);
}
function filterMessage(x) {
  const due = x.due;
  return `안녕하세요 ${x.customer.name}님! ${L.filterLabel(x.kind, x.product)} 교체 시기(${Number(due.slice(5, 7))}월 ${Number(due.slice(8))}일)가 다가와서 연락드려요. 편하실 때 말씀 주세요 :)`;
}

// ── 제품 수정·추가 ──
function productSheet(id) {
  const p = id ? L.productMap(D())[id] : null;
  const s = D().settings;
  const cats = p ? L.productCats(p, s.interestCats) : [];
  const custom = !p || p.custom;
  openSheet(`<h3>${p ? esc(p.n) : '제품 직접 추가'}</h3><p class="lead">${p && !p.custom ? `카탈로그 제품 · ${won(p.p)}` : '카탈로그에 없는 제품을 추가해요'}</p>
    ${custom ? `
      ${fld('제품 이름', `<input class="in" name="n" value="${esc(p?.n)}" ${p ? 'readonly' : ''}>`, true)}
      <div class="two">
        ${fld('분야', `<select class="in" name="c">${Object.entries(CATEGORIES).map(([k, c]) => opt(k, p?.c || 'nutrition', c.label)).join('')}</select>`)}
        ${fld('가격', `<input class="in" type="number" inputmode="numeric" name="p" value="${esc(p?.p ?? '')}">`)}
      </div>
      ${fld('용량', `<input class="in" name="z" placeholder="예: 60정" value="${esc(p?.z)}">`)}
      <label class="check"><input type="checkbox" name="isFilter" data-on="pf-toggle" ${p?.f ? 'checked' : ''}> 필터 제품이에요 (교체 주기 관리)</label>
      <div id="pf" style="${p?.f ? '' : 'display:none'}"><div class="two">
        ${fld('어느 기기용', `<select class="in" name="ffor">${Object.keys(DEVICE_MODELS).map(k => opt(k, p?.f?.for)).join('')}</select>`)}
        ${fld('필터 종류', `<input class="in" name="ftype" placeholder="예: 헤파 필터" value="${esc(p?.f?.type)}">`)}
      </div></div>` : ''}
    ${p?.f || custom ? fld('교체 주기 (개월)', `<input class="in" type="number" inputmode="numeric" min="1" max="60" name="months" value="${esc(p?.f?.months ?? 12)}">`) : ''}
    <div class="fld"><span>연결된 관심 분류 (추천에 사용)</span><div class="chips">${s.interestCats.map(c => `<label class="chip sm soft ${cats.includes(c) ? 'on' : ''}"><input type="checkbox" name="cat" value="${esc(c)}" hidden data-on="check-chip" ${cats.includes(c) ? 'checked' : ''}>${esc(c)}</label>`).join('')}</div></div>
    <div class="notice w">${ic('info')}<span>소개 문구는 회사 공식 자료 기준으로 입력하세요.</span></div>
    ${fld('소개 문구', `<textarea class="in" name="intro" placeholder="소비자에게 보낼 제품 소개 문구">${esc(p?.intro)}</textarea>`)}
    ${p?.custom ? `<button type="button" class="btn danger block" data-act="product-del" data-id="${esc(p.id)}">이 제품 삭제</button>` : ''}
    ${foot()}`, { form: 'product', id: p?.id, custom });
}
FORMS.product = () => {
  const f = sheetForm();
  const cats = [...f.querySelectorAll('input[name=cat]:checked')].map(x => x.value);
  const months = Number(val('months')) || 12;
  if (sheetCtx.custom) {
    const n = val('n'); if (!n) return toast('제품 이름을 입력해 주세요');
    const rec = { n, c: val('c'), p: Number(val('p')) || 0, z: val('z'), s: '직접 추가', cats, intro: val('intro'),
      f: checked('isFilter') ? { for: val('ffor'), type: val('ftype') || '필터', months, fits: [] } : undefined };
    if (sheetCtx.id) store.update('products', sheetCtx.id, rec);
    else {
      if (L.allProducts(D()).some(p => p.n === n)) return toast('같은 이름의 제품이 이미 있어요');
      store.add('products', { ...rec, id: 'u:' + n });
    }
  } else {
    const p = L.productMap(D())[sheetCtx.id];
    store.setProductEdit(sheetCtx.id, { cats, intro: val('intro'), ...(p.f ? { months } : {}) });
  }
  closeSheet(); toast('제품을 저장했어요');
};

// ── 제품 가이드: 선택 목록 → 소비자에게 기록 ──
function guideSheet() {
  const lines = pickLines();
  const total = lines.reduce((s, l) => s + l.v.p * l.q, 0);
  const custs = [...D().customers].sort((a, b) => korSort(a.name, b.name));
  openSheet(`<h3>선택 목록</h3>
    <div class="card list" style="margin:10px 0">${lines.map(l => `<div class="item" style="cursor:default"><div class="info"><b>${esc(l.p.n)}</b>
      <span class="sub">${esc(l.v.z || '')} · ${won(l.v.p)}</span>${l.p.h ? `<span class="sub">섭취: ${esc(l.p.h)}</span>` : ''}</div>
      <div class="qty"><button type="button" data-act="g-qty" data-k="${esc(l.k)}" data-d="-1">−</button><span>${l.q}</span><button type="button" data-act="g-qty" data-k="${esc(l.k)}" data-d="1">+</button></div></div>`).join('') || '<div class="empty">선택한 제품이 없어요</div>'}</div>
    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:17px;margin:4px 2px 14px"><span>합계</span><span>${won(total)}</span></div>
    <div class="row-btns" style="margin-bottom:22px"><button type="button" class="btn" data-act="g-clear">비우기</button><button type="button" class="btn green-txt" data-act="g-copy">${ic('copy')}안내 문구 복사</button></div>
    ${custs.length ? `<div class="card pad"><b style="font-size:16px">소비자에게 기록하기</b>
      ${fld('소비자', `<select class="in" name="cid">${opt('', '', '소비자 선택')}${custs.map(c => opt(c.id, sheetCtx?.cid, c.name)).join('')}</select>`)}
      <div class="chips" style="margin-bottom:12px">${[['intro', '소개 기록'], ['purchase', '구매 기록']].map(([v, l], i) => `<label class="chip sm soft ${i ? '' : 'on'}"><input type="radio" name="kind" value="${v}" hidden data-on="radio-chip" ${i ? '' : 'checked'}>${l}</label>`).join('')}</div>
      <div class="two">${fld('날짜', `<input class="in" type="date" name="date" value="${today()}">`)}${fld('소개 방법', `<select class="in" name="method">${D().settings.introMethods.map(m => opt(m, '카톡 자료')).join('')}</select>`)}</div>
      <button type="submit" class="btn pri block" ${lines.length ? '' : 'disabled'}>기록하기</button></div>` : ''}
    <div class="foot"><button type="button" class="btn" data-act="close-sheet">닫기</button></div>`, { form: 'assign', cid: G.forCustomer || '' });
}
FORMS.assign = () => {
  const cid = val('cid'); if (!cid) return toast('소비자를 골라 주세요');
  const kind = sheetForm().elements.kind.value, date = val('date') || today();
  const lines = pickLines();
  for (const l of lines) {
    if (kind === 'intro') store.add('intros', { customerId: cid, productId: l.p.id, date, method: val('method'), reaction: '미확인', followUpDone: false });
    else store.add('purchases', { customerId: cid, productId: l.p.id, date, quantity: l.q, variant: l.vi, amount: l.v.p * l.q, viaSop: false });
  }
  picks = {}; savePicks();
  closeSheet(() => go('c/' + cid));
  toast(`${custName(cid)}님에게 ${lines.length}개 ${kind === 'intro' ? '소개' : '구매'} 기록을 남겼어요`);
};
function guideCopyText() {
  const ls = pickLines(); if (!ls.length) return '';
  const total = ls.reduce((s, l) => s + l.v.p * l.q, 0);
  return ['[추천 제품 안내]', ...ls.map((l, i) => {
    const d = L.daysOf(l.p, l.v);
    return `${i + 1}. ${l.p.n} (${l.v.z}) ${won(l.v.p)}${l.q > 1 ? ` × ${l.q}` : ''}${l.p.h ? `\n   섭취: ${l.p.h}${d ? ` (1통 약 ${d}일분)` : ''}` : ''}${l.p.m ? `\n   ${l.p.m}` : ''}`;
  }), `합계 ${won(total)}`, '※ 암웨이 카탈로그 Vol.75 기준, 가격은 변동될 수 있습니다.'].join('\n');
}

// ── 일괄 안내 ──
function bulkSheet() {
  const data = D(), pm = L.productMap(data), prod = pm[ui.buyersProduct];
  const list = data.purchases.filter(p => p.productId === ui.buyersProduct && L.ym(p.date) === ui.buyersMonth);
  const tpl = prod?.f
    ? `안녕하세요 {이름}님! 작년에 구매하신 ${prod.n} 교체 시기({날짜})가 다가와서 연락드려요. 편하실 때 말씀 주세요 :)`
    : `안녕하세요 {이름}님! ${prod?.n || ''} 잘 드시고 계신가요? {날짜}쯤 다 드실 것 같아 미리 연락드려요 :)`;
  openSheet(`<h3>구매자에게 안내</h3><p class="lead">앱이 자동으로 보내지 않아요. 한 분씩 문자 또는 공유로 보내세요.</p>
    ${fld('안내 문구 ({이름}, {날짜}는 자동으로 바뀌어요)', `<textarea class="in" name="tpl" style="min-height:120px">${esc(prod?.intro ? prod.intro : tpl)}</textarea>`)}
    <div class="card list">${list.map(p => {
      const c = byId('customers', p.customerId);
      return `<div class="item" style="cursor:default"><div class="info"><b>${esc(c?.name)}</b><span class="sub">${esc(c?.phone || '연락처 없음')}</span></div>
        ${c?.phone ? `<button type="button" class="icon-btn" data-act="bulk-sms" data-id="${p.id}" aria-label="문자">${ic('msg')}</button>` : ''}
        <button type="button" class="icon-btn" data-act="bulk-share" data-id="${p.id}" aria-label="공유">${ic('share')}</button></div>`;
    }).join('')}</div>
    <div class="foot"><button type="button" class="btn" data-act="close-sheet">닫기</button></div>`, { form: '' });
}
function bulkTextFor(purchaseId) {
  const data = D(), p = byId('purchases', purchaseId), prod = L.productMap(data)[p.productId], c = byId('customers', p.customerId);
  const nx = L.nextDateForPurchase(data, p, prod);
  return val('tpl').replaceAll('{이름}', c?.name || '').replaceAll('{날짜}', nx ? `${Number(nx.slice(5, 7))}월 ${Number(nx.slice(8))}일` : '');
}

// ───────── 클릭 동작 ─────────
const ACT = {
  'close-sheet': () => closeSheet(),
  'sheet-go': el => closeSheet(() => go(el.dataset.to)),
  'open-customer': el => go('c/' + el.dataset.id),
  'customer-new': () => customerSheet(null),
  'customer-edit': el => customerSheet(byId('customers', el.dataset.id)),
  'customer-del': el => {
    const c = byId('customers', el.dataset.id);
    if (!confirm(`${c.name}님과 관련된 모든 기록(구매·SOP·기기·소개)을 지울까요? 되돌릴 수 없어요.`)) return;
    store.removeCustomer(c.id); closeSheet(() => go('customers')); toast('삭제했어요');
  },
  'load-sample': () => {
    if (D().customers.length && !confirm('지금 데이터를 예시 데이터로 바꿀까요?')) return;
    store.replaceAll(sampleData(today(), D().settings)); go('home'); render(); toast('예시 데이터를 넣었어요. 설정에서 지울 수 있어요');
  },
  'home-tab': el => { ui.homeTab = el.dataset.v; render(); },
  'task-toggle': el => completeTask(el.dataset.key),
  'task-menu': el => taskSheet(el.dataset.key),
  'task-undo': () => { store.setTaskLog(sheetCtx.key, null); closeSheet(); toast('완료를 취소했어요'); },
  'snooze-pick': el => { sheetForm().elements.snooze.value = el.dataset.v; ACT.snooze(); },
  'snooze': () => {
    const until = val('snooze'); if (!until || until <= today()) return toast('내일 이후 날짜를 골라 주세요');
    store.setTaskLog(sheetCtx.key, { status: '미룸', snoozeUntil: until, note: val('note'), contactMethod: sheetForm().elements.method?.value || '' });
    closeSheet(); toast(`${L.mmdd(until)}까지 숨겼어요`);
  },
  'interest-go': (el, e) => { ui.interestCat = el.dataset.cat; },
  'guide-search': el => { G.sub = 'all'; G.q = el.dataset.q; G.fc = ''; go('guide'); },
  'cust-grade': el => { ui.custGrade = el.dataset.v; render(); },
  'kakao': el => { const c = byId('customers', el.dataset.id); shareText(`안녕하세요 ${c.name}님!`); },
  'memo': el => memoSheet(byId('customers', el.dataset.id)),
  'interests-edit': el => interestsSheet(el.dataset.id),
  'ir-move': el => { syncInterestRows(); const i = +el.dataset.i, j = i + +el.dataset.d, r = sheetCtx.rows; [r[i], r[j]] = [r[j], r[i]]; drawInterestRows(); },
  'ir-del': el => { syncInterestRows(); sheetCtx.rows.splice(+el.dataset.i, 1); drawInterestRows(); },
  'ir-add': () => { syncInterestRows(); sheetCtx.rows.push({ category: '', memo: '', source: '직접 들음' }); drawInterestRows(); },
  'guide-for': el => {
    const c = byId('customers', el.dataset.id), td = today();
    G.sub = 'rec'; G.forCustomer = c.id; G.gender = c.gender || ''; G.age = c.birthYear ? String(Number(td.slice(0, 4)) - Number(c.birthYear)) : '';
    G.concerns = new Set(D().interests.filter(i => i.customerId === c.id).flatMap(i => L.tagsForCat(i.category)));
    G.cats = new Set(); G.ran = true; go('guide');
  },
  'sop-quick': el => {
    const type = $('#qsType').value, item = $('#qsItem').value;
    sopSheet(el.dataset.id, null, { type, item: type === '일반 SOP' && item !== '기타' ? item : '' });
  },
  'sop-edit': el => { const s = byId('sops', el.dataset.id); sopSheet(s.customerId, s); },
  'sop-del': el => { if (!confirm('이 SOP 기록을 지울까요?')) return; store.remove('sops', el.dataset.id); closeSheet(); },
  'device-new': el => deviceSheet(el.dataset.id, null),
  'device-edit': el => { const d = byId('devices', el.dataset.id); deviceSheet(d.customerId, d); },
  'device-del': el => { if (!confirm('이 기기를 지울까요? 필터 구매 기록은 남아요.')) return; store.remove('devices', el.dataset.id); closeSheet(); },
  'purchase-new': el => purchaseSheet(el.dataset.id, null),
  'purchase-edit': el => { const p = byId('purchases', el.dataset.id); purchaseSheet(p.customerId, p); },
  'purchase-del': el => { if (!confirm('이 구매 기록을 지울까요?')) return; store.remove('purchases', el.dataset.id); closeSheet(); },
  'toggle-purchases': () => { ui.showAllPurchases = !ui.showAllPurchases; render(); },
  'intro-new': el => introSheet(el.dataset.id, null, { productId: el.dataset.product, cat: el.dataset.cat }),
  'intro-edit': el => { const i = byId('intros', el.dataset.id); introSheet(i.customerId, i); },
  'intro-del': el => { if (!confirm('이 소개 기록을 지울까요?')) return; store.remove('intros', el.dataset.id); closeSheet(); },
  'pp-pick': el => {
    const p = L.productMap(D())[el.dataset.id];
    sheetForm().elements.productId.value = p.id;
    sheetForm().querySelector('[data-live=pp]').value = p.n;
    $('#pp-list').innerHTML = '';
    sheetCtx.rec && (sheetCtx.rec.variant = 0);
    drawPurchaseExtra();
  },
  'filter-kind': el => { ui.filterKind = el.dataset.v; render(); },
  'filter-month': el => { ui.filterMonth = L.ym(L.addMonths(ui.filterMonth + '-01', +el.dataset.v)); render(); },
  'filter-menu': (el, e) => { if (e.target.closest('a,button')) return; filterSheet(el.dataset.key); },
  'filter-msg': el => {
    const x = L.allFilterCycles(D(), today()).find(c => c.key === el.dataset.key);
    const text = filterMessage(x);
    if (x.customer.phone && /Android|iPhone|iPad/.test(navigator.userAgent)) location.href = smsHref(x.customer.phone, text); else shareText(text);
  },
  'filter-buy': el => {
    const x = L.allFilterCycles(D(), today()).find(c => c.key === el.dataset.key);
    closeSheet(() => { render(); purchaseSheet(x.customer.id, null, { productId: x.product.id, deviceId: x.device.id }); });
  },
  'sop-chip': el => { ui.sopChip = el.dataset.v; render(); },
  'sop-multi': () => { ui.sopMulti = !ui.sopMulti; render(); },
  'interest-cat': el => { ui.interestCat = el.dataset.v; render(); },
  'interest-only': () => { ui.interestOnly = !ui.interestOnly; render(); },
  'bulk-msg': () => bulkSheet(),
  'bulk-sms': el => { const p = byId('purchases', el.dataset.id); location.href = smsHref(byId('customers', p.customerId).phone, bulkTextFor(p.id)); },
  'bulk-share': el => shareText(bulkTextFor(el.dataset.id)),
  'set-del': el => {
    const k = el.dataset.k, v = el.dataset.v;
    if (D().settings[k].length <= 1) return toast('하나 이상은 남겨 두세요');
    store.setSettings({ [k]: D().settings[k].filter(x => x !== v) }); render();
  },
  'set-add': el => {
    const k = el.dataset.k, inp = $('#add-' + k), v = inp.value.trim();
    if (!v) return; if (D().settings[k].includes(v)) return toast('이미 있는 항목이에요');
    store.setSettings({ [k]: [...D().settings[k], v] }); render(); toast('추가했어요');
  },
  'export': () => {
    const blob = new Blob([store.exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `소비자관리_백업_${today()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('백업 파일을 저장했어요. 안전한 곳(드라이브 등)에 보관하세요');
  },
  'reset-all': () => {
    if (!confirm('모든 소비자와 기록을 지울까요? 되돌릴 수 없어요. 먼저 내보내기를 권해요.')) return;
    if (!confirm('정말 지울까요?')) return;
    store.resetAll(); go('home'); render(); toast('모두 지웠어요');
  },
  'product-new': () => productSheet(null),
  'product-edit': el => productSheet(el.dataset.id),
  'product-del': el => { if (!confirm('이 제품을 지울까요?')) return; store.remove('products', el.dataset.id); closeSheet(); },
  // 가이드
  'g-sub': el => { G.sub = el.dataset.v; render(); },
  'g-gender': el => { G.gender = G.gender === el.dataset.v ? '' : el.dataset.v; el.classList.toggle('on', !!G.gender); [...el.parentNode.children].forEach(x => x.classList.toggle('on', x.dataset.v === G.gender)); },
  'g-cat': el => { G.cats.has(el.dataset.v) ? G.cats.delete(el.dataset.v) : G.cats.add(el.dataset.v); el.classList.toggle('on'); },
  'g-concern': el => { G.concerns.has(el.dataset.v) ? G.concerns.delete(el.dataset.v) : G.concerns.add(el.dataset.v); el.classList.toggle('on'); },
  'g-run': () => { G.ran = true; render(); $('#g-out')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  'g-reset': () => { Object.assign(G, { age: '', gender: '', budget: '', cats: new Set(), concerns: new Set(), ran: false, forCustomer: '' }); render(); },
  'g-pick': el => {
    const id = el.dataset.id, k = Object.keys(picks).find(k => k.slice(0, k.lastIndexOf('|')) === id);
    if (k) delete picks[k];
    else { const sel = el.closest('.gcard').querySelector('select'); picks[`${id}|${sel ? +sel.value : 0}`] = 1; }
    savePicks(); render();
  },
  'g-sheet': () => guideSheet(),
  'g-qty': el => { const k = el.dataset.k; picks[k] += +el.dataset.d; if (picks[k] <= 0) delete picks[k]; savePicks(); guideSheet(); },
  'g-clear': () => { picks = {}; savePicks(); closeSheet(); },
  'g-copy': () => copyText(guideCopyText()),
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACT[el.dataset.act];
  if (!fn) return;
  const link = e.target.closest('a[href]');
  if (link && link !== el && el.contains(link)) return;
  if (el.tagName === 'BUTTON' || el.dataset.act !== 'interest-go') e.preventDefault();
  fn(el, e);
});

// 입력값 변경 (목록 다시 그리기 없이)
const ON = {
  'qs-type': el => { $('#qsItem').closest('.fld').style.display = el.value === '일반 SOP' ? '' : 'none'; },
  'buyers-product': el => { ui.buyersProduct = el.value; ui.buyersMonth = ''; render(); },
  'buyers-month': el => { ui.buyersMonth = el.value; render(); },
  'setting-num': el => { const n = Math.max(0, Math.min(365, Number(el.value) || 0)); store.setSettings({ [el.dataset.k]: n }); toast('저장했어요'); },
  'import': async el => {
    const file = el.files[0]; if (!file) return;
    try {
      const text = await file.text();
      if (!confirm('백업 파일로 지금 데이터를 바꿀까요? 지금 데이터는 사라져요.')) return;
      store.importJson(text); go('home'); render(); toast('가져왔어요');
    } catch (e) { toast('가져오지 못했어요: ' + e.message); }
  },
  'ir-cat': el => { const i = el.name.slice(3); sheetForm().elements['custom' + i].style.display = el.value === '__c' ? '' : 'none'; },
  'ir-src': el => { [...el.closest('.chips').children].forEach(l => l.classList.toggle('on', l.querySelector('input').checked)); },
  'radio-chip': el => { [...el.closest('.chips').children].forEach(l => l.classList.toggle('on', l.querySelector('input').checked)); },
  'check-chip': el => { el.closest('label').classList.toggle('on', el.checked); },
  'pc-amount': () => setAutoAmount(),
  'pc-touch': () => { sheetCtx.amountTouched = true; },
  'dev-kind': () => drawDeviceParts(false),
  'dev-model': el => { sheetForm().elements.modelOther.style.display = el.value === '__o' ? '' : 'none'; drawDeviceParts(false); },
  'sop-type': el => {
    $('#sop-item').style.display = el.value === '일반 SOP' ? '' : 'none';
    sheetForm().elements.itemCustom.style.display = el.value === '일반 SOP' && val('item') === '__c' ? '' : 'none';
  },
  'sop-item': el => { sheetForm().elements.itemCustom.style.display = el.value === '__c' ? '' : 'none'; },
  'sop-status': el => { $('#sop-end').style.display = el.value === '해지' ? '' : 'none'; },
  'pf-toggle': el => { $('#pf').style.display = el.checked ? '' : 'none'; },
  'g-budget': el => { G.budget = el.value; },
  'g-fc': el => { G.fc = el.value; updateLive(); },
  'g-sort': el => { G.sort = el.value; updateLive(); },
  'g-variant': el => {
    const id = el.dataset.id, k = Object.keys(picks).find(k => k.slice(0, k.lastIndexOf('|')) === id);
    if (k) { const q = picks[k]; delete picks[k]; picks[`${id}|${el.value}`] = q; savePicks(); }
    const p = L.productMap(D())[id], v = L.variants(p)[+el.value];
    const card = el.closest('.gcard');
    card.querySelector('.price').innerHTML = `${won(v.p)}<span class="size">${esc(v.z)}</span>`;
    const dose = card.querySelector('.dose'); if (dose) dose.outerHTML = doseBlock(p, v);
    if (k) render();
  },
};
document.addEventListener('change', e => { const fn = ON[e.target.dataset.on]; if (fn) fn(e.target, e); });

const LIVE_KEYS = { homeQ: v => { ui.homeQ = v; }, custQ: v => { ui.custQ = v; }, prodQ: v => { ui.prodQ = v; }, gq: v => { G.q = v; }, gdq: v => { G.dq = v; } };
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.bind === 'age') { G.age = t.value; return; }
  const k = t.dataset.live;
  if (k === 'pp') {
    sheetForm().elements.productId.value = '';
    $('#pp-list').innerHTML = ppList(t.value);
    $('#pc-extra') && ($('#pc-extra').innerHTML = '');
    return;
  }
  if (LIVE_KEYS[k]) { LIVE_KEYS[k](t.value); updateLive(); }
  if (t.dataset.on === 'pc-amount') setAutoAmount();
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const fn = FORMS[e.target.dataset.form];
  if (fn) fn();
});

addEventListener('hashchange', () => { if (sheetOpen) { sheetOpen = false; closeSheetNow(); } ui.showAllPurchases = false; render(); });

// 날짜가 바뀌면(자정이 지나서 앱을 다시 열면) 새로 그림
let lastDay = today();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && today() !== lastDay) { lastDay = today(); render(); }
});

store.load().then(() => render());
