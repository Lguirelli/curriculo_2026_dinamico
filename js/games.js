let gameInstanceCounter = 0;

function gameShell(id, label) {
  const uid = `game-${id}-${++gameInstanceCounter}`;
  return {
    uid,
    html: `
      <section class="game-box game-${id}" data-game-shell="${uid}" data-game-type="${id}">
        <div class="game-stage" id="${uid}-stage">
          <div class="game-hud" id="${uid}-hud">
            <strong>${label}</strong>
            <span id="${uid}-score">0000</span>
          </div>
          <div class="game-overlay active" id="${uid}-overlay">
            <div class="game-overlay-card">
              <h3>${label}</h3>
              <p>${getGameHint(id)}</p>
              <button type="button" id="${uid}-overlay-action">Iniciar</button>
            </div>
          </div>
        </div>
      </section>
    `
  };
}

function getGameHint(id) {
  if (id === 'snake') return 'Use as setas ou WASD para controlar.';
  if (id === 'mines') return 'Clique para abrir. Botão direito para marcar.';
  if (id === 'pong') return 'Mova o mouse ou toque para controlar.';
  return 'Clique para iniciar.';
}

function openGameWindow(id, label) {
  const shell = gameShell(id, label);
  const win = createWindow({
    title: label,
    html: shell.html,
    kind: 'game',
    x: 18,
    y: 16
  });

  win.classList.add('fullscreen', 'game-fixed-window');

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

function showOverlay(uid, title, text, buttonText, callback) {
  const overlay = overlayOf(uid);
  if (!overlay) return;

  overlay.innerHTML = `
    <div class="game-overlay-card">
      <h3>${title}</h3>
      <p>${text}</p>
      <button type="button">${buttonText}</button>
    </div>
  `;

  overlay.classList.add('active');
  const btn = overlay.querySelector('button');
  btn?.addEventListener('click', () => {
    overlay.classList.remove('active');
    if (callback) callback();
  }, { once: true });
}

function hideOverlay(uid) {
  overlayOf(uid)?.classList.remove('active');
}

function setScore(uid, value) {
  const el = scoreOf(uid);
  if (el) el.textContent = String(value).padStart(4, '0');
}

function fitCanvasToStage(canvas, baseRatio = 1) {
  const stage = canvas.closest('.game-stage');
  const rect = stage.getBoundingClientRect();
  const pad = 24;
  const w = Math.max(260, Math.floor(rect.width - pad * 2));
  const h = Math.max(220, Math.floor(rect.height - pad * 2));

  if (baseRatio === 1) {
    const size = Math.min(w, h);
    canvas.width = size;
    canvas.height = size;
  } else {
    const byWidthH = Math.floor(w / baseRatio);
    if (byWidthH <= h) {
      canvas.width = w;
      canvas.height = byWidthH;
    } else {
      canvas.height = h;
      canvas.width = Math.floor(h * baseRatio);
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

function getCSSColor(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function crtClear(ctx, canvas) {
  const accent = getCSSColor('--accent', '#dfe7ff');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 20, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * .75);
  g.addColorStop(0, 'rgba(255,255,255,.085)');
  g.addColorStop(.52, 'rgba(120,160,220,.04)');
  g.addColorStop(1, 'rgba(0,0,0,.62)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalAlpha = .16;
  ctx.strokeStyle = accent;
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y + .5);
    ctx.lineTo(canvas.width, y + .5);
    ctx.stroke();
  }
  ctx.restore();
}

function neonFill(ctx, color, blur = 18) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.fillStyle = color;
}

function overlayText(ctx, canvas, title, subtitle) {
  const text = getCSSColor('--text-1', '#fff');
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = text;
  ctx.shadowBlur = 16;
  ctx.fillStyle = text;
  ctx.font = '800 32px "Courier New", monospace';
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 18);
  ctx.font = '700 14px "Courier New", monospace';
  ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 18);
  ctx.restore();
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
    setScore(uid, score);
    draw();

    if (paused) showOverlay(uid, 'Snake', 'Use as setas ou WASD para controlar.', 'Iniciar', start);
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
    showOverlay(uid, 'Game Over', 'A partida terminou. Reinicie para jogar novamente.', 'Reset', () => reset(false));
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
      setScore(uid, score);
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    const primary = getCSSColor('--text-1', '#ffffff');
    const accent = getCSSColor('--accent', '#dfe7ff');
    const soft = getCSSColor('--text-2', '#c8d0dd');

    crtClear(ctx, canvas);

    ctx.save();
    ctx.globalAlpha = .08;
    ctx.strokeStyle = primary;
    for (let i = 0; i <= cells; i++) {
      ctx.beginPath(); ctx.moveTo(i * size, 0); ctx.lineTo(i * size, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * size); ctx.lineTo(canvas.width, i * size); ctx.stroke();
    }
    ctx.restore();

    neonFill(ctx, accent, 22);
    ctx.beginPath();
    ctx.roundRect(food.x * size + 3, food.y * size + 3, size - 6, size - 6, 4);
    ctx.fill();

    snake.forEach((p, i) => {
      neonFill(ctx, i === 0 ? primary : soft, i === 0 ? 22 : 14);
      ctx.beginPath();
      ctx.roundRect(p.x * size + 2, p.y * size + 2, size - 4, size - 4, 4);
      ctx.fill();
    });

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

  canvas.addEventListener('keydown', e => { changeDirection(e.key); e.preventDefault(); });
  window.addEventListener('resize', () => {
    if (!canvas.isConnected) return;
    reset(!running);
  });

  reset(true);
}

