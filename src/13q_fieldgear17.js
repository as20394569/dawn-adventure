/* ===================== v12.124 野外不再撿到裝備・拿到裝備不自動幻化 =====================
   玩家 2026-10-11：「野外撿到裝備跟一開始就有外觀幻化的問題」
   原本：地上的道具球如果是舊裝備（例如迷霧森林的「曙光之劍」），會變成一件同階的底裝，品質強制紅色以上，
   外觀還已經自動換成那件舊裝備 → 在森林就撿到【金】月光劍、而且一拿到就是幻化過的樣子。
   玩家選了：
   1. 野外不再撿到裝備（武器・防具・盾）：那些道具球改成給「那張地圖的魔物素材」＋金錢。
      素材：從這張地圖會出現的魔物素材裡挑（最多兩種），數量 3＋（原本的品質 −2），比素材高階的地區照 v12.31 的算法多給幾個；
      金錢：40 G × 地區階級。飾品照舊（飾品不能在鐵匠打造，拿掉就拿不到了）。
   2. 拿到裝備時（任務獎勵、頭目・菁英掉落……）不再自動套上外觀：裝備是它原本的樣子，外觀只是「解鎖」，
      想換再自己去鐵匠「幻化」。拿到時會說解鎖了哪個外觀。
      已經被自動換過外觀的裝備不動（舊存檔），想換回來可以到鐵匠「幻化」選「原本的樣子」。 */
const GLNEW17 = [];
{ const _mg = makeGear; makeGear = function (b, q, r) { const st = Game.st, had = st ? { ...glam11(st) } : {};
    const g = _mg.call(this, b, q, r); if (g && g.gl) delete g.gl;
    if (st) for (const k in glam11(st)) if (!had[k] && !GLNEW17.includes(k)) GLNEW17.push(k); return g; }; }
const glNews17 = () => GLNEW17.splice(0).filter(k => GEAR[k]).map(k => '「' + GEAR[k].n + '」');
{ const _bp = gainBP; gainBP = function (...a) { const r = _bp.apply(this, a), L = glNews17(); return r + (L.length ? '（解鎖了' + L.join('、') + '的外觀）' : ''); }; }
{ const _ig = itemGet; itemGet = function* (text, ...a) { yield* _ig(text, ...a); const L = glNews17(); if (L.length) yield* say('解鎖了' + L.join('、') + '的外觀！\n（想換外觀的話，到鐵匠選「幻化」）'); }; }
{ const _ls = Battle.prototype.lootShow; if (_ls) Battle.prototype.lootShow = function* (...a) { yield* _ls.apply(this, a); const L = glNews17(); if (L.length) yield* this.msg('解鎖了' + L.join('、') + '的外觀！（鐵匠→幻化）', { hold: 26 }); }; }

// 1. 野外的道具球：裝備 → 當地素材＋金錢
{ const _pi = Overworld.prototype.pickItem; Overworld.prototype.pickItem = function* (it) {
    const G = it && !it.gather && !it.gold && it.item && GEAR[it.item];
    if (!G || G.slot === 'acc') return yield* _pi.call(this, it);
    const st = this.st, id = this.map && this.map.id, M = MAPS[id] || {}; this.items = this.items.filter(i => i !== it); st.flags[it.id] = 1;
    const R = Math.max(1, regionT13(id) || 1), mats = [];
    for (const e of M.encounters || []) for (const r of e.table || []) { const k = (SPECIES[r[0]] || {}).mat; if (k && MATCAT11[k] && ITEMS[k] && !mats.includes(k)) mats.push(k); }
    let pool = mats.length ? mats : Object.keys(MATCAT11).filter(k => ITEMS[k] && (MATT11[k] || 1) === R); if (!pool.length) pool = Object.keys(MATCAT11).filter(k => ITEMS[k]);
    const n = 3 + Math.max(0, (it.q || 2) - 2), a = pick(pool), rest = pool.filter(k => k !== a), b = rest.length ? pick(rest) : a, got = {};
    got[a] = Math.ceil(n / 2); got[b] = (got[b] || 0) + Math.floor(n / 2);
    for (const k in got) { const t = MATT11[k] || 1; if (t < R) got[k] = Math.round(got[k] * tierPts11(R) / tierPts11(t)); st.bag[k] = (st.bag[k] || 0) + got[k]; }
    const gold = 40 * R; st.money += gold;
    Sound.jingle('item'); yield* itemGet(st.name + '撿到了素材：' + matLine12(got) + '，還有 ' + gold + ' G！'); yield* matTut12(say); }; }

// 說明文字跟著改
{ const _lh = lootHint; lootHint = function (key, sp) { return String(_lh(key, sp)).replace(/（底裝＋外觀）/g, '（底裝・解鎖外觀）'); }; }
NC_TXT12.push([/退場裝備的外觀：舊存檔有的、寶箱和任務給的、/g, '退場裝備的外觀：舊存檔有的、任務獎勵和魔物掉落的、']);
