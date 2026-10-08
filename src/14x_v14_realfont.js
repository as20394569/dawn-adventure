/* ===================== v14.33 卡牌戰鬥・卡面的字用真正的大小 =====================
   原因：v12.0.5 定了「最小字級 8」——比 8 小的字一律用 8 的高度畫、只把寬度壓窄（10zzm）。
   卡牌戰鬥（v14）的字都設計成 4～7，所以畫出來全都是「8 那麼高、被壓窄」的字：看起來比設定大、又瘦又高，還會超出它的那一行（碰到下面的小牌子、超出框）。
   玩家一再說「字太大」「還是太大」就是這個。現在：卡牌戰鬥的畫面、所有卡面（牌組・選卡・商店）上的字照設定的大小畫；其他畫面（地圖・選單・對話）照舊最小 8。 */
Font.real = 0;
{ const _dc = KD.drawCard; KD.drawCard = function () { Font.real++; try { return _dc.apply(this, arguments); } finally { Font.real--; } }; }
{ const _r = render; render = function () { const b = Game.scene, on = !!(b && b.k14 && typeof Battle !== 'undefined' && b instanceof Battle); if (on) Font.real++; try { return _r(); } finally { if (on) Font.real--; } }; }
