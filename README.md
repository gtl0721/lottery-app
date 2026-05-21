# Timmy & Emily Wedding Lottery

local 單機版婚禮樂透開獎小程式，使用純 HTML、CSS、JavaScript 製作，不需要後端、不需要部署，適合婚禮現場投影或 demo 使用。

## 功能特色

- 號碼池為 `1~36`。
- 每次開獎抽出 `6` 個不重複號碼。
- 支援隨機開獎。
- 支援手動指定開獎號碼，例如：`3,8,12,19,25,36`。
- 手動指定號碼會檢查：
  - 必須剛好 6 個號碼
  - 範圍必須是 1 到 36
  - 不可重複
- 開獎中會鎖定按鈕，避免重複觸發。
- 開獎完成後顯示「恭喜得獎者」。
- 開獎結果會由小到大排序顯示。
- 獎池內有完整 `01~36` 共 36 顆球。
- 獎池球有簡易物理碰撞效果，會碰到圓框反彈，開獎時會加速滾動。
- 管理區預設隱藏，可用快捷鍵切換。

## 檔案結構

```text
lottery-app/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## 使用方式

### 直接用瀏覽器開啟

用 Chrome 或 Edge 開啟：

```text
file:///D:/lottery-app/index.html
```

或在檔案總管中對 `index.html` 按右鍵，用瀏覽器開啟。

### 使用 VS Code Live Server

1. 用 VS Code 開啟 `D:\lottery-app`。
2. 安裝 VS Code 擴充套件 `Live Server`。
3. 對 `index.html` 按右鍵。
4. 選擇 `Open with Live Server`。
5. 瀏覽器會開啟本機網址，例如：

```text
http://127.0.0.1:5500/index.html
```

## Demo 建議流程

1. 開啟頁面。
2. 按 `F11` 進入瀏覽器全螢幕。
3. 確認管理區是隱藏的。
4. 點擊「開始開獎」展示隨機抽獎。
5. 若要展示指定號碼，按 `M` 顯示管理區。
6. 輸入指定號碼，例如：

```text
3,8,12,19,25,36
```

7. 再按 `M` 隱藏管理區。
8. 點擊「開始開獎」，畫面會依指定號碼開獎。

## 管理模式

- 按鍵盤 `M`：顯示或隱藏管理區。
- 管理區可輸入指定開獎號碼。
- 若管理區沒有輸入號碼，系統會隨機開獎。
- 若輸入不合法，畫面會提示錯誤，且不會開始開獎。

## Git 版本管理

查看提交紀錄：

```bash
git log --oneline
```

查看目前狀態：

```bash
git status
```

如果 TortoiseGit 跳出 safe directory 錯誤，可執行：

```bash
git config --global --add safe.directory D:/lottery-app
```
