let gameInstanceCounter = 0;

function gameShell(id, label) {
  const uid = `game-${id}-${++gameInstanceCounter}`;
  return {
    uid,
    html: `
      <section class="game-box" data-game-shell="${uid}" data-game-type="${id}">
        <header class="game-head">
          <div>
            <strong>${label}</strong>
            <small>${getGameHint(id)}</small>
          </div>
          <div class="game-score" id="${uid}-score">0</div>
        </header>
        <div class="game-stage" id="${uid}-stage"></div>
        <div class="game-actions">
          <button type="button" id="${uid}-start">Iniciar</button>
          <button type="button" id="${uid}-reset">Reset</button>
        </div>
      </section>
    `
  };
}

function getGameHint(id) {
  if (id === 'snake') return 'Setas ou WASD para jogar';
  if (id === 'mines') return 'Clique para abrir. Botão direito para marcar';
  if (id === 'pong') return 'Mova o mouse ou toque na tela';
  return 'Jogo funcional';
}

function openGameWindow(id, label) {
  const shell = gameShell(id, label);
  const win = createWindow({
    title: label,
    html: shell.html,
    kind: 'game',
    x: Math.round(window.innerWidth * 0.3),
    y: Math.round(window.innerHeight * 0.14)
  });
  setTimeout(() => initGame(id, shell.uid), 0);
  return win;
}

function openMobileGame(id, label) {
  const shell = gameShell(id, label);
  showMobileApp(label, shell.html);
  setTimeout(() => initGame(id, shell.uid), 0);
}

function initGame(id, uid) {
  if (id === 'snake') initSnake(uid);
  if (id === 'mines') initMines(uid);
  if (id === 'pong') initPong(uid);
}

function makeCanvas(uid, width = 360, height = 360) {
  const stage = document.getElementById(`${uid}-stage`);
  if (!stage) return null;
  stage.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.tabIndex = 0;
  canvas.className = 'game-canvas';
  stage.appendChild(canvas);
  canvas.focus();
  return canvas;
}

function setScore(uid, value) {
  const el = document.getElementById(`${uid}-score`);
  if (el) el.textContent = value;
}

function initSnake(uid) {
  const canvas = makeCanvas(uid, 360, 360);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 18;
  const cells = canvas.width / size;
  let snake, food, dir, nextDir, score, timer, running;

  function reset() {
    snake = [{x: 9, y: 9}, {x: 8, y: 9}, {x: 7, y: 9}];
    dir = {x: 1, y: 0};
    nextDir = {...dir};
    score = 0;
    running = false;
    clearInterval(timer);
    placeFood();
    setScore(uid, score);
    draw();
  }

  function placeFood() {
    do {
      food = {x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells)};
    } while (snake.some(p => p.x === food.x && p.y === food.y));
  }

  function start() {
    if (running) return;
    running = true;
    clearInterval(timer);
    timer = setInterval(step, 105);
    canvas.focus();
  }

  function step() {
    dir = nextDir;
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
    const hitWall = head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells;
    const hitSelf = snake.some(p => p.x === head.x && p.y === head.y);
    if (hitWall || hitSelf) {
      clearInterval(timer);
      running = false;
      draw(true);
      return;
    }
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

  function draw(gameOver = false) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(5,4,3,.96)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,176,76,.18)';
    for (let i = 0; i <= cells; i++) {
      ctx.beginPath(); ctx.moveTo(i * size, 0); ctx.lineTo(i * size, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * size); ctx.lineTo(canvas.width, i * size); ctx.stroke();
    }
    ctx.fillStyle = '#ffb347';
    ctx.beginPath();
    ctx.roundRect(food.x * size + 3, food.y * size + 3, size - 6, size - 6, 5);
    ctx.fill();
    snake.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? '#ffe0a0' : '#ffb347';
      ctx.beginPath();
      ctx.roundRect(p.x * size + 2, p.y * size + 2, size - 4, size - 4, 5);
      ctx.fill();
    });
    if (gameOver) overlayText(ctx, canvas, 'GAME OVER', 'Reset para tentar de novo');
    if (!running && score === 0) overlayText(ctx, canvas, 'SNAKE', 'Clique em Iniciar');
  }

  function changeDirection(key) {
    const map = {
      ArrowUp: {x:0, y:-1}, w: {x:0, y:-1}, W: {x:0, y:-1},
      ArrowDown: {x:0, y:1}, s: {x:0, y:1}, S: {x:0, y:1},
      ArrowLeft: {x:-1, y:0}, a: {x:-1, y:0}, A: {x:-1, y:0},
      ArrowRight: {x:1, y:0}, d: {x:1, y:0}, D: {x:1, y:0}
    };
    const nd = map[key];
    if (!nd) return;
    if (nd.x + dir.x === 0 && nd.y + dir.y === 0) return;
    nextDir = nd;
  }

  canvas.addEventListener('keydown', e => { changeDirection(e.key); e.preventDefault(); });
  document.getElementById(`${uid}-start`)?.addEventListener('click', start);
  document.getElementById(`${uid}-reset`)?.addEventListener('click', reset);
  reset();
}

