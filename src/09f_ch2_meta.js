/* ===================== CHAPTER 2 — achievements, titles, save migration ===================== */
ACHIEVEMENTS.push(
  { id: 'ch2start', n: '北上', d: '收到王都的召集令。', ok: st => (st.flags.ch2 || 0) >= 1 },
  { id: 'gears', n: '時之齒輪', d: '找回兩個時之齒輪。', ok: st => st.flags.gearSewer && st.flags.gearPlains },
  { id: 'colossus', n: '十二點的鐘聲', d: '打倒時計巨像。', ok: st => st.flags.colossus },
  { id: 'frostQueen', n: '融雪', d: '讓霜之女王清醒過來。', ok: st => st.flags.frostQueen },
  { id: 'lavaGiant', n: '火之印', d: '打倒熔岩巨人。', ok: st => st.flags.lavaGiant },
  { id: 'ch2clear', n: '曙光再臨', d: '打倒影將莫爾德，讓曙光鐘再次響起。', ok: st => (st.flags.ch2 || 0) >= 10 },
  { id: 'starGuardian', n: '星圖', d: '打倒星之守護者。', ok: st => st.flags.starGuardian },
  { id: 'master', n: '上級職業', d: '解鎖一個上級職業（吟遊詩人・機工士・武僧・龍騎士）。', ok: st => st.flags.clsBard || st.flags.clsMachinist || st.flags.clsMonk || st.flags.clsDragoon },
  { id: 'allMaster', n: '萬能的旅人', d: '解鎖全部四個上級職業。', ok: st => st.flags.clsBard && st.flags.clsMachinist && st.flags.clsMonk && st.flags.clsDragoon },
  { id: 'ch2elite', n: '北境的獵人', d: '打倒北境的7隻菁英魔物。', ok: st => ['blackFeather', 'boarKing', 'clockKnight', 'snowBear', 'frostLich', 'youngDragon', 'duskCaptain'].every(k => st.flags[k]) },
);
for (const [id, c] of [['ch2start', '故事'], ['gears', '故事'], ['colossus', '戰鬥'], ['frostQueen', '戰鬥'], ['lavaGiant', '戰鬥'], ['ch2clear', '故事'], ['starGuardian', '戰鬥'], ['master', '成長'], ['allMaster', '成長'], ['ch2elite', '戰鬥']]) { const a = ACHIEVEMENTS.find(x => x.id === id); if (a) a.cat = c; }
TITLES.push(
  { id: 'dawnHero', n: '曙光的勇者', d: '讓曙光鐘再次響起。', st: { atk: 2, spa: 2, hp: 6 }, ok: st => (st.flags.ch2 || 0) >= 10 },
  { id: 'starSeer', n: '星見者', d: '打倒星之守護者。', st: { crit: 3, spe: 2 }, ok: st => st.flags.starGuardian },
);

/* ---------- catalogue: map types, NPC roles, item categories ---------- */
for (const [k, t] of Object.entries({ northRoad: '野外', goldPlains: '野外', frostField: '野外', emberPass: '野外', starShrine: '野外', capital: '城鎮', frostVillage: '城鎮',
  capSewer: '迷宮', clockTower1: '迷宮', clockTower2: '迷宮', iceCave: '迷宮', lavaTunnel: '迷宮', duskFort1: '迷宮', duskFort2: '迷宮',
  castle: '室內', church: '室內', clockShop: '室內', guild: '室內', bardHall: '室內', capInn: '室內', capShop: '室內', armory: '室內', capHouse: '室內', capHouse2: '室內', frostInn: '室內', frostShop: '室內', temple: '室內', frostHouse: '室內' })) { MAP_TYPES[k] = t; if (MAPS[k]) MAPS[k].type = t; }
Object.assign(ITEMS.megaPotion, { cat: '回復' }); Object.assign(ITEMS.megaEther, { cat: '回復' });
NPC_ROLES.情報.push('gateGuardS', 'gateGuardN', 'capKid', 'capWoman', 'capOld', 'capMerchant', 'capBard', 'chancellor', 'castleGuard1', 'castleGuard2', 'liaCastle', 'nun', 'guildAdv1', 'guildAdv2', 'hallGuest', 'capInnGuest', 'capResident', 'windmill', 'dawnBell', 'iceWall', 'iceWall2', 'frostKid', 'monkPupil', 'liaRoad');
NPC_ROLES.任務.push('royalKnight', 'king');
NPC_ROLES.情報.push('coachT', 'coachN', 'coachC', 'coachF', 'manhole', 'starGate', 'iceCaveDoor', 'lavaDoor');
