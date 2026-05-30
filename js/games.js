let gameInstanceCounter = 0;

function gameShell(id, label) {
  const uid = `game-${id}-${++gameInstanceCounter}`;
  return {
    uid,
    html: `
      <section class="game-box game-${id}" data-game-shell="${uid}" data-game-type="${id}" aria-label="${label}">
        <div class="game-stage" id="${uid}-stage">
          <div class="game-hud game-hud-${id}" id="${uid}-hud">
            <span id="${uid}-score">0000</span>
          </div>
          <div class="game-overlay active" id="${uid}-overlay">
            <div class="game-overlay-card">
              <h3>INICIAR</h3>
              <p>${getGameHint(id)}</p>
              <button type="button">INICIAR</button>
            </div>
          </div>
        </div>
      </section>
    `
  };
}

function getGameHint(id) {
  if (id === 'snake') return 'Setas ou WASD para controlar.';
  if (id === 'mines') return 'Clique para abrir. Botão direito para marcar.';
  if (id === 'pong') return 'Mouse ou toque para controlar.';
  return 'Clique para iniciar.';
}

function openGameWindow(id, label) {
  const shell = gameShell(id, label);

  const presets = {
    snake: {
      w: Math.min(660, Math.max(560, Math.floor(window.innerHeight * .72))),
      h: Math.min(720, Math.max(620, Math.floor(window.innerHeight * .78)))
    },
    mines: {
      w: Math.min(700, Math.max(600, Math.floor(window.innerHeight * .76))),
      h: Math.min(740, Math.max(640, Math.floor(window.innerHeight * .80)))
    },
    pong: {
      w: Math.min(920, Math.max(760, Math.floor(window.innerWidth * .64))),
      h: Math.min(600, Math.max(500, Math.floor(window.innerHeight * .60)))
    }
  };

  const preset = presets[id] || {
    w: Math.min(920, Math.max(720, Math.floor(window.innerWidth * .62))),
    h: Math.min(680, Math.max(520, Math.floor(window.innerHeight * .68)))
  };

  const initialWidth = Math.min(preset.w, window.innerWidth - 40);
  const initialHeight = Math.min(preset.h, window.innerHeight - 56);

  const win = createWindow({
    title: label,
    html: shell.html,
    kind: 'game',
    x: Math.max(16, Math.round((window.innerWidth - initialWidth) / 2)),
    y: Math.max(16, Math.round((window.innerHeight - initialHeight) / 2) - 10)
  });

  win.classList.add(`game-window-${id}`);
  win.style.width = `${initialWidth}px`;
  win.style.height = `${initialHeight}px`;

  setTimeout(() => initGame(id, shell.uid), 40);
  return win;
}

function openMobileGame(id, label) {
  const shell = gameShell(id, label);
  showMobileApp(label, shell.html);
  setTimeout(() => initGame(id, shell.uid), 40);
}

function initGame(id, uid) {
  if (id === 'snake') initSnake(uid);
  if (id === 'mines') initMines(uid);
  if (id === 'pong') initPong(uid);
}

function stageOf(uid) {
  return document.getElementById(`${uid}-stage`);
}

function overlayOf(uid) {
  return document.getElementById(`${uid}-overlay`);
}

function scoreOf(uid) {
  return document.getElementById(`${uid}-score`);
}

function setScore(uid, value) {
  const el = scoreOf(uid);
  if (el) el.textContent = String(value);
}

function hideOverlay(uid) {
  overlayOf(uid)?.classList.remove('active');
}

function showOverlay(uid, title, text, buttonText, callback) {
  const overlay = overlayOf(uid);
  if (!overlay) return;

  overlay.innerHTML = `
    <div class="game-overlay-card">
      <h3>${title}</h3>
      ${text ? `<p>${text}</p>` : ''}
      <button type="button">${buttonText}</button>
    </div>
  `;

  overlay.classList.add('active');
  overlay.querySelector('button')?.addEventListener('click', () => {
    overlay.classList.remove('active');
    if (callback) callback();
  }, { once: true });
}

