# Codex 任務：重新設計並畫出整個卡片 UI（小卡＋大卡兩種外觀，含所有文字）

玩家要把卡片的外觀整個交給你：**卡框、版面、所有文字的位置和大小**，兩種外觀（小卡、大卡）都要做。
請先讀 `AGENTS.md`，再讀這份。遊戲是直式手機網頁（412×630 左右），程式邏輯解析度寬 176、高約 262（1 遊戲像素 ≈ 手機上 2.3 CSS px）。

---

## 0. 安全規則（最優先，違反就停下來問）
1. 開始前先 `git pull` 拿最新版（基準 commit：`61e06f6` 之後），再 `git add -A && git commit -m "baseline before codex card ui"`。每個階段完成都 commit 一次。
2. **只新增檔案，不改既有檔案**。新的卡面寫在 `src/14y_cardui_codex.js`（檔名排序要在 `14x` 之後，最後載入），只覆寫 `KD.drawCard`；卡框圖片等素材做成 data URL 放在另一個新檔（例如 `src/14y0_cardui_art.js`，可以參考 `src/14f_card_art.js` 和 `tools/embed_cards.py` 的做法）。
3. 不改任何遊戲數值、卡牌效果、戰鬥流程、手勢（`src/14w_v14_swipe.js`）。
4. 規格沒寫到的決定，**停下來問**，不要自己擴大範圍。

## 1. 兩種外觀、六種尺寸（同一個函式要全部畫得好）
`KD.drawCard(x, c, X, Y, w, h, o)`：`x` 是 canvas context，`(X, Y, w, h)` 是卡的位置大小（遊戲像素），`c = { id, up, aw, g16 }`。

| 用在哪 | 尺寸 w×h | 外觀 |
|---|---|---|
| 戰鬥手牌（一般手機） | 30×56 | 小卡 |
| 戰鬥手牌（高螢幕） | 32×62 | 小卡 |
| 牌組／牌庫／棄牌／裝備卡清單（格子） | 38×54 | 小卡 |
| 選到的卡（浮在手牌上） | 60×（84～110，依空間變） | 大卡 |
| 打完戰鬥選卡 | 54×108 | 大卡 |
| 新卡展示、覺醒展示 | 60×86 | 大卡 |

判斷：`w >= 46` 是大卡。`o` 的選項都要支援：
- `o.on`：選到的卡（可以有框外的光，**這是唯一可以在框外的東西**）
- `o.dim`：能量不夠，整張變暗
- `o.vis`／`o.visX0`：手牌很多張重疊時，這張卡露出來的那一段（字要在露出的範圍內置中）
- `o.noArt`：空間不夠時大卡不畫圖（目前很少用到，但要能畫）

## 2. 卡上要有的資料（全部用現有函式取得，不要寫死）
- 卡名 `KD.name(c)`（強化過的有「+」，用綠色 `#a8ffa0`；覺醒的有「★」）
- 費用 `KD.cost(c)`
- 卡種 `KD.CARDS[c.id].type`：`atk` 攻擊／`skl` 技能／`pow` 能力，名稱和顏色在 `KD.TYPE`
- 稀有度 `KD.CARDS[c.id].rar`（`KD.RAR`：B 基本、C 普通、U 稀有、R 史詩、L 傳說（金框）、Q 任務、T 衍生），星星數 `KD.C3.stars`
- 職業 `KD.CLASSES[C.cls].n`（`nt` 是通用）；裝備卡 `c.g16` 要看得出是裝備（目前是銀框）
- 卡圖 `KD.ART[c.id]`（48×32 像素圖，`.ok` 表示載入好了；沒有圖的用 `KD.ICON[KD.iconOf(c.id)]`，13×13）
- 小卡的效果：`KD.shortL(C, KD.val(c))` 會給 1～3 個短句，例如 `['傷害 6','虛弱 1']`、`['隨機 3×2']`、`['抽 2','看破 +1']`、`['每回合','格擋 3']`
  - `KD.numOf28(句子)` 會把「數字＋單位」拆開：`{ s: '6', lab: '傷害' }`；顏色用 `KD.numCol28(N, KD.C3)`
  - 其他短句做成彩色小牌子，顏色用 `KD.chip26(句子)` → `[底色, 字色]`
- 大卡的整句說明：`KD.desc(c)`，用 `KD.rich3(...)` 畫（數字、關鍵字會上色；`KD.lines3` 可以先算要幾行）

## 3. 玩家這一路提過的要求（全部要做到）
1. **字一定要置中**（框裡的字上下左右置中）。
2. **字要小**：小卡的字 5、大卡卡名 7、說明 6、其他小字 5。
3. **所有東西都在卡框裡面**，離框至少 2 像素；**卡的外面不要有黑框**。
4. **善用每一個空間**（大卡小卡都是）：不要下半部空一大塊；說明短的大卡，圖就放大。
5. **費用、卡種名稱不要蓋在卡圖上**。
6. **傷害數字跟一般文字一樣大**，只用顏色區分（傷害金 `#ffd27a`、格擋藍 `#8ec8ff`…）。
7. 像素風：卡圖整數倍或原尺寸，`imageSmoothingEnabled = false`，不要模糊；小卡的圖不要縮小（寧可裁左右）。
8. 玩家不喜歡、**不要再出現**的：卡名壓在圖上、圖上疊漸層再放字、外面一圈黑框、數字特別大、字擠在一起或貼框、卡的下半部空白。

