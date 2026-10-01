/* ===================== BATTLE UI v3: fantasy-RPG HUD (not the corner boxes / 2x2 grid / platforms) =====================
   · foe: a floating nameplate + thin gauge above its head
   · hero: over-the-shoulder, with a full-width gold-trimmed status bar at the bottom of the stage
   · commands: an icon hotbar (攻擊・技能・道具・防禦・逃跑) */
const CMD_ICONS = {
  攻擊: spriteFrom(['..........kk', '.........kWk', '........kWk.', '.......kWk..', '......kWk...', '.k...kWk....', '.kk.kWk.....', '..kkWk......', '..kGk.......', '.kGkkk......', 'kGk..k......', 'kk..........'], { k: '#1a1420', W: '#e8eef8', G: '#e8b040' }),
  技能: spriteFrom(['.....kk.....', '.....kYk....', '....kYYk....', 'kkkkkYYkkkk.', 'kYYYYWYYYYk.', '.kYYWWWYYk..', '..kYYWYYk...', '..kYYkYYk...', '.kYYk.kYYk..', '.kYk...kYk..', 'kkk.....kkk.', '............'], { k: '#1a1420', Y: '#ffcf5a', W: '#fff8d0' }),
  道具: spriteFrom(['....kkkk....', '...k....k...', '..kkkkkkkk..', '.kBBBBBBBBk.', 'kBBbbBBBBBBk', 'kBBBBBGGBBBk', 'kBBBBBGGBBBk', 'kBBBBBBBBBBk', 'kBbBBBBBBbBk', '.kBBBBBBBBk.', '..kkkkkkkk..', '............'], { k: '#1a1420', B: '#b87a40', b: '#e0a060', G: '#ffcf5a' }),
  防禦: spriteFrom(['kkkkkkkkkkk.', 'kSSSSSSSSSk.', 'kSWWSSSSSSk.', 'kSWSSSGSSSk.', 'kSSSSGGGSSk.', 'kSSSSSGSSSk.', '.kSSSSSSSk..', '.kSSSSSSSk..', '..kSSSSSk...', '...kSSSk....', '....kSk.....', '.....k......'], { k: '#1a1420', S: '#6a9ae0', W: '#d8e8ff', G: '#ffcf5a' }),
  逃跑: spriteFrom(['......kk....', '.....kSSk...', '.....kSSk...', '...kkkSk....', '..kSSSSSkk..', '.k..kSSk.Sk.', '....kSSk....', '...kSkkSk...', '..kSk..kSk..', '.kSk....kSk.', 'kkk......kk.', '............'], { k: '#1a1420', S: '#9ae0c0' }),
};

