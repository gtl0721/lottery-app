const POOL_MIN = 1;
const POOL_MAX = 36;
const DRAW_COUNT = 6;
const BALL_DELAY_MS = 760;

const drawButton = document.querySelector("#drawButton");
const adminInput1 = document.querySelector("#adminNumbers1");
const adminInput2 = document.querySelector("#adminNumbers2");
const adminInputs = [adminInput1, adminInput2];
const adminPanel = document.querySelector("#adminPanel");
const machineRing = document.querySelector(".machine-ring");
const poolBalls = document.querySelector("#poolBalls");
const message = document.querySelector("#message");
const winnerTitle = document.querySelector("#winnerTitle");
const balls = Array.from(document.querySelectorAll(".lotto-ball"));
const drawState = {
  rounds: [],
  roundIndex: 0,
  nextIndex: 0,
  isActive: false,
  isAnimating: false,
  roundStartedIndex: -1,
};
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

function addSoftBallInteractions() {
  for (let firstIndex = 0; firstIndex < poolPhysics.balls.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < poolPhysics.balls.length; secondIndex += 1) {
      const first = poolPhysics.balls[firstIndex];
      const second = poolPhysics.balls[secondIndex];
      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const distance = Math.hypot(dx, dy) || 1;
      const influenceDistance = (first.radius + second.radius) * 1.35;

      if (distance > influenceDistance) {
        continue;
      }

      const normalX = dx / distance;
      const normalY = dy / distance;
      const tangentX = -normalY;
      const tangentY = normalX;
      const strength = (1 - distance / influenceDistance) * 10;
      const spinKick = Math.sin(poolPhysics.lastTime / 140 + first.phase + second.phase) * strength;

      first.vx -= normalX * strength;
      first.vy -= normalY * strength;
      second.vx += normalX * strength;
      second.vy += normalY * strength;
      first.vx += tangentX * spinKick;
      first.vy += tangentY * spinKick;
      second.vx -= tangentX * spinKick;
      second.vy -= tangentY * spinKick;
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
    ball.vx *= 0.992;
    ball.vy *= 0.992;

    limitBallSpeed(ball, 300 * poolPhysics.speedBoost);
  });

  addSoftBallInteractions();

  poolPhysics.balls.forEach((ball) => {
    ball.x += ball.vx * deltaSeconds * poolPhysics.speedBoost;
    ball.y += ball.vy * deltaSeconds * poolPhysics.speedBoost;
    keepBallInsideCircle(ball);
  });

  poolPhysics.balls.forEach((ball) => {
    ball.rotation += (ball.vx + ball.vy) * 0.018 * poolPhysics.speedBoost;
    ball.element.style.transform = `translate(-50%, -50%) translate(${ball.x - poolPhysics.centerX}px, ${ball.y - poolPhysics.centerY}px) rotate(${ball.rotation}deg)`;
  });

  window.requestAnimationFrame(animatePoolBalls);
}

function parseAssignedNumbers(value, label) {
  const trimmed = value.trim();

  if (!trimmed) {
    return { mode: "empty", numbers: [] };
  }

  const parts = trimmed.split(/[\s,，、]+/).filter(Boolean);
  const numbers = parts.map((part) => Number(part));

  if (parts.length !== DRAW_COUNT || numbers.some((number) => !Number.isInteger(number))) {
    return { mode: "invalid", error: `${label} 必須剛好是 6 個整數。` };
  }

  if (numbers.some((number) => number < POOL_MIN || number > POOL_MAX)) {
    return { mode: "invalid", error: `${label} 範圍必須介於 1 到 36。` };
  }

  if (new Set(numbers).size !== DRAW_COUNT) {
    return { mode: "invalid", error: `${label} 不可重複。` };
  }

  return {
    mode: "valid",
    numbers: numbers.sort((a, b) => a - b),
  };
}