## 4. 字的陷阱（一定要知道）
- 遊戲字型 `Font`（`src/01_core.js`）：`Font.draw`、`Font.width`、粗體用 `Font.w('700', () => ...)`、置中用 `KD.tc(x, 字, 中心x, 中心y, 顏色, 陰影, 大小, 最大寬)`。
- `src/10zzm_v12_r5.js` 有一條舊規則：**比 8 小的字一律畫成 8 的高度、只壓窄寬度**。這就是玩家一直覺得「字太大、又瘦又高、超出框」的原因。
  `src/14x_v14_realfont.js` 已經讓「卡牌戰鬥畫面」和「`KD.drawCard` 裡面」改用真正的大小（`Font.real`）。**你的新 `KD.drawCard` 會被這個包住，不用另外處理；但不要拿掉 14x。**
- 放不下時先縮小字（最小 4），不要壓扁。

## 5. 階段
### 第一階段：設計稿（做完先停，給玩家看）
- 畫 8 張範例卡，**每張都出小卡 30×56 和大卡 60×110 兩種**，另外 1 張 38×54 和 1 張 54×108：
  `mg_frost`（冰霜箭，攻擊）、`mg_spark`（電光，隨機 3×2）、`sw_breath` 強化版（調息+，技能）、`lg_otto`（奧托的機關，傳說・能力）、`rg_lurk`（潛伏，能力）、`lg_rock`（岩之心）、`sw_defend` 強化版、一張裝備卡（`{ id: 'rg_stab', g16: 1 }`）
- 交出兩種圖：原尺寸（1 倍）和放大 6 倍；再加一張「手機畫面」的手牌截圖（見第 6 節）。
- 給 2～3 個方向讓玩家選也可以，但每個方向都要符合第 3 節。

### 第二階段：做進遊戲
- 玩家選定後，照設計稿寫 `src/14y_cardui_codex.js`（＋素材檔）。
- 第 1 節的六種尺寸、四個選項都要畫得好；手牌很多張重疊（8 張以上）時也要正常。

## 6. 檢查（全部做完才算完成）
```
python3 tools/build.py && python3 tools/mktest.py
# 遊戲邏輯沒壞（每個最後要全部 PASS）
SAVE=tools/playtest14/saves/n17.save.json node tools/play.js tools/v14check.js          # PASS 9
SAVE=tools/playtest14/saves/n17.save.json node tools/play.js tools/playtest14/r16/tg16.js  # PASS 33
SAVE=tools/playtest14/saves/n17.save.json node tools/play.js tools/playtest14/r16/tcls.js  # PASS 11（偶爾因隨機有 1～2 項不過，重跑一次）
# 卡面放大檢查（IDS 用逗號分開，id 後面加 + 是強化版；SIZES 是 寬x高）
IDS="mg_frost,mg_spark,sw_breath+,lg_otto,rg_lurk" SIZES="30x56,38x54,60x110,54x108,60x86" K=6 OUT=build/cards_zoom.png node tools/playtest14/r16/cards_zoom.js
# 手機畫面截圖（戰鬥手牌；SEL=2 是選到第 3 張卡）
SAVE=tools/playtest14/saves/clear.save.json VW=412 VH=630 AT=1800 CLS=mg SP=curlySheep,curlySheep OUT=build/hand node tools/playtest14/r16/shot3r.js
SAVE=tools/playtest14/saves/clear.save.json VW=412 VH=630 AT=1800 CLS=mg SP=curlySheep,curlySheep SEL=2 OUT=build/pick node tools/playtest14/r16/shot3r.js
# 牌組畫面、選卡畫面
SAVE=tools/playtest14/saves/clear.save.json CLS=sw EXPR='KD.deckScreen()' STEPS='[[]]' OUT=build/deck node tools/playtest14/r16/uishotr.js
SAVE=tools/playtest14/saves/clear.save.json EXPR="KD.pick3(['rg_lurk','mg_static','sw_breath'],'選一張卡')" STEPS='[[]]' OUT=build/pick3 node tools/playtest14/r16/uishotr.js
# 左右滑動換牌還能用（最後一行 tap big card (play) 之後 n 要少 1）
SAVE=tools/playtest14/saves/clear.save.json VW=412 VH=630 AT=100 CLS=mg SP=curlySheep GEST=1 OUT=build/gest node tools/playtest14/r16/gest.js
```
逐張看截圖：字有沒有置中、有沒有貼框或出框、有沒有空一大塊、費用和卡種有沒有蓋到圖。最後用 `git diff --stat` 列出改了哪些檔案（應該只有新增的檔案）。
