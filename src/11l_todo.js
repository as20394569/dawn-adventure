/* ===================== v12.46「還能做什麼」加上新玩法的進度 =====================
   第一季之後的清單只有支線・委託・圖鑑・成就；裂界深淵、競技場、懸賞、釣魚、料理、藏寶圖都看不到。 */
{ const _tl = todoLines12; todoLines12 = function (st = Game.st) { const L = _tl(st), P = (t, c, i) => L.push([t, c, 10, i ? 6 : 0]);
    P('其他玩法', UIC.accent);
    try { if (typeof abyOpen === 'function' && abyOpen(st)) { const S = abySt(st); P('・裂界深淵：最高第 ' + (S.best || 0) + '／30 層' + (st.flags.aby13Lord ? '（裂界之主 已打倒）' : ''), UIC.text, 1); } } catch (e) { }
    try { const A = arenaSt(st), nx = ARENA13.find(R => !A.clr[R.id]); P('・王都競技場：' + (nx ? '下一個' + nx.n + '（Lv' + nx.lv + '）' : '全部通過'), UIC.text, 1); } catch (e) { }
    try { const S = bty13St(st), K = Object.keys(BOUNTY13); P('・公會的懸賞：解決 ' + K.filter(k => S[k] === 'done').length + '／' + K.length, UIC.text, 1); } catch (e) { }
    try { P('・釣魚：' + (rodOf13(st) >= 0 ? fishKinds13(st) + '／' + FISH_KEYS13.length + ' 種' : '找萌芽鎮池塘邊的羅德'), UIC.text, 1); } catch (e) { }
    try { P('・料理：做過 ' + DISH_KEYS13.filter(k => (st.cookSeen13 || {})[k]).length + '／' + DISH_KEYS13.length + ' 道', UIC.text, 1); } catch (e) { }
    try { P('・藏寶圖：' + (st.flags.tm13 ? '找到 ' + tmFound13(st) + '／' + TMAP_KEYS13.length + ' 個' : '找萌芽鎮南邊的巴克'), UIC.text, 1); } catch (e) { }
    return L; }; }
