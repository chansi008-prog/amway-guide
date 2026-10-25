// 저장소 모듈: 모든 데이터 읽기·쓰기를 여기에 모아 둔다.
// 1차는 이 기기의 브라우저 저장소(IndexedDB)에만 저장. 나중에 서버로 옮길 때 이 파일만 바꾸면 된다.

const DB_NAME = 'consumer-manager';
const KV = 'kv';
const KEY = 'data';

export const COLLECTIONS = ['customers', 'interests', 'purchases', 'devices', 'sops', 'intros', 'taskLogs', 'products', 'productEdits'];

export const DEFAULT_SETTINGS = {
  leadFilter: 21,   // 필터 교체 할 일: 예정일 21일 전부터
  leadSop: 3,       // SOP 결제 할 일: 결제일 3일 전부터
  introFollow: 7,   // 소개 후속: 소개 7일 뒤
  sopChurn: 30,     // SOP 해지 후 30일 뒤 근황 연락
  leadRefill: 7,    // 영양제 다 떨어지기 7일 전
  sopTypes: ['장바구니 SOP', '일반 SOP'],
  sopItems: ['영양제', '화장품'],
  sopCycles: ['매월', '격월', '3개월'],
  interestCats: ['피부관리', '체중관리', '면역', '수면', '주방', '세탁', '공기질', '물(정수)', '아이 건강', '부모님 건강'],
  grades: ['소비자', '단골', '사업 관심'],
  contactMethods: ['전화', '카톡', '방문'],
  introMethods: ['샘플', '시연', '카톡 자료', '기타'],
  reactions: ['관심 있음', '보류', '관심 없음', '미확인'],
};

function emptyData() {
  const d = { version: 1, settings: structuredClone(DEFAULT_SETTINGS) };
  COLLECTIONS.forEach(c => { d[c] = []; });
  return d;
}

let data = emptyData();
let idb = null;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(KV);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// 예전 데이터에 없는 항목은 기본값으로 채운다
function normalize(d) {
  const base = emptyData();
  const out = { ...base, ...d, settings: { ...base.settings, ...(d.settings || {}) } };
  COLLECTIONS.forEach(c => { if (!Array.isArray(out[c])) out[c] = []; });
  return out;
}

export async function load() {
  try {
    idb = await openDb();
    const saved = await new Promise((resolve, reject) => {
      const r = idb.transaction(KV).objectStore(KV).get(KEY);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    if (saved) data = normalize(saved);
    // 브라우저가 저장 공간을 정리할 때 지우지 않도록 요청
    navigator.storage?.persist?.().catch(() => {});
  } catch (e) {
    console.warn('저장소를 열지 못했습니다', e);
  }
  return data;
}

let timer = null;
function persist() {
  clearTimeout(timer);
  timer = setTimeout(flush, 150);
}
export function flush() {
  clearTimeout(timer);
  if (!idb) return;
  try { idb.transaction(KV, 'readwrite').objectStore(KV).put(structuredClone(data), KEY); }
  catch (e) { console.warn('저장 실패', e); }
}
addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

export const db = () => data;

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
const now = () => new Date().toISOString();

export function add(coll, obj) {
  const rec = { id: uid(), createdAt: now(), updatedAt: now(), ...obj };
  data[coll].push(rec);
  persist();
  return rec;
}
export function update(coll, id, patch) {
  const rec = data[coll].find(r => r.id === id);
  if (!rec) return null;
  Object.assign(rec, patch, { updatedAt: now() });
  persist();
  return rec;
}
export function remove(coll, id) {
  data[coll] = data[coll].filter(r => r.id !== id);
  persist();
}
export function removeWhere(coll, fn) {
  data[coll] = data[coll].filter(r => !fn(r));
  persist();
}
// 할 일 처리 기록은 taskKey로 하나만 둔다
export function setTaskLog(taskKey, log) {
  data.taskLogs = data.taskLogs.filter(l => l.taskKey !== taskKey);
  if (log) data.taskLogs.push({ taskKey, ...log });
  persist();
}
export function setSettings(patch) {
  Object.assign(data.settings, patch);
  persist();
}
export function setProductEdit(productId, patch) {
  let e = data.productEdits.find(x => x.id === productId);
  if (!e) { e = { id: productId }; data.productEdits.push(e); }
  Object.assign(e, patch);
  persist();
}

// 고객 한 명과 그 사람의 모든 기록 삭제
export function removeCustomer(id) {
  data.customers = data.customers.filter(c => c.id !== id);
  ['interests', 'purchases', 'devices', 'sops', 'intros'].forEach(c => {
    data[c] = data[c].filter(r => r.customerId !== id);
  });
  persist();
}

// ── 백업 ──
export function exportJson() {
  return JSON.stringify({ app: 'consumer-manager', exportedAt: now(), ...data }, null, 2);
}
export function importJson(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.customers)) throw new Error('이 앱의 백업 파일이 아니에요');
  delete parsed.app; delete parsed.exportedAt;
  data = normalize(parsed);
  flush();
  return data;
}
export function replaceAll(d) {
  data = normalize(d);
  flush();
  return data;
}
export function resetAll() {
  data = emptyData();
  flush();
  return data;
}
