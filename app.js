const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  z: 30,
  weatherTemp: "--",
  weatherDesc: "Clima local",
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function setText(selector, value) {
  const el = $(selector);
  if (el) el.textContent = value;
}

function updateClock() {
  const now = new Date();
  const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  $$('[data-clock]').forEach(el => el.textContent = hhmm);
  setText('[data-taskbar-clock]', hhmm);
  setText('[data-taskbar-date]', now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }));
}

function makeWindow(appId, title, contentNode) {
  const existing = document.querySelector(`[data-window="${appId}"]`);
  if (existing) {
    existing.style.zIndex = ++state.z;
    return existing;
  }

  const win = document.createElement('section');
  win.className = 'app-window';
  win.dataset.window = appId;
  win.style.left = `${Math.max(40, window.innerWidth * 0.5 - 280)}px`;
  win.style.top = `${110 + Math.random() * 80}px`;
  win.style.zIndex = ++state.z;
  win.innerHTML = `
    <header class="window-titlebar" data-drag-handle>
      <strong>${title}</strong>
      <div class="window-actions"><button type="button" data-close aria-label="Fechar janela">Fechar</button></div>
    </header>
    <div class="window-body"></div>
  `;
  $('.window-body', win).append(contentNode);
  $('[data-window-layer]').append(win);
  makeDraggable(win, $('[data-drag-handle]', win));
  const closeButton = $('[data-close]', win);
  closeButton.addEventListener('pointerdown', ev => ev.stopPropagation());
  closeButton.addEventListener('click', ev => {
    ev.stopPropagation();
    win.remove();
  });
  win.addEventListener('pointerdown', () => win.style.zIndex = ++state.z);
  return win;
}

function makeDraggable(el, handle) {
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let active = false;

  handle.addEventListener('pointerdown', ev => {
    active = true;
    startX = ev.clientX;
    startY = ev.clientY;
    originX = el.offsetLeft;
    originY = el.offsetTop;
    handle.setPointerCapture(ev.pointerId);
  });

  handle.addEventListener('pointermove', ev => {
    if (!active) return;
    const nextX = originX + ev.clientX - startX;
    const nextY = originY + ev.clientY - startY;
    el.style.left = `${Math.max(8, Math.min(nextX, window.innerWidth - el.offsetWidth - 8))}px`;
    el.style.top = `${Math.max(8, Math.min(nextY, window.innerHeight - el.offsetHeight - 54))}px`;
  });

  handle.addEventListener('pointerup', ev => {
    active = false;
    try { handle.releasePointerCapture(ev.pointerId); } catch (_) {}
  });
}

