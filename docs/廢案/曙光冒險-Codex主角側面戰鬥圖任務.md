> **廢案（PC 重做）**：2026-11-05 玩家決定回到直式手機版 v12.154。程式封存在 GitHub 分支 `archive/pc-remake`。總整理見〈曙光冒險-廢案總整理〉。

# 任務：主角側面戰鬥圖（PC 版，面向右）

> 給 Codex（ChatGPT 專案「RPG」→ 對話「修正角色動畫影格偏移」）。先讀 `AGENTS.md`。
> 這個任務**只新增圖檔**，不改任何程式；接到遊戲裡由 Claude 做。

## 為什麼要畫

PC 版的戰鬥改成**側面對戰**：主角站在畫面左邊、面向右，魔物在右邊（玩家 2026-10-15 選的）。
現在的主角戰鬥圖（`art/hero/px/`）是**過肩背影**，放在側面戰鬥裡很怪，目前先用野外走路圖放大 3 倍頂著。
要一套**同樣做法、同樣部件**的側面版。

## 參考（照抄規格，只換角度）

- 現在的背影版：`art/hero/px/*.png` ＋ `art/hero/px/meta.json`
  - 每個部件一張橫條圖：7 個姿勢 × 40×48，總尺寸 **280×48**，順序 `idle1, idle2, attack1, attack2, cast1, hurt1, guard1`
  - 畫布 40×48，腳底線 **y = 45**，身體中心 **x = 20**，站立高度約 27 px，外框色 `#101018`
  - 用**鍵色**畫（`meta.json` 的 `manifest.key_colors`），遊戲執行時照裝備換成真正的顏色，所以鍵色一定要照抄：
    - 頭部 `A a a2 C C2`、裝飾 `E E2 C`、身體 `X x x2 Y Y2 y Z z W D d d2`、鞋子 `B b b2 B2`、武器 `I I2 i i2 T U V V2`
  - 部件（17 個）：`base`（身體・臉・手）、頭 `cap helm hood`、裝飾 `feather horns`、身體 `tunic mail plate robe cloak`、鞋 `boots`、武器 `sword dagger axe staff tome`
  - `manifest.poses` 每個姿勢有錨點：`right_hand_grip`、`left_hand`、`head_origin`、`torso_anchor`、`weapon_up_vector`
- 比例參考：`art/battle/` 裡的 Q 版魔物（`proportion_reference` 寫的那張），和野外走路圖的頭身比一致。

## 要做的

1. 新資料夾 **`art/hero/side/`**，檔名和部件跟 `art/hero/px/` 完全一樣（17 張 280×48 ＋ `meta.json`）。
2. **角度：純側面偏 3/4，面向右**（臉、身體朝右，看得到一隻眼睛）。所有影格都面向右，**不可以左右翻轉、不可以換角度**。
3. 錨點固定：每一格腳都踩在 y = 45；待機時腳底 0 px 位移、身體中心左右最多 1 px。
4. 姿勢：
   - `idle1`／`idle2`：呼吸（身體上下 1 px），武器拿在右手、斜向前上方
   - `attack1`：往前（右邊）踏一步預備，武器舉起；`attack2`：揮出去，武器在身體前方（右邊）
   - `cast1`：舉起手，身體微後仰，手在前方發光的位置（只畫手勢，光效遊戲另外畫）
   - `hurt1`：往後（左邊）仰
   - `guard1`：武器或手臂擋在身體前方（右邊），重心放低
5. 武器：
   - 握在 `right_hand_grip`，五種武器都要在 7 個姿勢對齊握點（劍、斧揮砍；短刀快速刺；法杖舉起；魔導書翻開在手上）
   - 武器圖層要畫在身體**前面**的那隻手（面向右時，靠近畫面的手）
6. `meta.json`：照原本的格式，換成側面的錨點座標；`manifest` 加一行 `"facing": "right"`。
7. 先用鍵色畫完一套，再用**目前遊戲預設裝備的顏色**（學生制服＋學生皮鞋、劍）合成一張預覽 `art/hero/side/preview.png`（7 格），讓我確認風格。

## 限制

- 只新增 `art/hero/side/` 裡的檔案；不改 `art/hero/px/`、不改任何 `src/` 和 `tools/`。
- 像素風：不可以平滑、半透明只用在影子；外框 1 px `#101018`。
- 每個部件的鍵色區塊要乾淨（沒有混色），不然換色會出錯。

## 驗收

- 17 張 PNG 都是 280×48、RGBA；`meta.json` 能被 `json.load` 讀進來。
- `preview.png` 7 格：腳都在同一排、面向右、沒有翻轉；武器都握在手上。
- 分兩階段交：**第一階段** `base`＋`tunic`＋`boots`＋`sword` 四張和預覽，停下來給我看；**第二階段**其餘部件。
