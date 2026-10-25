// 계산 규칙 모음 (요청서 5장). 화면과 저장소에 의존하지 않는 순수 함수라 tests.html에서 자동 테스트한다.
import { PRODUCTS, CONCERNS, INTEREST_TAGS } from './catalog.js';

// ───────── 날짜 (모두 'YYYY-MM-DD' 문자열, 현지 날짜 기준) ─────────
const DAY = 86400000;
const toMs = d => { const [y, m, dd] = d.split('-').map(Number); return Date.UTC(y, m - 1, dd); };
const fromMs = ms => new Date(ms).toISOString().slice(0, 10);
export function todayStr(now = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}
export const addDays = (d, n) => fromMs(toMs(d) + n * DAY);
export const diffDays = (a, b) => Math.round((toMs(b) - toMs(a)) / DAY); // a → b 까지 며칠
const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m: 1~12
function ymd(y, m, d) { // m은 1~12를 넘어가도 됨
  y += Math.floor((m - 1) / 12); m = ((m - 1) % 12 + 12) % 12 + 1;
  return `${y}-${String(m).padStart(2, '0')}-${String(Math.min(d, daysInMonth(y, m))).padStart(2, '0')}`;
}
export function addMonths(d, n) {
  const [y, m, dd] = d.split('-').map(Number);
  return ymd(y, m + n, dd);
}
export const weekday = d => new Date(toMs(d)).getUTCDay(); // 0=일
export function endOfWeek(d) { const w = weekday(d); return addDays(d, w === 0 ? 0 : 7 - w); } // 이번 주 일요일
export function startOfWeek(d) { const w = weekday(d); return addDays(d, w === 0 ? -6 : 1 - w); } // 이번 주 월요일
export const mmdd = d => d ? `${d.slice(5, 7)}.${d.slice(8, 10)}` : '';
export const dotDate = d => d ? d.replaceAll('-', '.') : '';
export const ym = d => d.slice(0, 7);

// ───────── 제품 ─────────
// 카탈로그 제품 + 사용자가 추가한 제품, 그리고 사용자가 바꾼 값(교체 주기, 관심 분류, 소개 문구)을 합친다
export function allProducts(data) {
  const edits = Object.fromEntries((data.productEdits || []).map(e => [e.id, e]));
  const list = [...PRODUCTS, ...(data.products || []).map(p => ({ custom: true, t: [], ...p }))];
  return list.map(p => {
    const e = edits[p.id];
    if (!e) return p;
    const q = { ...p };
    if (e.months && q.f) q.f = { ...q.f, months: e.months };
    if (e.cats) q.cats = e.cats;
    if (e.intro !== undefined) q.intro = e.intro;
    return q;
  });
}
export function productMap(data) { return Object.fromEntries(allProducts(data).map(p => [p.id, p])); }

const CONCERN_BY_LABEL = Object.fromEntries(CONCERNS.flatMap(g => g.items).map(([k, l]) => [l, k]));
export function tagsForCat(cat) {
  return INTEREST_TAGS[cat] || (CONCERN_BY_LABEL[cat] ? [CONCERN_BY_LABEL[cat]] : []);
}
// 제품이 연결된 관심 분류
export function productCats(p, cats) {
  if (p.cats) return p.cats;
  return cats.filter(c => tagsForCat(c).some(t => (p.t || []).includes(t)));
}

export function variants(p) { return [{ z: p.z, p: p.p }, ...(p.v || [])]; }
// 영양제 1통으로 며칠 먹는지
export function daysOf(p, v = { z: p.z }) {
  if (!v.z) return null;
  let m = v.z.match(/(\d+)\s*회분/);
  if (m && p.tpd) return Math.floor(+m[1] / p.tpd);
  if (!p.upd) return null;
  m = v.z.match(/(\d+)\s*(정|캡슐|포|매|개)(?:\s*×\s*(\d+))?/);
  return m ? Math.floor(+m[1] * (+m[3] || 1) / p.upd) : null;
}

