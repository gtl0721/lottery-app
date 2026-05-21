# Lottery App

Timmy & Emily wedding lottery app. This is a local, standalone wedding lottery draw page built with plain HTML, CSS, and JavaScript.

No framework, backend, database, or deployment is required.

## Features

- Number pool: `1` to `36`.
- Each round draws `6` unique numbers.
- Each button click reveals one number, so a full round takes 6 clicks.
- Supports random draw.
- Supports manually assigned draw numbers, for example: `3,8,12,19,25,36`.
- Manual numbers are validated:
  - exactly 6 numbers
  - each number must be between 1 and 36
  - duplicate numbers are not allowed
- Draw button is locked while each ball is animating.
- Final result is sorted from small to large.
- Shows `恭喜得獎者` after the draw is complete.
- The lottery machine contains all `01` to `36` balls.
- Pool balls move with animated airflow and outer-ring bouncing.
- Admin panel is hidden by default and can be toggled with the `M` key.

## Files

```text
lottery-app/
├── index.html
├── styles.css
├── script.js
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
7. Enter assigned numbers, for example:

```text
3,8,12,19,25,36
```

8. Press `M` again to hide the admin panel.
9. Click the draw button 6 times; the page will reveal the assigned numbers one by one.

## Admin Mode

- Press `M` to show or hide the admin panel.
- Leave the input empty for random draw.
- Enter 6 valid numbers to force assigned draw numbers.
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