function getCSSColor(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function fitCanvasToStage(canvas, ratio = 1) {
  const stage = canvas.closest('.game-stage');
  const rect = stage.getBoundingClientRect();
  const reservedTop = 0;
  const pad = rect.width < 720 ? 2 : 4;
  const w = Math.max(260, Math.floor(rect.width - pad * 2));
  const h = Math.max(220, Math.floor(rect.height - pad * 2 - reservedTop));

  if (ratio === 1) {
    const size = Math.min(w, h);
    canvas.width = size;
    canvas.height = size;
  } else {
    const byWidthH = Math.floor(w / ratio);
    if (byWidthH <= h) {
      canvas.width = w;
      canvas.height = byWidthH;
    } else {
      canvas.height = h;
      canvas.width = Math.floor(h * ratio);
    }
  }
}

function makeCanvas(uid, ratio = 1) {
  const stage = stageOf(uid);
  if (!stage) return null;

  stage.querySelectorAll('canvas,.mines-grid').forEach(el => el.remove());

  const canvas = document.createElement('canvas');
  canvas.tabIndex = 0;
  canvas.className = 'game-canvas';
  stage.prepend(canvas);
  fitCanvasToStage(canvas, ratio);
  canvas.focus();

  return canvas;
}

function observeGameScale(stage, callback) {
  if (!stage || typeof ResizeObserver === 'undefined') return null;

  let raf = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(callback);
  });

  ro.observe(stage);
  return ro;
}

function drawNeonBackground(ctx, canvas, opts = {}) {
  const cyan = getCSSColor('--game-cyan', '#18f6ff');
  const magenta = getCSSColor('--game-magenta', '#ff4fd8');
  const bg = getCSSColor('--game-bg', 'rgba(3,8,18,.68)');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const radial = ctx.createRadialGradient(
    canvas.width * .5,
    canvas.height * .45,
    10,
    canvas.width * .5,
    canvas.height * .45,
    Math.max(canvas.width, canvas.height) * .72
  );
  radial.addColorStop(0, 'rgba(24,246,255,.10)');
  radial.addColorStop(.48, 'rgba(3,8,18,.38)');
  radial.addColorStop(1, 'rgba(1,3,10,.66)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (opts.grid) {
    const step = opts.gridStep || 28;
    ctx.save();
    ctx.globalAlpha = .95;
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const inset = Math.max(1.5, step * .08);
        const size = step - inset * 2;

        ctx.fillStyle = 'rgba(24,246,255,.026)';
        ctx.strokeStyle = 'rgba(24,246,255,.13)';
        ctx.shadowColor = 'rgba(24,246,255,.10)';
        ctx.shadowBlur = 4;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.roundRect(x + inset, y + inset, size, size, Math.max(3, step * .16));
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = .10;
  ctx.strokeStyle = magenta;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(canvas.width * .72, 0);
  ctx.lineTo(canvas.width, canvas.height * .28);
  ctx.stroke();
  ctx.restore();
}

function neonFill(ctx, color, blur = 18) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.fillStyle = color;
}

