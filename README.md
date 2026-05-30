# Lottery App

Timmy & Emily wedding lottery app. This is a local, standalone wedding lottery draw page built with plain HTML, CSS, and JavaScript.

No framework, backend, database, or deployment is required.

The project also includes a printable wedding lottery prize card page for guest redemption cards.

## Features

- Number pool: `1` to `36`.
- Each round draws `6` unique numbers.
- Each button click reveals one number, so a full round takes 6 clicks.
- Supports random draw.
- Supports two manually assigned draw groups, for example:
  - `指定號碼1`: `3,8,12,19,25,36`
  - `指定號碼2`: `1,6,14,20,28,33`
- Manual number groups are validated:
  - exactly 6 numbers
  - each number must be between 1 and 36
  - duplicate numbers are not allowed
- If manual numbers are used, both assigned groups must be filled.
- Assigned draw order is `指定號碼1` first, then `指定號碼2`.
- Draw button is locked while each ball is animating.
- Final result is sorted from small to large.
- Shows `開獎完成，中獎請舉手!!!` after each assigned group is complete.
- The lottery machine contains all `01` to `36` balls.
- Pool balls move with animated airflow and outer-ring bouncing.
- Admin panel is hidden by default and can be toggled with the `M` key.

## Wedding Lottery Prize Cards

The printable prize card page is available at:

```text
file:///D:/lottery-app/cards.html
```

Or, with VS Code Live Server:

```text
http://127.0.0.1:5500/cards.html
```

Prize card details:

- Page title: `婚禮大樂透`
- Subtitle: `Timmy & Emily Wedding Lottery`
- Draw date: `2026-06-14`
- Each guest card contains 6 lottery numbers.
- Card size is A7.
- Each A4 print page contains 8 A7 cards.
- The design uses a red and gold wedding style.
- The page supports browser printing with the `列印兌獎卡` button or `Ctrl + P`.

Guest number source:

```text
assets/wedding_lottery_guest_numbers_no_cross_winners.xlsx
Sheet: 賓客對獎號碼
Column: C 賓客對獎號碼
```

The extracted browser data is stored in `cards-data.js`. If the Excel file changes, regenerate `cards-data.js` before printing.

## Files

```text
lottery-app/
├── index.html
├── styles.css
├── script.js
├── cards.html
├── cards.css
├── cards.js
├── cards-data.js
├── assets/
│   └── wedding_lottery_guest_numbers_no_cross_winners.xlsx
└── README.md
```

## Run Locally

Open this file directly in Chrome or Edge:

```text
file:///D:/lottery-app/index.html
```

Or open `index.html` from File Explorer.

## Run With VS Code Live Server

1. Open `D:\lottery-app` in VS Code.
2. Install the `Live Server` extension.
3. Right-click `index.html`.
4. Select `Open with Live Server`.
5. The browser will open a local URL such as:

```text
http://127.0.0.1:5500/index.html
```

## Demo Flow

1. Open the page.
2. Press `F11` in the browser for full screen.
3. Keep the admin panel hidden before showing guests.
4. Click `開始開獎` to reveal the first random number.
5. Continue clicking the button to reveal one number at a time until all 6 numbers are shown.
6. Press `M` to show the admin panel if you want to demo assigned numbers.
7. Enter two assigned number groups, for example:

```text
指定號碼1: 3,8,12,19,25,36
指定號碼2: 1,6,14,20,28,33
```

8. Press `M` again to hide the admin panel.
9. Click the draw button 6 times to reveal the first assigned group.
10. Click `繼續開獎`, then continue clicking to reveal the second assigned group.

## Admin Mode

- Press `M` to show or hide the admin panel.
- Leave the input empty for random draw.
- Enter 6 valid numbers in both `指定號碼1` and `指定號碼2` to force assigned draw numbers.
- Assigned numbers will be drawn in order: `指定號碼1` first, then `指定號碼2`.
- Invalid input will show an error and will not start the draw.

## Git

Show commit history:

```bash
git log --oneline
```

Show working tree status:

```bash
git status
```

If TortoiseGit reports a safe directory error:

```bash
git config --global --add safe.directory D:/lottery-app
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
