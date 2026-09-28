module.exports = async (g) => {
  g.log(await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, ch2: 3 }); st.map = 'capital'; st.x = 15; st.y = 10; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; G.UI.clear();
    const ow = G.Game.scene; return ow.npcs.map(n => n.id + '@' + n.x + ',' + n.y + '=' + npcQuestState(n.id)).join(' '); }));
};
