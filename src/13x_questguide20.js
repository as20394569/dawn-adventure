/* ===================== v12.141 追蹤委託時，上方引導沒有出現 =====================
   玩家 2026-10-12：「任務設定成追蹤時沒有更新上方引導」
   查到：一般任務設成追蹤，右上角的引導（★ 要做什麼→往哪走 ↗）會換；但 43 個委託裡有 28 個算不出要去哪，引導就整條消失。
   原因：引導只看得懂最早的兩種委託（打倒 N 隻、帶素材來），v12.0.8d 改成的新寫法（懸賞魔物・調查・護送・夜晚／起霧採集・送貨・
   打倒強化魔物）、找失物（銀懷錶）、送信都沒有接上。
   現在委託一律從它自己的「目標清單」（委託詳情頁那一份）算：
   · 還沒完成的第一個目標：要做什麼（例：打倒蜂王電電蜂、看水晶簇、陪學徒小寶走到廢棄礦坑、霧裡的沼苔（起霧時））；
   · 去哪：目標寫的地方 → 寫「採集 X」就找採得到 X 的地方 → 寫「打倒 X」就找 X 出沒的地方 → 委託說明裡提到的地名，取最近的；
     懸賞魔物直接指到牠站的位置；送信指到收信的人（說明裡寫的那張地圖上的那位）；
   · 都完成了：回報委託人（原本就有）。
   沒有固定地點的（打倒強化魔物 3 隻：野外、迷宮）只顯示要做什麼，不畫箭頭。 */
{ const mapsIn = txt => { const out = []; if (!txt) return out;
    for (const id in MAPS) { const nm = MAPS[id].name; if (!nm || nm.length < 2 || txt.indexOf(nm) < 0) continue; out.push([nm.length, mapIdByName(nm) || id]); }
    out.sort((a, b) => b[0] - a[0]); return out.length ? [out[0][1]] : []; };
  const itemByName = nm => Object.keys(ITEMS).find(k => ITEMS[k].n === nm && !ITEMS[k].key) || null;
  const spByName = nm => Object.keys(SPECIES).find(k => SPECIES[k].n === nm) || null;
  const npcIn = (id, txt) => { const all = []; for (const k in MAPS) for (const n of MAPS[k].npcs || []) if (n.id === id) all.push({ map: k, x: n.x, y: n.y, name: n.name });
    const pref = mapsIn(txt)[0]; return all.find(s => s.map === pref) || all[0] || null; };
  const _qd = questDest; questDest = function (q, st = Game.st) { const D = _qd(q, st); if (D || !q || q.done || typeof questCom !== 'function') return D;
    const qc = questCom(q); if (!qc) return D; const { cid, c } = qc, R = c.c12 || {};
    if (c.deliver && ITEMS[c.deliver[0]]) { const s = npcIn(c.deliver[1], c.d); if (s) return { map: s.map, spot: s, what: '把' + ITEMS[c.deliver[0]].n + '交給' + (s.name || '對方') }; }
    let T = []; try { T = comTargets(c, st) || []; } catch (e) { T = []; }
    const t = T.find(x => (x.have || 0) < (x.need || 1)) || T[0];
    if (t) { const W = (t.where || []).join('、'), when = /晚上/.test(W) ? '（晚上）' : /起霧/.test(W) ? '（起霧時）' : '', what = t.label + when;
      if (R.bounty && typeof BOUNTY12 !== 'undefined' && BOUNTY12[R.bounty]) { const B = BOUNTY12[R.bounty]; return { map: B[5], spot: { x: B[6][0], y: B[6][1] }, what }; }
      let maps = [];
      for (const w of t.where || []) { maps.push(...mapsIn(w)); const a = /採集(.+)$/.exec(w), b = /打倒(.+)$/.exec(w);
        if (a) { const k = itemByName(a[1]); if (k) maps.push(...itemMaps(k)); } if (b) { const s = spByName(b[1]); if (s) maps.push(...speciesMaps(s)); } }
      if (!maps.length) { const b = /^打倒(.+)$/.exec(t.label); if (b) { const s = spByName(b[1]); if (s) maps.push(...speciesMaps(s)); } }
      if (!maps.length) maps.push(...mapsIn(c.d));
      const m = maps.length ? nearestMap([...new Set(maps)], st) : null;
      return { map: m, what: m ? what : what + (W ? '（' + W + '）' : '') }; }
    const g = typeof COM_GIVER !== 'undefined' && COM_GIVER[cid] && npcSpot(COM_GIVER[cid]); if (g) return { map: g.map, spot: g, what: '找' + (g.name || c.from) };
    return null; };
  // 沒有固定地點的目標：只寫要做什麼（建議等級・路線也不寫）
  const _qt = questTips; questTips = function (q, st = Game.st) { const D = questDest(q, st); if (D && !D.map) return []; return _qt(q, st); }; }
