module.exports = async (g) => {
  for (const [m, x, y, n] of [['maplePass', 12, 30, 'a1'], ['maplePass', 11, 12, 'a2'], ['maplePass', 11, 5, 'a3'], ['oldField', 11, 28, 'b1'], ['oldField', 11, 18, 'b2'], ['oldField', 11, 5, 'b3']]) {
    await g.ev(([m, x, y]) => { const G = __game; G.UI.clear(); G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, ch2: 1, v81: 1, passQ: 1, passIn: 1, fieldIn: 1, grenTrust: 1, passTop: 1, fieldTop: 1, passCamp: 1 }); st.lv = 20; st.map = m; st.x = x; st.y = y; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; G.Game.scene.script = null; }, [m, x, y]);
    await g.step(40); await g.shot('v130_' + n);
  }
};