function initMines(uid) {
  const stage = document.getElementById(`${uid}-stage`);
  if (!stage) return;
  const rows = 9, cols = 9, mineCount = 10;
  let board = [], opened = 0, finished = false;

  function reset() {
    opened = 0;
    finished = false;
    setScore(uid, `0/${rows * cols - mineCount}`);
    board = Array.from({length: rows}, (_, y) => Array.from({length: cols}, (_, x) => ({x, y, mine:false, open:false, flag:false, near:0})));
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
  }

  function neighbors(x, y) {
    const list = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) list.push(board[ny][nx]);
    }
    return list;
  }

  function reveal(cell) {
    if (finished || cell.open || cell.flag) return;
    cell.open = true;
    opened++;
    if (cell.mine) {
      finished = true;
      board.flat().forEach(c => { if (c.mine) c.open = true; });
      setScore(uid, 'BOOM');
      draw();
      return;
    }
    if (cell.near === 0) neighbors(cell.x, cell.y).forEach(reveal);
    if (opened >= rows * cols - mineCount) {
      finished = true;
      setScore(uid, 'VITÓRIA');
    } else {
      setScore(uid, `${opened}/${rows * cols - mineCount}`);
    }
    draw();
  }

  function draw() {
    stage.innerHTML = `<div class="mines-grid" style="--cols:${cols}"></div>`;
    const grid = stage.querySelector('.mines-grid');
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

  document.getElementById(`${uid}-start`)?.addEventListener('click', reset);
  document.getElementById(`${uid}-reset`)?.addEventListener('click', reset);
  reset();
}

function initPong(uid) {
  const canvas = makeCanvas(uid, 480, 300);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let raf, running = false;
  let player, ai, ball, playerScore, aiScore;

  function reset() {
    cancelAnimationFrame(raf);
    running = false;
    player = {x: 18, y: 120, w: 10, h: 60};
    ai = {x: canvas.width - 28, y: 120, w: 10, h: 60};
    ball = {x: canvas.width / 2, y: canvas.height / 2, r: 7, vx: 4, vy: 2.4};
    playerScore = 0;
    aiScore = 0;
    setScore(uid, '0 : 0');
    draw();
  }

  function start() {
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
    ai.y += (ball.y - (ai.y + ai.h / 2)) * 0.075;
    ai.y = Math.max(0, Math.min(canvas.height - ai.h, ai.y));
    [player, ai].forEach(p => {
      if (ball.x + ball.r > p.x && ball.x - ball.r < p.x + p.w && ball.y > p.y && ball.y < p.y + p.h) {
        ball.vx *= -1.06;
        ball.vy += (ball.y - (p.y + p.h / 2)) * 0.06;
      }
    });
    if (ball.x < -20) { aiScore++; serve(-1); }
    if (ball.x > canvas.width + 20) { playerScore++; serve(1); }
    setScore(uid, `${playerScore} : ${aiScore}`);
  }

  function serve(direction) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 4 * direction;
    ball.vy = (Math.random() * 4 - 2) || 2;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(5,4,3,.96)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,176,76,.28)';
    ctx.setLineDash([6, 10]);
    ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffe0a0';
    ctx.beginPath(); ctx.roundRect(player.x, player.y, player.w, player.h, 6); ctx.fill();
    ctx.fillStyle = '#ffb347';
    ctx.beginPath(); ctx.roundRect(ai.x, ai.y, ai.w, ai.h, 6); ctx.fill();
    ctx.fillStyle = '#ffb347';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
    if (!running && playerScore === 0 && aiScore === 0) overlayText(ctx, canvas, 'PONG', 'Clique em Iniciar');
  }

  function movePaddle(clientY) {
    const rect = canvas.getBoundingClientRect();
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    player.y = Math.max(0, Math.min(canvas.height - player.h, y - player.h / 2));
    draw();
  }

  canvas.addEventListener('pointermove', e => movePaddle(e.clientY));
  canvas.addEventListener('pointerdown', e => { movePaddle(e.clientY); start(); });
  document.getElementById(`${uid}-start`)?.addEventListener('click', start);
  document.getElementById(`${uid}-reset`)?.addEventListener('click', reset);
  reset();
}

function overlayText(ctx, canvas, title, subtitle) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.56)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe0a0';
  ctx.font = '800 28px Courier New, monospace';
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 10);
  ctx.fillStyle = '#ffcf86';
  ctx.font = '700 14px Courier New, monospace';
  ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 20);
  ctx.restore();
}
