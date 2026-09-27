/* ===================== v23 balance: 果實 and 天賦之書 ("會讓玩家短時間強大太多") =====================
   Both could be bought in bulk with gold / rift badges, so a rich player jumped far ahead in a few minutes.
   - 力量果實・智慧果實・幸運草: +1 each (was +2), and the total a fruit can add to one attribute is capped by level: +1 per 5 levels.
   - 天賦之書: one book can be read per 8 levels (Lv8: 1, Lv16: 2, Lv24: 3 …). Extra books stay in the bag until then.
   Boosts already eaten are kept; the caps only stop further use. */
for (const [k, q, nm] of [['powerFruit', 'str', '力量'], ['wisdomFruit', 'int', '智力'], ['luckClover', 'luk', '幸運']]) Object.assign(ITEMS[k], { v: { [q]: 1 }, d: (k === 'luckClover' ? '四片葉子的幸運草。使用後' : '神奇的果實。吃下後') + nm + '永久+1。（果實加成的上限：每5級+1）' });
ITEMS.tpBook.d = '記載著古老修練法的書。讀完獲得1點天賦點。（每8級才能多讀1本；每買一本會漲價）';
const fruitCap = st => Math.max(1, Math.floor(st.lv / 5)), bookCap = st => Math.floor(st.lv / 8);
function itemBlockMsg(k, st = Game.st) {
  const it = ITEMS[k]; if (!it) return null;
  if (it.use === 'boost') { const q = Object.keys(it.v)[0], cur = (st.boost || {})[q] || 0, cap = fruitCap(st); if (cur + it.v[q] <= cap) return null;
    return '身體還承受不了更多果實的力量。\n（' + (ATTR_NAMES[q] || q) + '的果實加成 +' + cur + '／上限 +' + cap + '；Lv' + (Math.floor(st.lv / 5) + 1) * 5 + '可以再吃）'; }
  if (it.use === 'tp') { const n = st.tpRead || 0, cap = bookCap(st); if (n < cap) return null;
    return '現在的修為還讀不懂更深的內容。\n（已讀' + n + '本／目前上限' + cap + '本；Lv' + (cap + 1) * 8 + '可以再讀）'; }
  return null;
}
{ const _cu = canUseItem; canUseItem = function (k) { if (itemBlockMsg(k)) return false; return _cu(k); }; }
{ const _ui = useItem; useItem = function (k) { const it = ITEMS[k], r = _ui(k); if (r && it && it.use === 'tp') Game.st.tpRead = (Game.st.tpRead || 0) + 1; return r; }; }
