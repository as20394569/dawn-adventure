const fs = require('fs');
module.exports = async (g) => { const s = fs.readFileSync(process.env.SAVE, 'utf8');
  const r = await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); KD.state(st).catchup = 0; startOverworld();
    const fx = t => KD.fixTxt(typeof ncTxt12 === 'function' ? ncTxt12(KD.fixTxt(t)) : t), bad = /等級|Lv\s*\d|技能樹|天賦|裝備|屬性點|MP|魔力(?!草)|打造|晶石|絕技|經驗值|練等|技能點|物攻|魔攻|物防|魔防|防禦(?!卡)|會心|設計圖/;
    const out = []; const chk = (where, t) => { t = fx(String(t)); if (bad.test(t)) out.push(where + ' | ' + t.replace(/\n/g, '⏎').slice(0, 200)); };
    if (typeof GROW12 !== 'undefined') GROW12.forEach(q => chk('GROW12 ' + q[0], q[0] + '：' + q[1]));
    if (typeof BATTLE_HELP !== 'undefined') BATTLE_HELP.forEach(p => p[1].forEach(l => chk('HELP ' + p[0], l)));
    ACHIEVEMENTS.forEach(a => chk('ACH ' + a.id, a.n + '：' + a.d));
    if (typeof TITLES !== 'undefined') TITLES.forEach(T => chk('TITLE ' + T.id, T.n + '：' + T.d));
    try { const L = typeof questList === 'function' ? questList() : []; L.forEach(q => chk('QUEST ' + q.n, q.t + ' ' + (q.r || ''))); } catch (e) { out.push('questList err ' + e.message); }
    for (const k in ITEMS) { const it = ITEMS[k]; if ((st.bag || {})[k] || it.key) chk('ITEM ' + k, it.n + '：' + it.d); }
    for (const k in MATCAT11) if (ITEMS[k]) { chk('MAT ' + k, ITEMS[k].d); break; }
    for (const k of Object.keys(ITEMS).filter(k => /^pt_/.test(k)).slice(0, 1)) chk('PART ' + k, ITEMS[k].d);
    if (typeof AEV !== 'undefined') for (const k in AEV) chk('AEV ' + k, AEV[k].d || '');
    if (typeof WEATHER_OF !== 'undefined') for (const k in WEATHER_OF) chk('WX ' + k, WEATHER_OF[k].join(' '));
    return out; }, s);
  for (const l of r) g.log(l); };