// ───────── 필터 교체 (5.1, 5.2) ─────────
// 기기의 필터 하나에 대해, 교체(구매)가 이어진 순서대로 '교체 주기'를 만든다.
// 마지막 것만 열려 있고(재구매 대기), 나머지는 다음 구매로 '재구매 완료'.
export function filterCycles(data, device, slot, product) {
  const months = product?.f?.months || 12;
  const dates = data.purchases
    .filter(p => p.deviceId === device.id && p.productId === slot.productId)
    .map(p => p.date);
  const base = slot.lastReplacedAt || device.installedAt;
  if (base) dates.push(base);
  const seq = [...new Set(dates)].filter(Boolean).sort();
  return seq.map((d, i) => ({
    last: d,
    due: addMonths(d, months),
    repurchasedAt: seq[i + 1] || null,
  }));
}

// '정수기 정수기 필터'처럼 겹치지 않게
export function filterLabel(kind, product) {
  const type = product?.f?.type || '필터';
  return type.startsWith(kind) ? type : `${kind} ${type}`;
}
export const filterKey = (deviceId, productId, due) => `filter:${deviceId}:${productId}:${due}`;

// 모든 기기·필터의 교체 주기를 상태와 함께
export function allFilterCycles(data, today) {
  const pm = productMap(data);
  const logs = logMap(data);
  const cust = Object.fromEntries(data.customers.map(c => [c.id, c]));
  const out = [];
  for (const dev of data.devices) {
    if (!cust[dev.customerId]) continue;
    for (const slot of dev.filters || []) {
      const product = pm[slot.productId];
      if (!product) continue;
      for (const cy of filterCycles(data, dev, slot, product)) {
        const key = filterKey(dev.id, slot.productId, cy.due);
        const log = logs[key];
        let status;
        if (cy.repurchasedAt) status = '재구매 완료';
        else if (cy.due < today) status = '놓친 고객';
        else if (log?.status === '완료') status = '연락함';
        else status = '아직 연락 안 함';
        out.push({ ...cy, key, status, contacted: log?.status === '완료', note: log?.note || '',
          device: dev, product, customer: cust[dev.customerId], kind: dev.kind });
      }
    }
  }
  return out;
}

// ───────── SOP ─────────
export const sopName = s => s.type === '일반 SOP' && s.item ? `일반 SOP · ${s.item}` : s.type;
const CYCLE_STEP = { '매월': 1, '격월': 2, '3개월': 3 };
// 오늘 이후(오늘 포함) 다음 결제일
export function nextPayDate(sop, today) {
  if (sop.status !== '이용 중' || !sop.payDay) return null;
  const step = CYCLE_STEP[sop.cycle] || 1;
  const start = sop.startDate || today;
  const [y, m] = start.split('-').map(Number);
  for (let k = 0; k < 1200; k++) {
    const d = ymd(y, m + k * step, sop.payDay);
    if (d >= start && d >= today) return d;
  }
  return null;
}

// ───────── 소개 ─────────
export function introPurchased(data, intro) {
  return data.purchases.some(p => p.customerId === intro.customerId && p.productId === intro.productId && p.date >= intro.date);
}

// ───────── 할 일 (5.3) ─────────
export function logMap(data) { return Object.fromEntries(data.taskLogs.map(l => [l.taskKey, l])); }

