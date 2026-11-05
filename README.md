# 曙光冒險

像素風異世界冒險 RPG，在手機網頁上直式遊玩。戰鬥是回合制，點技能按鈕出招。

- **正式版**：v12.154，試玩連結 https://claude.ai/artifact/73AZnSkTsc4HfeC8hH1VPa
- **廢案**：都封存在 `archive/` 分支，總整理見 [`docs/廢案/README.md`](docs/廢案/README.md)

## 資料夾

| 資料夾 | 內容 |
|---|---|
| `src/` | 遊戲程式（約 370 個 .js，照檔名順序接成一個檔） |
| `web/head.html` | 網頁外殼：畫面、觸控按鍵、樣式 |
| `art/` | 美術原檔：`battle/` 魔物・武器・防具・特效、`hero/` 主角紙娃娃、`ui/` 介面圖示 |
| `tools/` | 建置、發布、自動測試、平衡模擬、美術處理的腳本 |
| `docs/` | 設計紀錄、企劃、規格、平衡報告；`docs/廢案/` 是不採用的企劃 |
| `build/cubic` | 字型 Cubic 11（git submodule，SIL OFL 1.1） |
| `build/`、`dist/` 的其他東西 | 建置和測試的產出，不進版本控制 |

## 建置與發布

```
git submodule update --init           # 第一次：抓字型
python3 tools/build.py                # → dist/dawnlight.html（單一檔，測試用）
python3 tools/mktest.py               # → dist/test.html（自動測試用的頁面）
python3 tools/split_publish.py        # → dist/web/（發布用：index.html、game1.js…、hd/、px/）
```

- `build.py` 會先跑 `embed_sprites.py`，把 `art/` 的像素圖嵌進 `src/07id_sprites.js`。
  - 美術沒改時，可以用 `NO_EMBED=1 python3 tools/build.py` 跳過。
  - 不同版本的 Pillow 會把同一張圖壓成不同的位元組，畫面一樣，但會讓 07id 出現沒有意義的差異。
- 發布時每個 `gameN.js` 要在 2,000,000 bytes 以下。原因寫在 `split_publish.py` 開頭。
- 自動測試的寫法：`PAGE=dist/test.html node tools/play.js 情境腳本.js`。
  - 情境腳本會拿到 `g`，可以用 `g.ev`、`g.step`、`g.press`、`g.state`、`g.shot` 操作遊戲。
  - 一次性的情境腳本不用存進來。
- 長期的檢查：
  - `tools/btest.js`：戰鬥回歸測試，對照 `btest_golden.json`。
  - `tools/fieldcheck.js`：野外，對照 `field_golden.json`。
  - `tools/treecheck.js`：技能樹。
  - `tools/wardcheck.js`：護盾。
  - `tools/audit.js`、`tools/audit2.js`：資料一致性。
  - `tools/r2sim.js`、`tools/bsims.js`：數值模擬。

## 程式怎麼讀

所有 `src/*.js` 照**檔名排序**接成一個 script，所以：

1. 後面的檔會覆蓋或包住前面的函式：`const _x = F; F = function () { …; _x(); }`。
   - 要知道某個功能現在怎麼運作，先找**最後一個**定義或包住它的檔。
   - 指令：`grep -n "名字 = function\|function 名字" src/*.js | tail`。
2. 檔名前綴大致就是版本和年代：

| 前綴 | 檔數 | 內容 |
|---|---|---|
| `00`〜`08` | 約 75 | 引擎本體 |
| `09*` | 55 | 第二章，以及 v7〜v10 的系統：武器・防具・天賦・鐵匠・劇情・天氣・護盾 |
| `10a`〜`10j` | 10 | 戰鬥核心 v2：規則、效果、狀態、技能資料、介面橋接 |
| `10k`〜`10zzz` | 約 100 | v12：職業・天賦・技能・獎勵、多輪調整（r3〜r9、s1〜s9、t1〜t9、u1〜u9）、高解析特效工具（v1〜v8） |
| `11*` | 25 | 內容擴充：深淵・競技場・懸賞・第三章・釣魚・料理・新手引導・翻牌・寶藏・冰之謎題・傳送 |
| `12*` | 25 | 第三章系統、奧義、魔物下一步、回合節奏、回到 RPG 的存檔轉換、戰鬥介面 2、野外目標、各武器的高解析特效 |
| `13*`〜`14*` | 35 | v12.1xx：平衡、異色、第五區、新地圖、EX 技能、魔物動畫、晶石、任務指引、天空・雨、大字、野外武器、幻化、名牌 |

`00`〜`08` 的引擎本體包含：

| 檔 | 內容 |
|---|---|
| `00` | 字型 |
| `01` | 核心（Font、Input、存檔） |
| `02` | 音效 |
| `03` | 像素圖 |
| `04*` | 資料：裝備、表格、任務、圖鑑、職業、紙娃娃、技能、掉落、地區 |
| `05` | 介面、選單 |
| `06` | 野外 |
| `07*` | 戰鬥畫面和特效 |
| `08*` | 主程式、縮放、自動存檔、觸控、菁英、地區事件 |

3. 檔頭的註解寫了那個檔是哪一版、做什麼。建置時整行註解會被拿掉，不影響檔案大小。

## 分支

| 分支 | 內容 |
|---|---|
| `main` | 正式版（直式 v12.154） |
| `archive/rpg-v12.85` | 改卡牌版之前的 RPG（v12.85） |
| `archive/card-v14.33` | 廢案：卡牌版 |
| `archive/action-proto` | 廢案：即時動作戰鬥原型 |
| `archive/dungeon-proto` | 廢案：副本式探索原型 |
| `archive/fp-maze-proto` | 廢案：第一人稱迷宮原型 |
| `archive/pc-remake` | 廢案：PC 重做（第二版試玩） |
