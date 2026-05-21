const POOL_MIN = 1;
const POOL_MAX = 36;
const DRAW_COUNT = 6;
const BALL_DELAY_MS = 760;

const drawButton = document.querySelector("#drawButton");
const adminInput = document.querySelector("#adminNumbers");
const adminPanel = document.querySelector("#adminPanel");
const machineRing = document.querySelector(".machine-ring");
const poolBalls = document.querySelector("#poolBalls");
const message = document.querySelector("#message");
const winnerTitle = document.querySelector("#winnerTitle");
const balls = Array.from(document.querySelectorAll(".lotto-ball"));

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function formatNumber(number) {
  return String(number).padStart(2, "0");
}

function renderPoolBalls() {
  const positions = [
    [50, 18], [36, 22], [64, 22], [24, 31], [48, 31], [72, 31],
    [34, 40], [58, 40], [82, 41], [18, 48], [44, 49], [68, 49],
    [28, 58], [52, 58], [76, 58], [38, 67], [62, 67], [50, 76],
    [50, 42], [60, 30], [40, 30], [30, 47], [70, 47], [42, 55],
    [58, 55], [22, 64], [78, 65], [32, 73], [68, 73], [50, 64],
    [25, 39], [75, 39], [39, 80], [61, 80], [50, 52], [50, 88],
  ];

  const fragment = document.createDocumentFragment();

  for (let number = POOL_MIN; number <= POOL_MAX; number += 1) {
    const ball = document.createElement("span");
    const [x, y] = positions[number - 1];
    const direction = number % 2 === 0 ? 1 : -1;

    ball.className = "pool-ball";
    ball.textContent = formatNumber(number);
    ball.style.setProperty("--x", `${x}%`);
    ball.style.setProperty("--y", `${y}%`);
    ball.style.setProperty("--duration", `${2.2 + (number % 7) * 0.18}s`);
    ball.style.setProperty("--delay", `${number * -0.09}s`);
    ball.style.setProperty("--move-a", `${direction * (8 + (number % 5) * 2)}px`);
    ball.style.setProperty("--move-b", `${-7 - (number % 4) * 3}px`);
    ball.style.setProperty("--move-c", `${direction * -1 * (7 + (number % 6) * 2)}px`);
    ball.style.setProperty("--move-d", `${6 + (number % 5) * 2}px`);
    fragment.appendChild(ball);
  }

  poolBalls.replaceChildren(fragment);
}

function parseAdminNumbers(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return { mode: "random", numbers: [] };
  }

  const parts = trimmed.split(/[\s,，、]+/).filter(Boolean);
  const numbers = parts.map((part) => Number(part));

  if (parts.length !== DRAW_COUNT || numbers.some((number) => !Number.isInteger(number))) {
    return { mode: "invalid", error: "手動指定號碼必須剛好是 6 個整數。" };
  }

  if (numbers.some((number) => number < POOL_MIN || number > POOL_MAX)) {
    return { mode: "invalid", error: "手動指定號碼範圍必須介於 1 到 36。" };
  }

  if (new Set(numbers).size !== DRAW_COUNT) {
    return { mode: "invalid", error: "手動指定號碼不可重複。" };
  }

  return {
    mode: "admin",
    numbers: numbers.sort((a, b) => a - b),
  };
}

function getRandomNumbers() {
  const pool = Array.from({ length: POOL_MAX }, (_, index) => index + 1);

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, DRAW_COUNT).sort((a, b) => a - b);
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function resetDrawState() {
  winnerTitle.textContent = "中獎號碼";
  winnerTitle.classList.remove("is-complete");

  balls.forEach((ball) => {
    ball.textContent = "--";
    ball.classList.remove("rolling", "settled");
  });
}

async function revealNumbers(numbers) {
  for (let index = 0; index < numbers.length; index += 1) {
    const ball = balls[index];
    ball.classList.remove("rolling", "settled");
    void ball.offsetWidth;
    ball.classList.add("rolling");

    const spinFrames = 12;
    for (let frame = 0; frame < spinFrames; frame += 1) {
      ball.textContent = formatNumber(Math.floor(Math.random() * POOL_MAX) + 1);
      await wait(BALL_DELAY_MS / spinFrames);
    }

    ball.textContent = formatNumber(numbers[index]);
    ball.classList.remove("rolling");
    ball.classList.add("settled");
    await wait(220);
  }
}

async function startDraw() {
  const parsed = parseAdminNumbers(adminInput.value);

  if (parsed.mode === "invalid") {
    setMessage(parsed.error, "error");
    return;
  }

  const numbers = parsed.mode === "admin" ? parsed.numbers : getRandomNumbers();

  drawButton.disabled = true;
  adminInput.disabled = true;
  machineRing.classList.add("is-drawing");
  resetDrawState();
  setMessage(parsed.mode === "admin" ? "管理模式啟用，將依指定號碼開獎。" : "未設定指定號碼，系統隨機開獎中。", "success");

  await revealNumbers(numbers);

  machineRing.classList.remove("is-drawing");
  winnerTitle.textContent = "恭喜得獎者";
  winnerTitle.classList.add("is-complete");
  setMessage(`開獎完成：${numbers.map(formatNumber).join("、")}`, "success");

  drawButton.disabled = false;
  adminInput.disabled = false;
  drawButton.focus();
}

function toggleAdminPanel() {
  adminPanel.classList.toggle("is-hidden");

  if (!adminPanel.classList.contains("is-hidden")) {
    adminInput.focus();
  }
}

drawButton.addEventListener("click", startDraw);
renderPoolBalls();

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "m") {
    event.preventDefault();
    toggleAdminPanel();
  }
});
