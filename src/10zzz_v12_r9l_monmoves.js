/* ===================== v12.0.9l 魔物招式：名字／說明和實際行為對齊（玩家 2026-10-04「部分怪物招式名稱與行為不符」） =====================
   逐一比對 299 招魔物招式的名字、說明和實際效果，改了這些：
   - 名字或說明是「連續攻擊」、實際只打 1 下 → 改成多段（總威力差不多）：啄擊 3 段、骨牙連擊 2 段、突進連刺 3 段、三首連咬 3 段。
   - 「吸血」（蚊子類）實際沒有吸血 → 加上吸取傷害的一半。
   - 「呼伴長嚎」只提升能力、不會叫同伴（叫同伴是另一個行動）→ 改名「長嚎」。
   - 鼠王的盛宴、豐收之刻其實會吸取傷害的 30%，說明沒寫 → 補上。 */
{ const multi = (id, n, pow) => { const D = DEF.skills[id], M = MOVES[id]; if (!D || !M) return; M.hits = n; M.pow = pow; D.hits = [n, n]; D.power = pow; if (!D.tags.includes('multi_hit')) D.tags.push('multi_hit'); };
  multi('m_peck', 3, 13); multi('m_boneRush', 2, 36); multi('m_spearRush', 3, 29); multi('m_tripleBite', 3, 31);
  const txt = (id, n, d) => { const D = DEF.skills[id], M = MOVES[id]; if (!D || !M) return; if (n) { M.n = n; D.name = n; } if (d) { M.d = d; D.desc = d; } };
  txt('m_peck', null, '用尖嘴連續啄 3 下。'); txt('m_boneRush', null, '用骨頭獠牙連續咬 2 下。'); txt('m_spearRush', null, '衝上前連續刺 3 下。'); txt('m_tripleBite', null, '三顆頭輪流咬過來，共 3 下。有時會讓對手退縮。');
  { const D = DEF.skills.m6_bloodsuck; if (D) { MOVES.m6_bloodsuck.drain = 0.5; if (!D.tags.includes('drain')) D.tags.push('drain'); D.after = (D.after || []).concat([effRegister('skill:m6_bloodsuck#a9', { type: 'heal', ofCast: 0.5, target: 'self', kind: 'drain', quiet: 1 })]); }
    txt('m6_bloodsuck', null, '用細長的針吸血，回復造成傷害一半的 HP。常常讓對手中毒。'); }
  txt('m12_wolfCall', '長嚎', '仰天長嚎、壯大聲勢。提升物攻和速度。');
  txt('m_kingsFeast', null, '吃掉身邊的小老鼠（每隻威力 +20%），再撲上來大咬一口，吸取傷害的 30%。');
  txt('m_harvest', null, '揮動巨鐮收割一切，吸取傷害的 30%。無視防禦，但打不中閃避中的對手。'); }
