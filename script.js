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
const poolPhysics = {
  balls: [],
  width: 0,
  height: 0,
  centerX: 0,
  centerY: 0,
  radius: 0,
  lastTime: 0,
  speedBoost: 1,
};

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function formatNumber(number) {
  return String(number).padStart(2, "0");
}

function renderPoolBalls() {
  const fragment = document.createDocumentFragment();
  poolPhysics.balls = [];

  for (let number = POOL_MIN; number <= POOL_MAX; number += 1) {
    const ball = document.createElement("span");

    ball.className = "pool-ball";
    ball.textContent = formatNumber(number);
    fragment.appendChild(ball);
    poolPhysics.balls.push({
      element: ball,
      number,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 22,
      rotation: 0,
    });
  }

  poolBalls.replaceChildren(fragment);
  updatePoolLayout();
  window.requestAnimationFrame(animatePoolBalls);
}

function updatePoolLayout() {
  const bounds = poolBalls.getBoundingClientRect();
  poolPhysics.width = bounds.width;
  poolPhysics.height = bounds.height;
  poolPhysics.centerX = bounds.width / 2;
  poolPhysics.centerY = bounds.height / 2;
  poolPhysics.radius = Math.min(bounds.width, bounds.height) / 2;

  poolPhysics.balls.forEach((ball, index) => {
    const size = ball.element.offsetWidth || 44;
    const angle = (index / poolPhysics.balls.length) * Math.PI * 2;
    const layer = index % 3;
    const distance = poolPhysics.radius * (0.26 + layer * 0.2);

    ball.radius = size / 2;
    ball.x = poolPhysics.centerX + Math.cos(angle) * distance;
    ball.y = poolPhysics.centerY + Math.sin(angle) * distance;
    ball.vx = Math.cos(angle + Math.PI / 2) * (44 + (index % 5) * 8);
    ball.vy = Math.sin(angle + Math.PI / 2) * (44 + (index % 7) * 7);
  });
}

function keepBallInsideCircle(ball) {
  const dx = ball.x - poolPhysics.centerX;
  const dy = ball.y - poolPhysics.centerY;
  const distance = Math.hypot(dx, dy) || 1;
  const limit = poolPhysics.radius - ball.radius - 2;

  if (distance <= limit) {
    return;
  }

  const normalX = dx / distance;
  const normalY = dy / distance;
  const velocityAlongNormal = ball.vx * normalX + ball.vy * normalY;

  ball.x = poolPhysics.centerX + normalX * limit;
  ball.y = poolPhysics.centerY + normalY * limit;

  if (velocityAlongNormal > 0) {
    ball.vx -= 1.92 * velocityAlongNormal * normalX;
    ball.vy -= 1.92 * velocityAlongNormal * normalY;
  }
}

function resolveBallCollisions() {
  for (let firstIndex = 0; firstIndex < poolPhysics.balls.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < poolPhysics.balls.length; secondIndex += 1) {
      const first = poolPhysics.balls[firstIndex];
      const second = poolPhysics.balls[secondIndex];
      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const distance = Math.hypot(dx, dy) || 1;
      const minDistance = first.radius + second.radius - 3;

      if (distance >= minDistance) {
        continue;
      }

      const normalX = dx / distance;
      const normalY = dy / distance;
      const overlap = minDistance - distance;
      const relativeVelocityX = second.vx - first.vx;
      const relativeVelocityY = second.vy - first.vy;
      const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;

      first.x -= normalX * overlap * 0.5;
      first.y -= normalY * overlap * 0.5;
      second.x += normalX * overlap * 0.5;
      second.y += normalY * overlap * 0.5;

      if (velocityAlongNormal < 0) {
        const impulse = -velocityAlongNormal * 0.84;
        first.vx -= impulse * normalX;
        first.vy -= impulse * normalY;
        second.vx += impulse * normalX;
        second.vy += impulse * normalY;
      }
    }
  }
}

function animatePoolBalls(time) {
  if (!poolPhysics.lastTime) {
    poolPhysics.lastTime = time;
  }

  const deltaSeconds = Math.min((time - poolPhysics.lastTime) / 1000, 0.032);
  poolPhysics.lastTime = time;

  poolPhysics.balls.forEach((ball, index) => {
    const dx = ball.x - poolPhysics.centerX;
    const dy = ball.y - poolPhysics.centerY;
    const tangentX = -dy;
    const tangentY = dx;
    const tangentLength = Math.hypot(tangentX, tangentY) || 1;
    const swirl = 26 * poolPhysics.speedBoost;

    ball.vx += (tangentX / tangentLength) * swirl * deltaSeconds;
    ball.vy += (tangentY / tangentLength) * swirl * deltaSeconds;
    ball.vy += Math.sin(time / 420 + index) * 7 * deltaSeconds;
    ball.x += ball.vx * deltaSeconds * poolPhysics.speedBoost;
    ball.y += ball.vy * deltaSeconds * poolPhysics.speedBoost;
    ball.vx *= 0.997;
    ball.vy *= 0.997;

    keepBallInsideCircle(ball);
  });

  resolveBallCollisions();

  poolPhysics.balls.forEach((ball) => {
    ball.rotation += (ball.vx + ball.vy) * 0.018 * poolPhysics.speedBoost;
    ball.element.style.transform = `translate(-50%, -50%) translate(${ball.x - poolPhysics.centerX}px, ${ball.y - poolPhysics.centerY}px) rotate(${ball.rotation}deg)`;
  });

  window.requestAnimationFrame(animatePoolBalls);
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
  poolPhysics.speedBoost = 1.8;
  machineRing.classList.add("is-drawing");
  resetDrawState();
  setMessage(parsed.mode === "admin" ? "管理模式啟用，將依指定號碼開獎。" : "未設定指定號碼，系統隨機開獎中。", "success");

  await revealNumbers(numbers);

  machineRing.classList.remove("is-drawing");
  poolPhysics.speedBoost = 1;
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
window.addEventListener("resize", updatePoolLayout);

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "m") {
    event.preventDefault();
    toggleAdminPanel();
  }
});