function initPong(uid) {
  const canvas = makeCanvas(uid, 16/10);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let raf, running = false;
  let player, ai, ball, playerScore, aiScore;

  function reset(paused = true) {
    fitCanvasToStage(canvas, 16/10);
    cancelAnimationFrame(raf);
    running = false;
    player = {x:24, y:canvas.height/2-42, w:12, h:84};
    ai = {x:canvas.width-36, y:canvas.height/2-42, w:12, h:84};
    ball = {x:canvas.width/2, y:canvas.height/2, r:7, vx:5, vy:2.6};
    playerScore = 0;
    aiScore = 0;
    setScore(uid, '0:0');
    draw();
    if (paused) showOverlay(uid, 'Pong', 'Mova o mouse ou toque na tela para controlar.', 'Iniciar', start);
  }

  function start() {
    hideOverlay(uid);
    if (running) return;
    running = true;
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

    if (ball.y < ball.r || ball.y > canvas.height - ball.r) ball.vy *= -1;
    ai.y += (ball.y - (ai.y + ai.h / 2)) * .075;
    ai.y = Math.max(0, Math.min(canvas.height - ai.h, ai.y));

    [player, ai].forEach(p => {
      if (ball.x + ball.r > p.x && ball.x - ball.r < p.x + p.w && ball.y > p.y && ball.y < p.y + p.h) {
        ball.vx *= -1.05;
        ball.vy += (ball.y - (p.y + p.h / 2)) * .05;
      }
    });

    if (ball.x < -20) { aiScore++; serve(-1); }
    if (ball.x > canvas.width + 20) { playerScore++; serve(1); }
    setScore(uid, `${playerScore}:${aiScore}`);

    if (playerScore >= 5 || aiScore >= 5) {
      running = false;
      cancelAnimationFrame(raf);
      showOverlay(uid, playerScore > aiScore ? 'Você venceu' : 'Game Over', 'Partida encerrada. Reinicie para jogar novamente.', 'Reset', () => reset(false));
    }
  }

  function serve(direction) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 5 * direction;
    ball.vy = (Math.random() * 4 - 2) || 2;
  }

  function draw() {
    const primary = getCSSColor('--text-1', '#ffffff');
    const accent = getCSSColor('--accent', '#dfe7ff');
    const soft = getCSSColor('--text-2', '#c8d0dd');

    crtClear(ctx, canvas);

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.20)';
    ctx.shadowColor = accent;
    ctx.shadowBlur = 10;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    neonFill(ctx, primary, 20);
    ctx.beginPath(); ctx.roundRect(player.x, player.y, player.w, player.h, 3); ctx.fill();

    neonFill(ctx, soft, 18);
    ctx.beginPath(); ctx.roundRect(ai.x, ai.y, ai.w, ai.h, 3); ctx.fill();

    neonFill(ctx, accent, 22);
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();

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
    setScore(uid, `0/${rows * cols - mineCount}`);
    board = Array.from({length: rows}, (_, y) => Array.from({length: cols}, (_, x) => ({x,y,mine:false,open:false,flag:false,near:0})));

    let placed = 0;
    while (placed < mineCount) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      if (!board[y][x].mine) { board[y][x].mine = true; placed++; }
    }

    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      board[y][x].near = neighbors(x, y).filter(c => c.mine).length;
    }

    draw();
    if (showStart) showOverlay(uid, 'Campo Minado', 'Clique para abrir. Botão direito para marcar.', 'Iniciar', () => hideOverlay(uid));
  }

  function neighbors(x, y) {
    const list = [];
    for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
      if (!dx && !dy) continue;
      const nx=x+dx, ny=y+dy;
      if (nx>=0 && ny>=0 && nx<cols && ny<rows) list.push(board[ny][nx]);
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
      showOverlay(uid, 'Game Over', 'Você encontrou uma mina. Reinicie para tentar novamente.', 'Reset', () => reset(false));
      return;
    }

    if (cell.near === 0) neighbors(cell.x, cell.y).forEach(reveal);

    if (opened >= rows * cols - mineCount) {
      finished = true;
      setScore(uid, 'WIN');
      draw();
      showOverlay(uid, 'Vitória', 'Todas as casas seguras foram abertas.', 'Reset', () => reset(false));
      return;
    }

    setScore(uid, `${opened}/${rows * cols - mineCount}`);
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
      btn.className = `mine-cell ${cell.open ? 'open' : ''} ${cell.flag ? 'flag' : ''}`;
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
