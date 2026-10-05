/* ===================== v12.12 MP 成長下調（玩家 2026-10-05：「角色的成長mp可以下調」） =====================
   問了之後選：從「智力和裝備給的 MP」下調（主要壓魔法型，物理型幾乎不變），幅度約 −25%。
   調整前 Lv40：魔法型 MP 約 135〜153（技能一招 25〜32，滿 MP 放 5〜6 招）、物理型約 55。
   · 智力：每點最大 MP +1.5 → +0.9。　· 裝備上的 MP（武器・防具・飾品的基本數值）×0.6。等級成長（每級 +1）不動。 */
LV_GROW.mpInt = 0.9;
const MP_EQ12 = 0.6;
for (const k in GEAR) { const S = GEAR[k].st; if (S && S.mp > 0) S.mp = Math.max(1, Math.round(S.mp * MP_EQ12)); }
if (ATTR_HELP12 && ATTR_HELP12.int) ATTR_HELP12.int[0] = ATTR_HELP12.int[0].replace('MP+1.5', 'MP+0.9');
if (ATTR_HELP && ATTR_HELP.int) ATTR_HELP.int = ATTR_HELP.int.replace('最大MP+1.5', '最大MP+0.9');