export function buildTasks(data, today) {
  const s = data.settings;
  const pm = productMap(data);
  const cust = Object.fromEntries(data.customers.map(c => [c.id, c]));
  const tasks = [];
  const push = t => { if (cust[t.customerId]) tasks.push(t); };

  // 필터 교체 / 놓친 고객
  for (const cy of allFilterCycles(data, today)) {
    if (cy.repurchasedAt || cy.device.reminderOff) continue;
    const label = filterLabel(cy.kind, cy.product);
    if (cy.due < today) {
      push({ key: cy.key, type: '놓친 고객', customerId: cy.customer.id, due: cy.due,
        text: `${label} 교체 예정일 지남 · 재구매 없음`, link: 'filters' });
    } else if (today >= addDays(cy.due, -s.leadFilter)) {
      push({ key: cy.key, type: '필터 교체', customerId: cy.customer.id, due: cy.due,
        text: `${label} 교체 예정 ${mmdd(cy.due)}`, link: 'filters' });
    }
  }

  // SOP 결제 / SOP 해지
  for (const sop of data.sops) {
    if (sop.status === '이용 중') {
      const pay = nextPayDate(sop, today);
      if (pay && today >= addDays(pay, -s.leadSop)) {
        push({ key: `sop:${sop.id}:${pay}`, type: 'SOP 결제', customerId: sop.customerId, due: pay,
          text: `${sopName(sop)} 결제 ${mmdd(pay)} · 변경 사항 확인`, link: 'sop' });
      }
    } else if (sop.status === '해지' && sop.endedAt) {
      const due = addDays(sop.endedAt, s.sopChurn);
      if (today >= due && today <= addDays(due, 60)) {
        push({ key: `sopend:${sop.id}`, type: 'SOP 해지', customerId: sop.customerId, due,
          text: `${sopName(sop)} 해지 소비자 · 근황 연락`, link: 'sop' });
      }
    }
  }

  // 소개 후속
  const logs = logMap(data);
  for (const it of data.intros) {
    // 완료 처리한 날에는 취소선으로 보여 주기 위해 남겨 둔다
    const doneLog = logs[`intro:${it.id}`]?.status === '완료';
    if (!doneLog && (it.reaction !== '미확인' || it.followUpDone || introPurchased(data, it))) continue;
    const due = addDays(it.date, s.introFollow);
    if (today >= due) {
      push({ key: `intro:${it.id}`, type: '소개 후속', customerId: it.customerId, due, introId: it.id,
        text: `${mmdd(it.date)} ${pm[it.productId]?.n || '제품'} ${it.method} → 반응 확인` });
    }
  }

  // 생일·기념일: 이번 주(월~일)에 있으면
  const ws = startOfWeek(today), we = endOfWeek(today);
  const thisYearDate = md => {
    const [m, d] = md.split('-').map(Number);
    return ymd(Number(today.slice(0, 4)), m, d);
  };
  for (const c of data.customers) {
    const days = [];
    if (c.birthday) days.push(['생일', c.birthday]);
    for (const a of c.anniversaries || []) if (a.date) days.push([a.label || '기념일', a.date]);
    for (const [label, md] of days) {
      if (!/^\d{2}-\d{2}$/.test(md)) continue;
      const d = thisYearDate(md);
      if (d >= ws && d <= we) {
        push({ key: `day:${c.id}:${label}:${d}`, type: label === '생일' ? '생일' : '기념일', customerId: c.id, due: d,
          text: `${label} ${mmdd(d)} · 축하 메시지` });
      }
    }
  }

  // 영양제 재구매: 1통 다 먹을 때쯤 (SOP로 받는 구매는 제외)
  const latest = {};
  for (const p of data.purchases) {
    const k = p.customerId + '|' + p.productId;
    if (!latest[k] || p.date > latest[k].date) latest[k] = p;
  }
  for (const p of Object.values(latest)) {
    const prod = pm[p.productId];
    if (!prod || prod.c !== 'nutrition' || p.viaSop) continue;
    const v = variants(prod)[p.variant || 0] || variants(prod)[0];
    const days = daysOf(prod, v);
    if (!days) continue;
    const due = addDays(p.date, days * (p.quantity || 1));
    if (today >= addDays(due, -s.leadRefill) && today <= addDays(due, 30)) {
      push({ key: `refill:${p.id}`, type: '재구매', customerId: p.customerId, due,
        text: `${prod.n} 다 드실 때 ${mmdd(due)}` });
    }
  }
  return tasks;
}

// ───────── 오늘 / 이번 주 (5.4) ─────────
// 완료: 완료한 날에는 취소선으로 남고 다음 날 사라짐. 미룸: 고른 날짜 전까지 숨김.
export function visibleTasks(data, today) {
  const logs = logMap(data);
  return buildTasks(data, today).flatMap(t => {
    const log = logs[t.key];
    if (log?.status === '미룸' && log.snoozeUntil > today) return [];
    if (log?.status === '완료') return (log.doneAt || '').slice(0, 10) === today ? [{ ...t, done: true, log }] : [];
    return [{ ...t, done: false, overdue: t.due < today }];
  }).sort((a, b) => a.due.localeCompare(b.due) || a.type.localeCompare(b.type));
}
export function todayTasks(tasks, today) { return tasks.filter(t => t.due <= addDays(today, 2)); }
// 이번 주: 이번 주 일요일까지. 단, '오늘' 목록(오늘+2일)은 항상 포함 (일요일에도 이번 주가 오늘보다 적지 않게)
export function weekEnd(today) { const s = endOfWeek(today), t = addDays(today, 2); return s > t ? s : t; }
export function weekTasks(tasks, today) { return tasks.filter(t => t.due <= weekEnd(today)); }