function setupDesktopIcons() {
  const desktop = $('[data-desktop-icons]');
  const grid = {
    startX: 26,
    startY: 34,
    cellX: 92,
    cellY: 92,
    iconW: 86,
  };

  function getInitialPosition(icon) {
    const col = Number(icon.dataset.col || 0);
    const row = Number(icon.dataset.row || 0);
    const y = grid.startY + row * grid.cellY;
    if (icon.dataset.anchor === 'right') {
      return {
        x: Math.max(grid.startX, desktop.clientWidth - grid.startX - grid.iconW - col * grid.cellX),
        y,
      };
    }
    return {
      x: grid.startX + col * grid.cellX,
      y,
    };
  }

  function snapX(value) {
    const leftSnap = grid.startX + Math.round((value - grid.startX) / grid.cellX) * grid.cellX;
    const rightStart = desktop.clientWidth - grid.startX - grid.iconW;
    const rightSnap = rightStart - Math.round((rightStart - value) / grid.cellX) * grid.cellX;
    return Math.abs(value - rightSnap) < Math.abs(value - leftSnap) ? rightSnap : leftSnap;
  }

  function snapY(value) {
    return grid.startY + Math.round((value - grid.startY) / grid.cellY) * grid.cellY;
  }

  function clamp(icon, x, y) {
    return {
      x: Math.max(0, Math.min(x, desktop.clientWidth - icon.offsetWidth)),
      y: Math.max(0, Math.min(y, desktop.clientHeight - icon.offsetHeight)),
    };
  }

  $$('.desktop-icon').forEach(icon => {
    const initial = getInitialPosition(icon);
    icon.style.left = `${initial.x}px`;
    icon.style.top = `${initial.y}px`;

    let lastClick = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let moved = false;

    icon.addEventListener('pointerdown', ev => {
      $$('.desktop-icon.selected').forEach(item => item.classList.remove('selected'));
      icon.classList.add('selected');
      dragging = true;
      moved = false;
      startX = ev.clientX;
      startY = ev.clientY;
      originX = icon.offsetLeft;
      originY = icon.offsetTop;
      icon.setPointerCapture(ev.pointerId);
    });

    icon.addEventListener('pointermove', ev => {
      if (!dragging) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) < 4) return;
      moved = true;
      const next = clamp(icon, originX + dx, originY + dy);
      icon.style.left = `${next.x}px`;
      icon.style.top = `${next.y}px`;
    });

    icon.addEventListener('pointerup', ev => {
      if (!dragging) return;
      dragging = false;
      const snapped = clamp(icon, snapX(icon.offsetLeft), snapY(icon.offsetTop));
      icon.style.left = `${snapped.x}px`;
      icon.style.top = `${snapped.y}px`;
      try { icon.releasePointerCapture(ev.pointerId); } catch (_) {}

      const now = Date.now();
      if (!moved && now - lastClick < 360) openApp(icon.dataset.open, 'desktop');
      lastClick = now;
    });
  });

  document.addEventListener('pointerdown', ev => {
    if (!ev.target.closest('.desktop-icon')) {
      $$('.desktop-icon.selected').forEach(item => item.classList.remove('selected'));
    }
  });
}
function openApp(appId, mode = 'desktop') {
  const titleMap = {
    snake: 'snake.exe',
    mines: 'minesweeper.exe',
    pong: 'pong.exe',
    about: 'sobre.txt',
    experience: 'experiência.txt',
    education: 'formação.txt',
    skills: 'skills.txt',
    contact: 'contato.txt',
    f1: 'F1',
    ia: 'IA',
    web: 'Web',
    branding: 'Branding',
  };
  const templateMap = {
    snake: 'snake-template',
    mines: 'mines-template',
    pong: 'pong-template',
    about: 'about-template',
    experience: 'experience-template',
    education: 'education-template',
    skills: 'skills-template',
    contact: 'contact-template',
    f1: 'f1-template',
    ia: 'ia-template',
    web: 'web-template',
    branding: 'branding-template',
  };
  const tpl = document.getElementById(templateMap[appId]);
  if (!tpl) return;
  const content = tpl.content.firstElementChild.cloneNode(true);

  if (mode === 'mobile') {
    $('[data-mobile-title]').textContent = titleMap[appId] || appId;
    const body = $('[data-mobile-body]');
    body.innerHTML = '';
    body.append(content);
    $('[data-mobile-window]').classList.remove('hidden');
  } else {
    makeWindow(appId, titleMap[appId] || appId, content);
  }

  if (appId === 'snake') initSnake(content);
  if (appId === 'mines') initMines(content);
  if (appId === 'pong') initPong(content);
}