function initSnake(uid) {
  const canvas = makeCanvas(uid, 1);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let size = Math.max(14, Math.floor(canvas.width / 22));
  let cells = Math.floor(canvas.width / size);
  let snake, food, dir, nextDir, score, timer, running;

  function recalc() {
    fitCanvasToStage(canvas, 1);
    size = Math.max(14, Math.floor(canvas.width / 22));
    cells = Math.floor(canvas.width / size);
  }

  function reset(paused = true) {
    recalc();
    const center = Math.floor(cells / 2);
    snake = [{x:center,y:center},{x:center-1,y:center},{x:center-2,y:center}];
    dir = {x:1,y:0};
    nextDir = {...dir};
    score = 0;
    running = false;
    clearInterval(timer);
    placeFood();
    setScore(uid, String(score).padStart(4, '0'));
    draw();

    if (paused) {
      showOverlay(uid, 'INICIAR', 'Setas ou WASD para controlar.', 'INICIAR', start);
    } else {
      start();
    }
  }

  function placeFood() {
    do {
      food = {x:Math.floor(Math.random()*cells), y:Math.floor(Math.random()*cells)};
    } while (snake.some(p => p.x === food.x && p.y === food.y));
  }

  function start() {
    hideOverlay(uid);
    if (running) return;
    running = true;
    clearInterval(timer);
    timer = setInterval(step, 95);
    canvas.focus();
  }

  function gameOver() {
    running = false;
    clearInterval(timer);
    draw();
    showOverlay(uid, 'GAME OVER', '', 'RESET', () => reset(false));
  }

  function step() {
    dir = nextDir;
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
    const hitWall = head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells;
    const hitSelf = snake.some(p => p.x === head.x && p.y === head.y);

    if (hitWall || hitSelf) return gameOver();

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      setScore(uid, String(score).padStart(4, '0'));
      placeFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    const cyan = getCSSColor('--game-cyan', '#18f6ff');
    const teal = getCSSColor('--game-teal', '#14dfc4');
    const magenta = getCSSColor('--game-magenta', '#ff4fd8');
    const text = getCSSColor('--game-text', '#eafcff');

    drawNeonBackground(ctx, canvas, { grid: true, gridStep: size });

    snake.forEach((p, i) => {
      const fade = Math.max(1 - i * .055, .4);
      ctx.save();
      ctx.globalAlpha = fade;
      neonFill(ctx, i === 0 ? cyan : teal, i === 0 ? 24 : 13);
      const inset = i === 0 ? 1 : 2;
      const radius = i === 0 ? 7 : 5;
      ctx.beginPath();
      ctx.roundRect(p.x * size + inset, p.y * size + inset, size - inset * 2, size - inset * 2, radius);
      ctx.fill();

      if (i === 0) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = text;
        ctx.globalAlpha = .95;
        ctx.beginPath();
        ctx.arc(p.x * size + size * .68, p.y * size + size * .34, Math.max(2, size * .09), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    neonFill(ctx, magenta, 26);
    ctx.beginPath();
    ctx.roundRect(food.x * size + 3, food.y * size + 3, size - 6, size - 6, 6);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = .88;
    ctx.fillStyle = 'rgba(255,255,255,.86)';
    ctx.beginPath();
    ctx.arc(food.x * size + size * .62, food.y * size + size * .32, Math.max(2, size * .08), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = cyan;
    ctx.fillStyle = 'rgba(3,8,18,.50)';
    ctx.strokeStyle = 'rgba(24,246,255,.30)';
    ctx.lineWidth = 1;
    const scoreText = String(score).padStart(4, '0');
    const boxW = 72;
    const boxH = 28;
    const boxX = canvas.width - boxW - 10;
    const boxY = 10;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 10;
    ctx.fillStyle = cyan;
    ctx.font = '800 12px "IBM Plex Mono", "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(scoreText, boxX + boxW / 2, boxY + boxH / 2 + 1);
    ctx.restore();

    ctx.shadowBlur = 0;
  }

  function changeDirection(key) {
    const map = {
      ArrowUp:{x:0,y:-1}, w:{x:0,y:-1}, W:{x:0,y:-1},
      ArrowDown:{x:0,y:1}, s:{x:0,y:1}, S:{x:0,y:1},
      ArrowLeft:{x:-1,y:0}, a:{x:-1,y:0}, A:{x:-1,y:0},
      ArrowRight:{x:1,y:0}, d:{x:1,y:0}, D:{x:1,y:0}
    };

    const nd = map[key];
    if (!nd) return;
    if (nd.x + dir.x === 0 && nd.y + dir.y === 0) return;
    nextDir = nd;
  }

  canvas.addEventListener('keydown', e => {
    changeDirection(e.key);
    e.preventDefault();
  });

  window.addEventListener('keydown', e => {
    if (!canvas.isConnected || document.activeElement !== canvas) return;
    changeDirection(e.key);
  });

  window.addEventListener('resize', () => {
    if (!canvas.isConnected) return;
    reset(!running);
  });

  observeGameScale(stageOf(uid), () => {
    if (!canvas.isConnected) return;
    reset(!running);
  });

  reset(true);
}

function initPong(uid) {
  const canvas = makeCanvas(uid, 16/9);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let raf, running = false;
  let player, ai, ball, playerScore, aiScore, aiMistake = 0;

  function reset(paused = true) {
    fitCanvasToStage(canvas, 16/9);
    cancelAnimationFrame(raf);
    running = false;
    player = {x:28, y:canvas.height/2-48, w:13, h:96};
    ai = {x:canvas.width-41, y:canvas.height/2-48, w:13, h:96};
    playerScore = 0;
    aiScore = 0;
    serve(Math.random() > .5 ? 1 : -1);
    setScore(uid, formatPongScore());
    draw();

    if (paused) {
      showOverlay(uid, 'INICIAR', 'Mouse ou toque para controlar.', 'INICIAR', start);
    } else {
      start();
    }
  }

  function formatPongScore() {
    return `${String(playerScore).padStart(2, '0')} : ${String(aiScore).padStart(2, '0')}`;
  }

  function start() {
    hideOverlay(uid);
    if (running) return;
    running = true;
    canvas.focus();
    loop();
  }

  function loop() {
    update();
    draw();
    if (running) raf = requestAnimationFrame(loop);
  }

  function update() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y < ball.r) {
      ball.y = ball.r;
      ball.vy *= -1;
    }

    if (ball.y > canvas.height - ball.r) {
      ball.y = canvas.height - ball.r;
      ball.vy *= -1;
    }

    const scoreDiff = playerScore - aiScore;
    const aiLosing = scoreDiff > 0;
    const aiWinningBig = aiScore - playerScore >= 2;
    const reaction = aiLosing ? .14 : aiWinningBig ? .07 : .10;
    const maxSpeed = aiLosing ? 8.5 : aiWinningBig ? 5.2 : 6.7;

    aiMistake += ((Math.random() - .5) * (aiWinningBig ? 8 : 4) - aiMistake) * .015;

    const targetY = ball.y - ai.h / 2 + aiMistake;
    const delta = (targetY - ai.y) * reaction;
    ai.y += Math.max(-maxSpeed, Math.min(maxSpeed, delta));
    ai.y = Math.max(0, Math.min(canvas.height - ai.h, ai.y));

    [player, ai].forEach(p => {
      if (ball.x + ball.r > p.x && ball.x - ball.r < p.x + p.w && ball.y > p.y && ball.y < p.y + p.h) {
        const dir = p === player ? 1 : -1;
        ball.x = p === player ? p.x + p.w + ball.r : p.x - ball.r;
        ball.vx = Math.abs(ball.vx) * dir * 1.035;
        ball.vy += (ball.y - (p.y + p.h / 2)) * .055;
      }
    });

    if (ball.x < -24) {
      aiScore++;
      setScore(uid, formatPongScore());
      serve(-1);
    }

    if (ball.x > canvas.width + 24) {
      playerScore++;
      setScore(uid, formatPongScore());
      serve(1);
    }

    if (playerScore >= 5 || aiScore >= 5) {
      running = false;
      cancelAnimationFrame(raf);
      showOverlay(uid, playerScore > aiScore ? 'VITÓRIA' : 'GAME OVER', '', 'RESET', () => reset(false));
    }
  }

  function serve(direction) {
    aiMistake = (Math.random() - .5) * 34;
    ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      r: 7,
      vx: 5.2 * direction,
      vy: (Math.random() * 4 - 2) || 2
    };
  }

  function draw() {
    const cyan = getCSSColor('--game-cyan', '#18f6ff');
    const magenta = getCSSColor('--game-magenta', '#ff4fd8');
    const text = getCSSColor('--game-text', '#eafcff');

    drawNeonBackground(ctx, canvas, { grid: false });

    ctx.save();
    ctx.strokeStyle = 'rgba(234,252,255,.34)';
    ctx.shadowColor = cyan;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 14]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 24);
    ctx.lineTo(canvas.width/2, canvas.height - 24);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    neonFill(ctx, cyan, 22);
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.w, player.h, 7);
    ctx.fill();

    neonFill(ctx, magenta, 22);
    ctx.beginPath();
    ctx.roundRect(ai.x, ai.y, ai.w, ai.h, 7);
    ctx.fill();

    neonFill(ctx, text, 24);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = .82;
    ctx.fillStyle = cyan;
    ctx.shadowColor = cyan;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(ball.x - ball.vx * 1.4, ball.y - ball.vy * 1.4, Math.max(2, ball.r * .52), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.shadowBlur = 0;
  }

  function movePaddle(clientY) {
    const rect = canvas.getBoundingClientRect();
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    player.y = Math.max(0, Math.min(canvas.height - player.h, y - player.h / 2));
    draw();
  }

  canvas.addEventListener('pointermove', e => movePaddle(e.clientY));
  canvas.addEventListener('pointerdown', e => { movePaddle(e.clientY); start(); });

  window.addEventListener('resize', () => {
    if (!canvas.isConnected) return;
    reset(!running);
  });

  observeGameScale(stageOf(uid), () => {
    if (!canvas.isConnected) return;
    reset(!running);
  });

  reset(true);
}

