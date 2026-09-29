/* ===================== v27b quest givers that had no mark over their heads (playtest: "some NPCs' quests have no ?") =====================
   村長 (license), 花店 (小麥), 守衛 (提姆), 鐵匠 (犀角), 藥師 (米拉), 信差 (峽谷鷹妖), 守燈人 (霧), 行商 (盜賊的謝禮) */
{ const add = (id, fn) => { const old = STORY_MARKS[id]; STORY_MARKS[id] = old ? st => { const a = fn(st), b = old(st); return a === '?' || b === '?' ? '?' : a || b; } : fn; };
  add('elder', st => !st.flags.license ? '!' : null);
  add('florist', st => { const f = st.flags; return !f.q1 ? '!' : f.q1res && !f.q1done ? '?' : null; });
  add('guard', st => { const f = st.flags; return f.croc && !f.q2 ? '!' : (f.q2res === 'home' && !f.q2done) || (f.q2res === 'stay' && f.q2done && !f.q2thx) ? '?' : null; });
  add('smith', st => { const f = st.flags; return st.vis && st.vis.canyon && !f.qHorn ? '!' : f.qHorn === 1 && (st.bag.rhinoHorn || 0) > 0 ? '?' : null; });
  add('herbalist', st => { const f = st.flags; return st.vis && st.vis.lake && !f.qMira ? '!' : f.qMira === 2 ? '?' : null; });
  add('courier', st => { const f = st.flags; if (!f.qCourier) return '!'; return f.qCourier === 1 && typeof wonOf === 'function' && wonOf('harpy') - ((st.qBase || {}).harpy || 0) >= 3 ? '?' : null; });
  add('lampKeeper', st => { const f = st.flags; return !f.qLamp ? '!' : f.hydra && f.qLamp < 3 ? '?' : null; });
  add('peddler', st => st.flags.bandit && !st.flags.peddlerThx ? '?' : null);
}