function initSnake(root) {
  const canvas = $('[data-snake-canvas]', root);
  const ctx = canvas.getContext('2d');
  const scoreEl = $('[data-score]', root);
  const size = 16;
  const cells = canvas.width / size;
  let snake;
  let food;
  let dir;
  let nextDir;
  let score;
  let timer;

  function reset() {
    snake = [{x: 9, y: 9}, {x: 8, y: 9}, {x: 7, y: 9}];
    food = {x: 14, y: 9};
    dir = {x: 1, y: 0};
    nextDir = {...dir};
    score = 0;
    scoreEl.textContent = score;
    clearInterval(timer);
    timer = setInterval(tick, 110);
  }

  function placeFood() {
    do {
      food = {x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells)};
    } while (snake.some(p => p.x === food.x && p.y === food.y));
  }

  function tick() {
    dir = nextDir;
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
    const hit = head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells || snake.some(p => p.x === head.x && p.y === head.y);
    if (hit) return reset();
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111720';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,.04)';
    for (let i = 0; i < cells; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size, 0);
      ctx.lineTo(i * size, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * size);
      ctx.lineTo(canvas.width, i * size);
      ctx.stroke();
    }
    ctx.fillStyle = '#e9c37f';
    ctx.fillRect(food.x * size + 2, food.y * size + 2, size - 4, size - 4);
    ctx.fillStyle = '#f6efe1';
    snake.forEach((p, i) => {
      ctx.globalAlpha = i === 0 ? 1 : .76;
      ctx.fillRect(p.x * size + 2, p.y * size + 2, size - 4, size - 4);
    });
    ctx.globalAlpha = 1;
  }

  function setDirection(name) {
    const dirs = { up: {x: 0, y: -1}, down: {x: 0, y: 1}, left: {x: -1, y: 0}, right: {x: 1, y: 0} };
    const nd = dirs[name];
    if (!nd) return;
    if (nd.x + dir.x === 0 && nd.y + dir.y === 0) return;
    nextDir = nd;
  }

  root.addEventListener('click', ev => {
    const btn = ev.target.closest('[data-dir]');
    if (btn) setDirection(btn.dataset.dir);
  });
  window.addEventListener('keydown', ev => {
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (map[ev.key]) setDirection(map[ev.key]);
  });
  $('[data-game-reset]', root).addEventListener('click', reset);
  reset();
}

function initMines(root) {
  const board = $('[data-mines-board]', root);
  const countEl = $('[data-mines-count]', root);
  const width = 9;
  const totalMines = 10;
  let cells = [];
  let ended = false;

  function reset() {
    ended = false;
    board.innerHTML = '';
    cells = Array.from({ length: width * width }, (_, id) => ({ id, mine: false, open: false, flag: false, near: 0 }));
    let placed = 0;
    while (placed < totalMines) {
      const index = Math.floor(Math.random() * cells.length);
      if (!cells[index].mine) {
        cells[index].mine = true;
        placed++;
      }
    }
    cells.forEach(cell => cell.near = neighbors(cell.id).filter(n => cells[n].mine).length);
    render();
  }

  function neighbors(id) {
    const x = id % width;
    const y = Math.floor(id / width);
    const list = [];
    for (let yy = -1; yy <= 1; yy++) {
      for (let xx = -1; xx <= 1; xx++) {
        if (!xx && !yy) continue;
        const nx = x + xx;
        const ny = y + yy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < width) list.push(ny * width + nx);
      }
    }
    return list;
  }

  function reveal(id) {
    const cell = cells[id];
    if (ended || cell.open || cell.flag) return;
    cell.open = true;
    if (cell.mine) {
      ended = true;
      cells.forEach(c => c.open = true);
      render();
      return;
    }
    if (cell.near === 0) neighbors(id).forEach(reveal);
    const safeOpen = cells.filter(c => !c.mine && c.open).length;
    if (safeOpen === cells.length - totalMines) ended = true;
    render();
  }

  function flag(id) {
    const cell = cells[id];
    if (ended || cell.open) return;
    cell.flag = !cell.flag;
    render();
  }

  function render() {
    board.innerHTML = '';
    const flags = cells.filter(c => c.flag).length;
    countEl.textContent = Math.max(0, totalMines - flags);
    cells.forEach(cell => {
      const btn = document.createElement('button');
      btn.className = 'mine-cell';
      if (cell.open) btn.classList.add('open');
      if (cell.flag) btn.classList.add('flag');
      btn.textContent = cell.open ? (cell.mine ? '💣' : (cell.near || '')) : (cell.flag ? '⚑' : '');
      btn.addEventListener('click', () => reveal(cell.id));
      btn.addEventListener('contextmenu', ev => {
        ev.preventDefault();
        flag(cell.id);
      });
      board.append(btn);
    });
  }

  $('[data-game-reset]', root).addEventListener('click', reset);
  reset();
}

