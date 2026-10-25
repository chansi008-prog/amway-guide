// 둘러보기용 예시 데이터. 이름·연락처는 모두 가짜이고, 날짜는 오늘을 기준으로 만든다.
import { addDays, addMonths } from './logic.js';

export function sampleData(today, settings) {
  const d = n => addDays(today, n);
  const m = n => addMonths(today, n);
  const mmdd = s => s.slice(5);
  const id = (() => { let i = 0; return p => `s${p}${++i}`; })();
  const C = (name, extra) => ({ id: id('c'), name, phone: '010-0000-0000', grade: '소비자', consentAt: d(-200),
    createdAt: d(-200), updatedAt: d(-200), anniversaries: [], ...extra });

  const jy = C('김지영', { grade: '단골', birthday: '03-12', referrer: '박OO', family: '초등학생 자녀 1명', gender: 'F', birthYear: 1984 });
  const de = C('정다은', { birthday: '07-02' });
  const eh = C('최은희', { gender: 'F', birthYear: 1972, memo: '부모님 선물 고민' });
  const sw = C('한상우', { grade: '사업 관심', gender: 'M', birthYear: 1980 });
  const mk = C('오미경', { grade: '단골', birthday: mmdd(d(1)), gender: 'F', birthYear: 1968 });
  const sj = C('이수진', { gender: 'F', birthYear: 1991 });
  const sy = C('윤서연', { gender: 'F' });
  const ms = C('박민수', { gender: 'M', birthYear: 1975 });
  const hn = C('강하늘', {});
  const customers = [jy, de, eh, sw, mk, sj, sy, ms, hn];

  const I = (c, rank, category, memo, source = '직접 들음') => ({ id: id('i'), customerId: c.id, rank, category, memo, source, updatedAt: d(-8) });
  const interests = [
    I(jy, 1, '피부관리', '건성, 겨울철에 특히 고민'), I(jy, 2, '면역', '환절기 가족 건강 관심'), I(jy, 3, '공기질', '아이 방 공기청정기 고민 중'),
    I(jy, 4, '주방', '세제·조리도구 자주 구매', '구매로 추정'), I(jy, 5, '아이 건강', '초등학생 자녀 1명', '구매로 추정'),
    I(eh, 1, '면역', '부모님 선물 고민'), I(eh, 2, '부모님 건강', '어머니 관절'),
    I(sw, 1, '체중관리', '회식이 잦음'), I(sw, 3, '면역', '야근 많음'), I(sw, 2, '수면', '잠을 깊이 못 잠'),
    I(mk, 1, '피부관리', '주름 고민'), I(sj, 1, '체중관리', ''), I(sy, 1, '수면', ''),
  ];

  const P = (c, productId, date, quantity = 1, extra = {}) => ({ id: id('p'), customerId: c.id, productId: 'p:' + productId, date, quantity, ...extra });
  const devices = [];
  const D = (c, kind, model, location, installedAt, filters, extra = {}) => {
    const dev = { id: id('d'), customerId: c.id, kind, model, location, installedAt, filters: filters.map(f => ({ productId: 'p:' + f })), ...extra };
    devices.push(dev);
    return dev;
  };
  const W = '이스프링 정수기 3중 필터 카트리지';
  const dJy = D(jy, '정수기', '이스프링 정수기(퍼싯)', '거실', m(-30), [W]);
  const dDe = D(de, '정수기', '이스프링 정수기(전환기)', '주방', m(-25), [W]);
  const dSw = D(sw, '정수기', '이스프링 정수기(전환기)', '사무실', m(-14), [W]);
  const dMk = D(mk, '정수기', '이스프링 정수기(퍼싯)', '주방', m(-26), [W]);
  const dMk2 = D(mk, '공기청정기', '엣모스피어 스카이', '거실', m(-11), ['엣모스피어 스카이 집진(헤파) 필터', '엣모스피어 스카이 탈취 필터']);

  const purchases = [
    P(jy, W, addDays(m(-12), 3), 1, { deviceId: dJy.id, amount: 272000 }),
    P(de, W, addDays(m(-12), -21), 1, { deviceId: dDe.id, amount: 272000 }),
    P(sw, W, addDays(m(-12), 6), 2, { deviceId: dSw.id, amount: 544000 }),
    P(mk, W, addDays(m(-12), -12), 1, { deviceId: dMk.id, amount: 272000 }),
    P(mk, W, d(-12), 1, { deviceId: dMk.id, amount: 272000 }),
    P(jy, '디쉬 드랍스 바이오퀘스트 식기 세정제', d(-20), 2, { amount: 31800 }),
    P(jy, '더블엑스', d(-35), 1, { amount: 91000, viaSop: true }),
    P(mk, '스킨 뉴트리션 디파잉 세럼', d(-60), 1, { amount: 90000 }),
    P(sj, '비타민 비 플러스', d(-25), 1, { amount: 36000 }),
    P(ms, '쏘팔메토 블렌드', d(-27), 1, { amount: 45000 }),
  ];

  const S = (c, type, item, startDate, payDay, extra = {}) => ({ id: id('s'), customerId: c.id, type, item: item || '', startDate, cycle: '매월', payDay, status: '이용 중', ...extra });
  const dayOf = n => Number(d(n).slice(8, 10));
  const sops = [
    S(jy, '일반 SOP', '영양제', m(-20), dayOf(2)),
    S(jy, '장바구니 SOP', '', m(-4), dayOf(16), { cycle: '격월' }),
    S(sj, '일반 SOP', '영양제', m(-6), dayOf(3)),
    S(mk, '일반 SOP', '영양제', m(-9), dayOf(8)), S(mk, '장바구니 SOP', '', m(-9), dayOf(8)), S(mk, '일반 SOP', '화장품', m(-3), dayOf(20)),
    S(sw, '장바구니 SOP', '', m(-2), dayOf(16)),
    S(sy, '일반 SOP', '화장품', m(-5), 10, { status: '일시중지' }), S(sy, '일반 SOP', '영양제', m(-5), 10, { status: '일시중지' }),
    S(ms, '일반 SOP', '화장품', m(-7), dayOf(13)),
    S(hn, '일반 SOP', '화장품', m(-10), 5, { status: '해지', endedAt: d(-31), endReason: '사용량 남음' }),
  ];

  const intros = [
    { id: id('n'), customerId: eh.id, productId: 'p:이뮤니티 에키네시아', date: d(-8), method: '샘플', reaction: '미확인', followUpDone: false },
    { id: id('n'), customerId: jy.id, productId: 'p:하이드레이팅 젤 크림', date: d(-8), method: '샘플', reaction: '관심 있음', followUpDone: true },
  ];

  return { version: 1, settings, customers, interests, purchases, devices, sops, intros, taskLogs: [], products: [], productEdits: [] };
}
