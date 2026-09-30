/* ===================== v10.7 every NPC has a name and a face of their own (player: 「把撞臉都換掉，沒名字賦予名字」) =====================
   - Nameless NPCs get a name; role-only names that several people shared (馬車夫×4, 冒險者×2, 近衛兵×2…) become role + name.
     Every new name keeps the old role text in it, so story lines that say 「馬車夫：「…」」 still find the right person.
   - Everybody who shared a field look's portrait with someone else gets a portrait of their own (Codex task AA, original
     large images). The field sprites stay; the new faces keep the outfit colours of their field look.
   - The route hiker stood next to the caravan merchant with the same field look; he now uses the `traveler` look. */
const NPC_FACES = { // 'map.id': [name, portrait key or null (keeps the look's portrait)]
  'town.kid': ['小豆', null], 'town.florist': ['莉莉', null], 'town.grandpa': ['歐文爺爺', 'grandpa'], 'town.peddler': ['行商卡羅', 'peddler'],
  'town.royalKnight': ['王都的騎士雷恩', 'royalKnight'], 'town.coachT': ['馬車夫湯姆', null],
  'inn.traveler': ['旅人卡姆', 'innTraveler'], 'inn.antiquer': ['古董商奧斯卡', 'antiquer'],
  'shop.customer': ['客人貝蒂', 'customer'], 'shop.clerk': ['店員米洛', null], 'elder.apprentice': ['學徒小寶', null],
  'route.hiker': ['登山客洛恩', 'hiker'], 'route.girl2': ['小梅', 'girl2'], 'route.caravan': ['商人巴托', 'caravan'],
  'guild.guildAdv1': ['冒險者賽門', 'guildAdv1'], 'guild.guildAdv2': ['冒險者薩克', null], 'guild.guildClerk': ['公會櫃檯安娜', 'guildClerk'],
  'capital.capKid': ['小皮', 'capKid'], 'capital.capOld': ['哈洛德爺爺', 'capOld'], 'capital.capWoman': ['主婦瑪莉', 'capWoman'],
  'capital.capBard': ['街頭詩人米諾', 'streetBard'], 'capital.coachC': ['馬車夫羅伊', 'coachC'], 'capital.gateGuardN': ['北門守衛凱', 'gateGuardN'],
  'capital.gateGuardS': ['城門守衛馬可', 'gateGuardS'], 'castle.castleGuard1': ['近衛兵亞當', null], 'castle.castleGuard2': ['近衛兵班恩', 'castleGuard2'],
  'capInn.capInnkeeper': ['旅店的葛蕾塔', 'capInnkeeper'], 'capInn.capInnGuest': ['旅客托比', 'capInnGuest'], 'capShop.capClerk': ['道具店的尼克', 'capClerk'],
  'capHouse.capResident': ['老婦人葛蕾絲', 'capResident'], 'capHouse2.capScholar': ['歷史學者諾曼', 'scholar'],
  'armory.armorer': ['武具店老闆洛克', 'armorer'], 'armory.capSmith': ['王都的鐵匠伯恩', 'capSmith'], 'church.nun': ['修女瑟琳娜', 'nun'],
  'clockShop.clockApprentice': ['學徒奇普', 'clockApprentice'], 'bardHall.hallGuest': ['聽眾露西', 'hallGuest'],
  'northRoad.coachN': ['馬車夫傑克', 'coachN'], 'northRoad.roadMerchant': ['旅行商人馬修', 'roadMerchant'], 'maplePass.coachM': ['馬車夫哈利', 'coachM'],
  'frostVillage.coachF': ['雪橇車夫伊凡', 'coachF'], 'frostVillage.frostKid': ['小雪', 'frostKid'], 'frostShop.frostClerk': ['雜貨店的歐拉', 'frostClerk'],
  'frostInn.frostInnkeeper': ['暖爐旅店的瑪姬', 'frostInnkeeper'], 'temple.monkPupil': ['修行僧阿岳', 'monkPupil'],
  'goldPlains.plainsFarmer': ['麥田的農夫葛雷', 'plainsFarmer'], 'goldPlains.plainsGirl': ['牧羊女蘿拉', 'plainsGirl'],
  'windHills.hansDown': ['漢斯', 'hans'], 'millHouse.hans': ['漢斯', 'hans'], 'lake.hermit': ['湖畔隱士', 'hermit'], 'mine.miner': ['老礦工吉姆', 'miner'],
};
for (const [mk, [name, key]] of Object.entries(NPC_FACES)) {
  const [m, id] = mk.split('.'), n = MAPS[m] && (MAPS[m].npcs || []).find(x => x.id === id); if (!n) continue;
  n.name = name; if (key) PORTRAIT_NAME[name] = key;
}
{ const h = MAPS.route && (MAPS.route.npcs || []).find(x => x.id === 'hiker'); if (h) h.look = 'traveler'; }
SPK_INDEX = null;
// a story line naming someone by role (「馬車夫：「…」」) shows that person's own face, preferring the one on the current map
speakerFor = function (name) {
  if (Game.st && name === Game.st.name) return { name, hero: 1 };
  const L = spkIndex(), here = Game.st ? L.filter(x => x.map === Game.st.map) : [], f = A => A.find(x => x.name === name) || A.find(x => x.name.endsWith(name)) || A.find(x => x.name.includes(name));
  const e = f(here) || f(L); return { name, look: e ? e.look : null, pn: e ? e.name : null };
};
{ const _po = portraitOf; portraitOf = function (w) {
    if (w && w.pn && w.pn !== w.name && PORTRAIT_NAME[w.pn] && PORTRAIT_ART[PORTRAIT_NAME[w.pn]]) return _po({ ...w, name: w.pn }); return _po(w); }; }
