/* ===================== v12.46 潮鳴港的委託（4 件） =====================
   第三章序章的港町只有主線；碼頭的漁夫、港務所的水手、老婆婆、散步的水手各有一件委託。 */
ITEMS.seaLetter13 = { n: '老婆婆的信', key: 1, price: 0, sell: 0, cat: '重要物品', d: '潮鳴港的老婆婆寫給萌芽鎮老爺爺的信。信封已經泛黃了。' };
Object.assign(COMMISSIONS, {
  c36: { n: '偷魚的浪花蟹', from: '漁夫托馬', d: '浪花蟹把曬在碼頭的魚都偷光了。接下委託後，在珊瑚海岸擊敗浪花蟹×5。', kill: ['surfCrab13', 5], reward: { gold: 5000, items: { megaPotion: 3 } }, open: st => !!st.flags.siren13 },
  c37: { n: '霧裡的叫聲', from: '港務所的水手', d: '海霧鴞整晚在港口外面叫，船員都睡不著。接下委託後，在珊瑚海岸擊敗海霧鴞×4。', kill: ['fogOwl13', 4], reward: { gold: 3000, items: { tpBook: 1 } }, open: st => ch3(st) >= 1 },
  c38: { n: '五十年前的信', from: '老婆婆', d: '想請你把一封信交給萌芽鎮的老爺爺。', deliver: ['seaLetter13', 'grandpa'], reward: { gold: 2000, items: { elixir: 2 } }, open: st => ch3(st) >= 1 },
  c39: { n: '沉船灣的水手們', from: '水手', d: '被歌聲叫醒的溺亡水手還在沉船灣裡徘徊。接下委託後，擊敗溺亡水手×5。', kill: ['drownSailor13', 5], reward: { gold: 8000, items: { megaEther: 2 } }, open: st => !!st.flags.siren13 },
});
Object.assign(COM_GIVER, { c36: 'seaDad13', c37: 'harborClerk13', c38: 'seaGran13', c39: 'sailor13' });
Object.assign(NPC_WHERE, { seaDad13: '潮鳴港・碼頭', harborClerk13: '潮鳴港・港務所', seaGran13: '潮鳴港', sailor13: '潮鳴港' });
Object.assign(COM_TALK, {
  c36: ['船是回來了，可是曬在碼頭的魚又被偷了！', '是珊瑚海岸的浪花蟹。幫我打倒5隻吧。'],
  c37: ['海霧鴞整晚在港口外面叫……', '船員都睡不好。能幫我打倒4隻嗎？'],
  c38: ['五十年前，我在萌芽鎮住過一個夏天。', '那時候有個愛爬樹的男孩子……說好要寫信，我卻一直沒寄出去。', '這封信，能幫我交給萌芽鎮的老爺爺嗎？'],
  c39: ['沉船灣裡的那些水手……以前都是我的同伴。', '請你讓他們好好睡吧。打倒5個溺亡水手。'],
});
Object.assign(COM_THANKS, { c36: '魚保住了！今天晚上請你吃烤魚！', c37: '終於安靜了。今晚大家都能好好睡一覺。', c39: ['……謝謝你。', '他們終於能回到海裡睡覺了。'] });
if (typeof COM_AFTER !== 'undefined') Object.assign(COM_AFTER, {
  c36: ['碼頭的魚架又掛滿了。你要不要帶一條走？'], c37: ['燈塔那邊安靜了。今天早上，我第一次聽到海浪的聲音。'],
  c38: ['信送到了？……他說了什麼？', '……是嗎。那棵樹還在啊。', '謝謝你。這次換我等他的回信了。'], c39: ['昨天晚上，海上有好多小小的光往深處沉下去。……他們回家了。'] });
NPC_ROLES.任務.push('seaDad13', 'seaGran13', 'sailor13');
// the letter reaches the old man in 萌芽鎮 (the generic delivery lines belong to the flower shop letter)
{ const _nc = npcCommission; npcCommission = function (id, ow, ent) { const st = Game.st, s = st && st.com && st.com.c38;
    if (id === 'grandpa' && s && s.s === 'on' && st.bag.seaLetter13) return (function* () { delete st.bag.seaLetter13; s.s = 'done';
      yield* say('把「老婆婆的信」交給了老爺爺。');
      yield* sayAll(['老爺爺：「……這個字，是小潮？」', '（老爺爺把信讀了好幾遍。）', '老爺爺：「五十年了……她還記得那棵樹啊。」', '老爺爺：「謝謝你，孩子。這是我年輕時存下來的，拿去吧。」']);
      yield* say('完成了委託「五十年前的信」！'); yield* giveReward(COMMISSIONS.c38.reward); })();
    return _nc(id, ow, ent); }; }
