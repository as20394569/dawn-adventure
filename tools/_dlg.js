module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 5; st.cls = 'swordsman'; st.map = 'town'; st.x = 10; st.y = 14; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    const ow = G.Game.scene; ow.run(say('瑪莎：「小晨，你今天也要去晨霧道路嗎？最近森林那邊好像不太平靜，記得帶幾瓶傷藥再出門喔。」')); });
  await g.step(200); await g.shot('dlg_before');
  g.log(await g.ui());
};