function parseAdminRounds() {
  const first = parseAssignedNumbers(adminInput1.value, "指定號碼1");
  const second = parseAssignedNumbers(adminInput2.value, "指定號碼2");

  if (first.mode === "invalid") {
    return first;
  }

  if (second.mode === "invalid") {
    return second;
  }

  if (first.mode === "empty" && second.mode === "empty") {
    return {
      mode: "random",
      rounds: [{ label: "隨機號碼", numbers: getRandomNumbers() }],
    };
  }

  if (first.mode === "empty" || second.mode === "empty") {
    return { mode: "invalid", error: "若使用指定號碼，指定號碼1與指定號碼2都必須填寫。" };
  }

  return {
    mode: "admin",
    rounds: [
      { label: "指定號碼1", numbers: first.numbers },
      { label: "指定號碼2", numbers: second.numbers },
    ],
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

async function revealOneNumber(index, number) {
  const ball = balls[index];
  ball.classList.remove("rolling", "settled");
  void ball.offsetWidth;
  ball.classList.add("rolling");

  const spinFrames = 12;
  for (let frame = 0; frame < spinFrames; frame += 1) {
    ball.textContent = formatNumber(Math.floor(Math.random() * POOL_MAX) + 1);
    await wait(BALL_DELAY_MS / spinFrames);
  }

  ball.textContent = formatNumber(number);
  ball.classList.remove("rolling");
  ball.classList.add("settled");
  await wait(220);
}

async function startDraw() {
  if (drawState.isAnimating) {
    return;
  }

  if (!drawState.isActive) {
    const parsed = parseAdminRounds();

    if (parsed.mode === "invalid") {
      setMessage(parsed.error, "error");
      return;
    }

    drawState.rounds = parsed.rounds;
    drawState.roundIndex = 0;
    drawState.nextIndex = 0;
    drawState.isActive = true;
    drawState.roundStartedIndex = -1;
    setMessage(parsed.mode === "admin" ? "管理模式啟用，將先開指定號碼1，再開指定號碼2。" : "未設定指定號碼，系統將隨機逐顆開獎。", "success");
  }

  if (drawState.roundStartedIndex !== drawState.roundIndex) {
    resetDrawState();
    drawState.roundStartedIndex = drawState.roundIndex;
  }

  const currentRound = drawState.rounds[drawState.roundIndex];
  const currentIndex = drawState.nextIndex;
  const currentNumber = currentRound.numbers[currentIndex];

  drawState.isAnimating = true;
  drawButton.disabled = true;
  adminInputs.forEach((input) => {
    input.disabled = true;
  });
  drawButton.textContent = "開獎中...";
  poolPhysics.speedBoost = 1.65;
  machineRing.classList.add("is-drawing");
  setMessage(`${currentRound.label} 第 ${currentIndex + 1} 顆號碼開獎中。`, "success");

  await revealOneNumber(currentIndex, currentNumber);

  drawState.nextIndex += 1;
  drawState.isAnimating = false;

  if (drawState.nextIndex >= DRAW_COUNT) {
    machineRing.classList.remove("is-drawing");
    poolPhysics.speedBoost = 1;

    if (drawState.roundIndex + 1 < drawState.rounds.length) {
      winnerTitle.textContent = `${currentRound.label} 開獎完成`;
      winnerTitle.classList.add("is-complete");
      setMessage(`${currentRound.label} 開獎完成：${currentRound.numbers.map(formatNumber).join("、")}。下一輪將開指定號碼2。`, "success");
      drawState.roundIndex += 1;
      drawState.nextIndex = 0;
      drawButton.textContent = `開始${drawState.rounds[drawState.roundIndex].label}`;
      drawButton.disabled = false;
      drawButton.focus();
      return;
    }

    winnerTitle.textContent = "恭喜得獎者";
    winnerTitle.classList.add("is-complete");
    setMessage(`${currentRound.label} 開獎完成：${currentRound.numbers.map(formatNumber).join("、")}`, "success");
    drawState.isActive = false;
    drawButton.textContent = "重新開獎";
    drawButton.disabled = false;
    adminInputs.forEach((input) => {
      input.disabled = false;
    });
    drawButton.focus();
    return;
  }

  setMessage(`${currentRound.label} 已開出 ${drawState.nextIndex} 顆，請按下一顆。`, "success");
  drawButton.textContent = `開下一顆 (${drawState.nextIndex + 1}/6)`;
  drawButton.disabled = false;
  drawButton.focus();
}

function toggleAdminPanel() {
  adminPanel.classList.toggle("is-hidden");

  if (!adminPanel.classList.contains("is-hidden")) {
    adminInput1.focus();
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
