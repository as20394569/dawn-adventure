// extract CJK string literals from world/story files, run them through the v14 text fixes, list those still naming removed systems
const fs = require('fs'), path = require('path');
const SRC = '/home/claude/dawn/src';
const FILES = (process.env.FILES || '').split(',').filter(Boolean);
const KW = new RegExp(process.env.KW || '等級|Lv\\s*\\d|升級|技能|天賦|裝備|屬性|MP|魔力|強化|打造|晶石|絕技|會心|物攻|魔攻|物防|魔防|經驗|果實|秘傳之書|修練之書|幸運草|設計圖|防禦|練等|技能點|屬性點|武器|防具|閃避|命中|速度');
module.exports = async (g) => {
  const lits = [];
  for (const f of FILES) { const src = fs.readFileSync(path.join(SRC, f), 'utf8'); const re = /'((?:[^'\\\n]|\\.)*)'/g; let m;
    while ((m = re.exec(src))) { const s = m[1]; if (!/[一-鿿]/.test(s) || !KW.test(s)) continue; const line = src.slice(0, m.index).split('\n').length; lits.push({ f, line, s: s.replace(/\\n/g, '\n').replace(/\\'/g, "'") }); } }
  const res = await g.ev(({ L, kw }) => { const re = new RegExp(kw); return L.map(o => { let t = o.s; try { t = KD.fixTxt(typeof ncTxt12 === 'function' ? ncTxt12(KD.fixTxt(t)) : t); } catch (e) { } return { ...o, t, still: re.test(t) }; }); }, { L: lits, kw: KW.source });
  for (const r of res) if (r.still) g.log(r.f + ':' + r.line + '  ' + r.t.replace(/\n/g, '⏎').slice(0, 160));
  g.log('total', res.length, 'still', res.filter(r => r.still).length);
};