function initMines(uid) {
  const stage = stageOf(uid);
  if (!stage) return;

  const rows = 9, cols = 9, mineCount = 10;
  let board = [], opened = 0, finished = false;

  function reset(showStart = true) {
    opened = 0;
    finished = false;
    setScore(uid, `00/${String(rows * cols - mineCount).padStart(2, '0')}`);
    board = Array.from({length: rows}, (_, y) => Array.from({length: cols}, (_, x) => ({x,y,mine:false,open:false,flag:false,near:0})));

    let placed = 0;
    while (placed < mineCount) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      if (!board[y][x].mine) {
        board[y][x].mine = true;
        placed++;
      }
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        board[y][x].near = neighbors(x, y).filter(c => c.mine).length;
      }
    }

    draw();

    if (showStart) {
      showOverlay(uid, 'INICIAR', 'Clique para abrir. Botão direito para marcar.', 'INICIAR', () => hideOverlay(uid));
    }
  }

  function neighbors(x, y) {
    const list = [];
    for (let dy=-1; dy<=1; dy++) {
      for (let dx=-1; dx<=1; dx++) {
        if (!dx && !dy) continue;
        const nx=x+dx, ny=y+dy;
        if (nx>=0 && ny>=0 && nx<cols && ny<rows) list.push(board[ny][nx]);
      }
    }
    return list;
  }

  function reveal(cell) {
    if (finished || cell.open || cell.flag || overlayOf(uid)?.classList.contains('active')) return;

    cell.open = true;
    opened++;

    if (cell.mine) {
      finished = true;
      board.flat().forEach(c => { if (c.mine) c.open = true; });
      setScore(uid, 'BOOM');
      draw();
      showOverlay(uid, 'GAME OVER', '', 'RESET', () => reset(false));
      return;
    }

    if (cell.near === 0) neighbors(cell.x, cell.y).forEach(reveal);

    if (opened >= rows * cols - mineCount) {
      finished = true;
      setScore(uid, 'WIN');
      draw();
      showOverlay(uid, 'VITÓRIA', '', 'RESET', () => reset(false));
      return;
    }

    setScore(uid, `${String(opened).padStart(2, '0')}/${String(rows * cols - mineCount).padStart(2, '0')}`);
    draw();
  }

  function draw() {
    stage.querySelectorAll('.mines-grid').forEach(el => el.remove());

    const grid = document.createElement('div');
    grid.className = 'mines-grid';
    grid.style.setProperty('--cols', cols);
    stage.prepend(grid);

    board.flat().forEach(cell => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `mine-cell ${cell.open ? 'open' : ''} ${cell.flag ? 'flag' : ''} ${cell.mine && cell.open ? 'mine' : ''}`;
      btn.textContent = cell.open ? (cell.mine ? '✹' : (cell.near || '')) : (cell.flag ? '⚑' : '');

      btn.addEventListener('click', () => reveal(cell));
      btn.addEventListener('contextmenu', e => {
        e.preventDefault();
        if (!cell.open && !finished) cell.flag = !cell.flag;
        draw();
      });

      grid.appendChild(btn);
    });
  }

  reset(true);
}