// ───────── 관심 항목 → 추천 (5.5) ─────────
function fitsCustomer(p, c, today) {
  if (p.g && c.gender && p.g !== c.gender) return false;
  if (p.a && c.birthYear) {
    const age = Number(today.slice(0, 4)) - Number(c.birthYear);
    if (age < p.a[0] || age > p.a[1]) return false;
  }
  return true;
}
// 가족을 위한 관심사는 본인 나이·성별로 거르지 않는다
const FAMILY_CATS = ['아이 건강', '부모님 건강'];
export function boughtIds(data, customerId) {
  return new Set(data.purchases.filter(p => p.customerId === customerId).map(p => p.productId));
}
export function recommendFor(data, customer, today, perInterest = 2) {
  const cats = data.settings.interestCats;
  const bought = boughtIds(data, customer.id);
  const recentIntro = new Set(data.intros
    .filter(i => i.customerId === customer.id && i.date >= addDays(today, -30)).map(i => i.productId));
  const interests = data.interests.filter(i => i.customerId === customer.id).sort((a, b) => a.rank - b.rank);
  const seen = new Set();
  const out = [];
  for (const it of interests) {
    const tags = tagsForCat(it.category);
    const list = allProducts(data)
      .filter(p => !p.f && !bought.has(p.id) && !seen.has(p.id) && (FAMILY_CATS.includes(it.category) || fitsCustomer(p, customer, today)))
      .filter(p => productCats(p, cats.includes(it.category) ? cats : [...cats, it.category]).includes(it.category))
      .map(p => ({ p, hit: (p.t || []).filter(t => tags.includes(t)).length }))
      .sort((a, b) => b.hit - a.hit || (a.p.t?.length || 0) - (b.p.t?.length || 0) || a.p.p - b.p.p)
      .slice(0, perInterest);
    for (const { p } of list) {
      seen.add(p.id);
      out.push({ product: p, category: it.category, recentlyIntroduced: recentIntro.has(p.id) });
    }
  }
  return out;
}

// 관심 분류와 연결된 제품을 산 적이 있는지
export function boughtInCat(data, customerId, cat) {
  const pm = productMap(data);
  const cats = data.settings.interestCats.includes(cat) ? data.settings.interestCats : [...data.settings.interestCats, cat];
  return data.purchases.some(p => p.customerId === customerId && pm[p.productId] && productCats(pm[p.productId], cats).includes(cat));
}

// 관심 항목별 소비자 (7.6)
export function customersByInterest(data, cat, onlyNotBought) {
  const pm = productMap(data);
  const cats = data.settings.interestCats.includes(cat) ? data.settings.interestCats : [...data.settings.interestCats, cat];
  return data.interests.filter(i => i.category === cat).flatMap(i => {
    const c = data.customers.find(x => x.id === i.customerId);
    if (!c) return [];
    const bought = boughtInCat(data, c.id, cat);
    if (onlyNotBought && bought) return [];
    const lastIntro = data.intros
      .filter(x => x.customerId === c.id && pm[x.productId] && productCats(pm[x.productId], cats).includes(cat))
      .sort((a, b) => b.date.localeCompare(a.date))[0] || null;
    return [{ customer: c, interest: i, bought, lastIntro }];
  }).sort((a, b) => a.interest.rank - b.interest.rank);
}

// 홈 '제품 소개 추천' 카드: 아직 안 산 소비자가 가장 많은 관심 분류
export function topInterestGap(data) {
  const cats = [...new Set(data.interests.map(i => i.category))];
  let best = null;
  for (const c of cats) {
    const n = customersByInterest(data, c, true).length;
    if (n && (!best || n > best.count)) best = { category: c, count: n };
  }
  return best;
}

// ───────── 제품별 구매자 (7.5) ─────────
export function nextDateForPurchase(data, p, product) {
  if (!product) return null;
  if (product.f) return addMonths(p.date, product.f.months || 12);
  if (product.c === 'nutrition') {
    const v = variants(product)[p.variant || 0] || variants(product)[0];
    const d = daysOf(product, v);
    return d ? addDays(p.date, d * (p.quantity || 1)) : null;
  }
  return null;
}
