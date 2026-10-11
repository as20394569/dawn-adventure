// Lv15 以上的菁英・頭目戰能不能正常開打（v12.126：一行寫錯讓所有 Lv15+ 菁英頭目戰卡黑畫面，之後每次都跑）: node tools/play.js tools/eb_smoke.js
module.exports = async (g) => { const out = [];
  for (const [sp, lv, kind] of [['frostQueen', 40, 'boss'], ['wolf', 20, 'elite'], ['golem', 15, 'boss'], ['thalassa14', 60, 'boss'], ['boneKnight', 25, 'elite'], ['flower', 12, 'elite']]) {
    try { await g.ev(([sp, lv, kind]) => { const G = __game; G.UI.clear(); G.newGameState('測'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, tutIntent14: 1 }); st.lv = 50; st.map = 'forest'; st.x = 3; st.y = 16; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; window.__e = [];
      G.Game.autoPlay = b => ({ type: 'defend' }); const ow = G.Game.scene; ow.script = null; ow.run(ow.battleScript({ sp, lv, kind, id: 'smoke_' + sp })); }, [sp, lv, kind]);
      let rounds = 0; for (let f = 0; f < 700 && rounds < 4; f++) { const u = await g.ui(); if (u.includes('TextBox') || u.includes('Menu')) await g.press('a', 2); else await g.step(3); rounds = await g.ev(() => { const b = __game.Game.scene; if (b.core) for (const k in b.core.byId) b.core.byId[k].res.hp = b.core.byId[k].max.hp; return b.round || 0; }); }
      out.push(sp + ':R' + rounds + ':' + (await g.ev(() => __game.Game.scene.constructor.name)) + ':mech=' + (await g.ev(() => { const b = __game.Game.scene; const u = b.core && Object.values(b.core.byId).find(x => !x.hero); return u ? u.data.mechanics.join('/') : '-'; })));
    } catch (e) { out.push(sp + ':ERR ' + e.message.slice(0, 120)); } }
  console.log(out.join('\n')); };
