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
  airJetX: 0,
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
      phase: number * 0.73,
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
  poolPhysics.airJetX = poolPhysics.centerX;

  poolPhysics.balls.forEach((ball, index) => {
    const size = ball.element.offsetWidth || 44;
    const angle = index * 2.3999632297;
    const distance = poolPhysics.radius * (0.18 + ((index * 17) % 63) / 100);
    const speed = 72 + (index % 9) * 9;

    ball.radius = size / 2;
    ball.x = poolPhysics.centerX + Math.cos(angle) * distance;
    ball.y = poolPhysics.centerY + Math.sin(angle) * distance;
    ball.vx = Math.cos(angle * 1.7) * speed;
    ball.vy = Math.sin(angle * 1.3) * speed;
  });
}

function keepBallInsideCircle(ball) {
  const dx = ball.x - poolPhysics.centerX;
  const dy = ball.y - poolPhysics.centerY;
  const distance = Math.hypot(dx, dy) || 1;
  const limit = poolPhysics.radius - ball.radius - 1;

  if (distance <= limit) {
    return;
  }

  const normalX = dx / distance;
  const normalY = dy / distance;
  const velocityAlongNormal = ball.vx * normalX + ball.vy * normalY;

  ball.x = poolPhysics.centerX + normalX * limit;
  ball.y = poolPhysics.centerY + normalY * limit;

  if (velocityAlongNormal > 0) {
    const tangentX = -normalY;
    const tangentY = normalX;
    const tangentKick = 18 * Math.sin(ball.phase + poolPhysics.lastTime / 190);

    ball.vx -= 1.86 * velocityAlongNormal * normalX;
    ball.vy -= 1.86 * velocityAlongNormal * normalY;
    ball.vx += tangentX * tangentKick;
    ball.vy += tangentY * tangentKick;
  }
}

function resolveBallCollisions() {
  for (let pass = 0; pass < 2; pass += 1) {
    for (let firstIndex = 0; firstIndex < poolPhysics.balls.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < poolPhysics.balls.length; secondIndex += 1) {
        const first = poolPhysics.balls[firstIndex];
        const second = poolPhysics.balls[secondIndex];
        let dx = second.x - first.x;
        let dy = second.y - first.y;
        let distance = Math.hypot(dx, dy);
        const minDistance = first.radius + second.radius + 1;

        if (distance >= minDistance) {
          continue;
        }

        if (distance < 0.001) {
          const angle = (firstIndex + secondIndex) * 1.618;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          distance = 1;
        }

        const normalX = dx / distance;
        const normalY = dy / distance;
        const overlap = minDistance - distance;
        const relativeVelocityX = second.vx - first.vx;
        const relativeVelocityY = second.vy - first.vy;
        const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;

        first.x -= normalX * overlap * 0.52;
        first.y -= normalY * overlap * 0.52;
        second.x += normalX * overlap * 0.52;
        second.y += normalY * overlap * 0.52;

        if (velocityAlongNormal < 0) {
          const restitution = 0.96;
          const impulse = -(1 + restitution) * velocityAlongNormal * 0.5;
          const tangentX = -normalY;
          const tangentY = normalX;
          const spinKick = Math.sin(poolPhysics.lastTime / 160 + first.phase + second.phase) * 8;

          first.vx -= impulse * normalX;
          first.vy -= impulse * normalY;
          second.vx += impulse * normalX;
          second.vy += impulse * normalY;
          first.vx += tangentX * spinKick;
          first.vy += tangentY * spinKick;
          second.vx -= tangentX * spinKick;
          second.vy -= tangentY * spinKick;
        }
      }
    }
  }
}

function limitBallSpeed(ball, maxSpeed) {
  const speed = Math.hypot(ball.vx, ball.vy);

  if (speed <= maxSpeed) {
    return;
  }

  ball.vx = (ball.vx / speed) * maxSpeed;
  ball.vy = (ball.vy / speed) * maxSpeed;
}

function animatePoolBalls(time) {
  if (!poolPhysics.lastTime) {
    poolPhysics.lastTime = time;
  }

  const deltaSeconds = Math.min((time - poolPhysics.lastTime) / 1000, 0.032);
  poolPhysics.lastTime = time;
  poolPhysics.airJetX = poolPhysics.centerX + Math.sin(time / 620) * poolPhysics.radius * 0.34;

  poolPhysics.balls.forEach((ball, index) => {
    const dx = ball.x - poolPhysics.centerX;
    const dy = ball.y - poolPhysics.centerY;
    const distanceFromCenter = Math.hypot(dx, dy) || 1;
    const nozzleDx = ball.x - poolPhysics.airJetX;
    const nozzleDy = ball.y - (poolPhysics.centerY + poolPhysics.radius * 0.68);
    const nozzleDistance = Math.hypot(nozzleDx, nozzleDy) || 1;
    const jetReach = poolPhysics.radius * 0.72;
    const jetPower = Math.max(0, 1 - nozzleDistance / jetReach);
    const centerPull = 18 * (distanceFromCenter / poolPhysics.radius);
    const turbulenceX = Math.sin(time / 180 + ball.phase * 3.1) * 72;
    const turbulenceY = Math.cos(time / 230 + ball.phase * 2.7) * 58;
    const sidePulse = Math.sin(time / 310 + index) * 44;

    ball.vx += (-dx / distanceFromCenter) * centerPull * deltaSeconds;
    ball.vy += (-dy / distanceFromCenter) * centerPull * deltaSeconds;
    ball.vx += turbulenceX * deltaSeconds * poolPhysics.speedBoost;
    ball.vy += turbulenceY * deltaSeconds * poolPhysics.speedBoost;
    ball.vx += sidePulse * jetPower * deltaSeconds * poolPhysics.speedBoost;
    ball.vy -= (360 + index % 5 * 24) * jetPower * deltaSeconds * poolPhysics.speedBoost;
    ball.vx += Math.sin(time / 95 + index * 2.4) * 20 * deltaSeconds;
    ball.vy += Math.cos(time / 105 + index * 1.7) * 18 * deltaSeconds;
    ball.x += ball.vx * deltaSeconds * poolPhysics.speedBoost;
    ball.y += ball.vy * deltaSeconds * poolPhysics.speedBoost;
    ball.vx *= 0.992;
    ball.vy *= 0.992;

    limitBallSpeed(ball, 320 * poolPhysics.speedBoost);
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