function initPong(root) {
  const canvas = $('[data-pong-canvas]', root);
  const ctx = canvas.getContext('2d');
  const playerEl = $('[data-player-score]', root);
  const aiEl = $('[data-ai-score]', root);
  let raf;
  let playerScore = 0;
  let aiScore = 0;
  const paddle = { w: 10, h: 62 };
  const player = { x: 22, y: 99 };
  const ai = { x: canvas.width - 32, y: 99 };
  const ball = { x: 210, y: 130, vx: 3.2, vy: 2.2, r: 6 };

  function resetBall(direction = 1) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 3.2 * direction;
    ball.vy = (Math.random() > .5 ? 1 : -1) * (1.8 + Math.random() * 1.6);
  }

  function reset() {
    playerScore = 0;
    aiScore = 0;
    playerEl.textContent = playerScore;
    aiEl.textContent = aiScore;
    resetBall(Math.random() > .5 ? 1 : -1);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111720';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,.15)';
    ctx.setLineDash([8, 9]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f6efe1';
    ctx.fillRect(player.x, player.y, paddle.w, paddle.h);
    ctx.fillRect(ai.x, ai.y, paddle.w, paddle.h);
    ctx.fillStyle = '#e9c37f';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    ball.x += ball.vx;
    ball.y += ball.vy;
    if (ball.y < ball.r || ball.y > canvas.height - ball.r) ball.vy *= -1;

    ai.y += (ball.y - (ai.y + paddle.h / 2)) * .065;
    ai.y = Math.max(0, Math.min(canvas.height - paddle.h, ai.y));

    const hitPlayer = ball.x - ball.r < player.x + paddle.w && ball.y > player.y && ball.y < player.y + paddle.h;
    const hitAi = ball.x + ball.r > ai.x && ball.y > ai.y && ball.y < ai.y + paddle.h;
    if (hitPlayer && ball.vx < 0) ball.vx *= -1.04;
    if (hitAi && ball.vx > 0) ball.vx *= -1.04;

    if (ball.x < 0) {
      aiScore++;
      aiEl.textContent = aiScore;
      resetBall(1);
    }
    if (ball.x > canvas.width) {
      playerScore++;
      playerEl.textContent = playerScore;
      resetBall(-1);
    }
    draw();
    raf = requestAnimationFrame(loop);
  }

  function moveTo(clientY) {
    const rect = canvas.getBoundingClientRect();
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    player.y = Math.max(0, Math.min(canvas.height - paddle.h, y - paddle.h / 2));
  }

  canvas.addEventListener('pointermove', ev => moveTo(ev.clientY));
  canvas.addEventListener('pointerdown', ev => moveTo(ev.clientY));
  $('[data-game-reset]', root).addEventListener('click', reset);
  reset();
  cancelAnimationFrame(raf);
  loop();
}

function setupMobile() {
  $('[data-open-folder="games"]').addEventListener('click', () => $('[data-folder-screen]').classList.remove('hidden'));
  $('[data-close-folder]').addEventListener('click', () => $('[data-folder-screen]').classList.add('hidden'));
  $('[data-mobile-back]').addEventListener('click', () => $('[data-mobile-window]').classList.add('hidden'));
  $$('[data-folder-screen] [data-open]').forEach(btn => btn.addEventListener('click', () => openApp(btn.dataset.open, 'mobile')));

  $('[data-open-mobile="notes"]').addEventListener('click', () => openTextMobile('Notas', '<h2>Currículo</h2><p>Card de nota para adaptar com experiências, habilidades e resumo profissional.</p>'));
  $('[data-open-mobile="portfolio"]').addEventListener('click', () => openTextMobile('Portfolio', '<h2>Projetos</h2><p>Placeholder para projetos em formato de apps soltos na home.</p>'));
  $('[data-open-mobile="contact"]').addEventListener('click', () => openTextMobile('Contato', '<h2>Contato</h2><p>Email: guirellilorenzo1@gmail.com</p><p>LinkedIn, GitHub, Instagram e WhatsApp podem ser ligados aqui.</p>'));
}

function openTextMobile(title, html) {
  $('[data-mobile-title]').textContent = title;
  $('[data-mobile-body]').innerHTML = `<article class="text-file">${html}</article>`;
  $('[data-mobile-window]').classList.remove('hidden');
}

function boot() {
  updateClock();
  setInterval(updateClock, 1000);
  setupDesktopIcons();
  setupMobile();
  const start = $('[data-start]');
  if (start) start.addEventListener('click', () => openApp('about'));
}

boot();
