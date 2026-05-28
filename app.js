const desktopClock = document.querySelector('[data-desktop-clock]');
const desktopClockSmall = document.querySelector('[data-desktop-clock-small]');
const mobileClock = document.querySelector('[data-mobile-clock]');
const mobileClockSettings = document.querySelector('[data-mobile-clock-settings]');

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (desktopClock) desktopClock.textContent = time;
  if (desktopClockSmall) desktopClockSmall.textContent = time;
  if (mobileClock) mobileClock.textContent = time;
  if (mobileClockSettings) mobileClockSettings.textContent = time;
}

updateClock();
setInterval(updateClock, 1000);

const GRID = {
  startX: 24,
  startY: 18,
  colWidth: 96,
  rowHeight: 108
};

const files = [...document.querySelectorAll('.desktop-file')];
const windowLayer = document.querySelector('[data-window-layer]');
const startButton = document.querySelector('[data-start-button]');
const startMenu = document.querySelector('[data-start-menu]');
let highestZ = 100;

function snap(value, grid) {
  return Math.round(value / grid) * grid;
}

function saveLayout() {
  const layout = files.map(file => ({
    id: file.dataset.fileId,
    left: file.style.left,
    top: file.style.top
  }));
  localStorage.setItem('lorenzo-os-desktop-layout-v2', JSON.stringify(layout));
}

function loadLayout() {
  const saved = JSON.parse(localStorage.getItem('lorenzo-os-desktop-layout-v2') || 'null');

  files.forEach((file, index) => {
    const position = saved?.find(item => item.id === file.dataset.fileId);
    file.style.left = position?.left || `${GRID.startX}px`;
    file.style.top = position?.top || `${GRID.startY + index * GRID.rowHeight}px`;
  });
}

function selectFile(file) {
  files.forEach(item => item.classList.remove('selected'));
  file.classList.add('selected');
}

function clampWindowPosition(win, x, y) {
  const layerRect = windowLayer.getBoundingClientRect();
  const winRect = win.getBoundingClientRect();
  const maxX = Math.max(0, layerRect.width - winRect.width - 12);
  const maxY = Math.max(0, layerRect.height - winRect.height - 12);

  return {
    x: Math.min(Math.max(12, x), maxX),
    y: Math.min(Math.max(12, y), maxY)
  };
}

function enableWindowDrag(win) {
  const header = win.querySelector('.window-header');
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;

  header.addEventListener('pointerdown', event => {
    if (event.target.closest('button')) return;

    win.style.zIndex = ++highestZ;
    startX = event.clientX;
    startY = event.clientY;
    originX = parseInt(win.style.left, 10) || 0;
    originY = parseInt(win.style.top, 10) || 0;

    header.setPointerCapture(event.pointerId);
    win.classList.add('moving');
  });

  header.addEventListener('pointermove', event => {
    if (!header.hasPointerCapture(event.pointerId)) return;

    const next = clampWindowPosition(
      win,
      originX + event.clientX - startX,
      originY + event.clientY - startY
    );

    win.style.left = `${next.x}px`;
    win.style.top = `${next.y}px`;
  });

  header.addEventListener('pointerup', event => {
    if (!header.hasPointerCapture(event.pointerId)) return;
    header.releasePointerCapture(event.pointerId);
    win.classList.remove('moving');
  });
}

function openWindow(title, content, isProgram = false) {
  const win = document.createElement('article');
  win.className = 'window';
  win.style.left = `${140 + Math.random() * 80}px`;
  win.style.top = `${80 + Math.random() * 60}px`;
  win.style.zIndex = ++highestZ;

  win.innerHTML = `
    <header class="window-header">
      <strong>${title}</strong>
      <button type="button" aria-label="Fechar">×</button>
    </header>
    <div class="window-content">
      ${isProgram ? '<div class="program-placeholder"></div>' : ''}
      <p>${content}</p>
    </div>
  `;

  win.querySelector('button').addEventListener('click', () => win.remove());
  win.addEventListener('pointerdown', () => {
    win.style.zIndex = ++highestZ;
  });

  windowLayer.appendChild(win);
  enableWindowDrag(win);
}

function enableDragging(file) {
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;

  file.addEventListener('pointerdown', event => {
    selectFile(file);
    startX = event.clientX;
    startY = event.clientY;
    originX = parseInt(file.style.left, 10) || 0;
    originY = parseInt(file.style.top, 10) || 0;
    file.setPointerCapture(event.pointerId);
    file.classList.add('dragging');
  });

  file.addEventListener('pointermove', event => {
    if (!file.hasPointerCapture(event.pointerId)) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    file.style.left = `${originX + dx}px`;
    file.style.top = `${originY + dy}px`;
  });

  file.addEventListener('pointerup', event => {
    if (!file.hasPointerCapture(event.pointerId)) return;
    file.releasePointerCapture(event.pointerId);
    file.classList.remove('dragging');

    const x = parseInt(file.style.left, 10) || 0;
    const y = parseInt(file.style.top, 10) || 0;

    file.style.left = `${Math.max(GRID.startX, snap(x, GRID.colWidth))}px`;
    file.style.top = `${Math.max(GRID.startY, snap(y, GRID.rowHeight))}px`;

    saveLayout();
  });

  file.addEventListener('dblclick', () => {
    openWindow(file.dataset.title, file.dataset.content);
  });
}

loadLayout();
files.forEach(enableDragging);

document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.desktop-file')) {
    files.forEach(item => item.classList.remove('selected'));
  }

  if (!event.target.closest('[data-start-menu]') && !event.target.closest('[data-start-button]')) {
    startMenu?.classList.remove('open');
  }
});

startButton?.addEventListener('click', event => {
  event.stopPropagation();
  startMenu.classList.toggle('open');
});

startMenu?.querySelectorAll('[data-open-program]').forEach(button => {
  button.addEventListener('click', () => {
    const title = button.dataset.openProgram;
    openWindow(title, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Esta janela representa um projeto do portfólio.', true);
    startMenu.classList.remove('open');
  });
});

const mobileViews = [...document.querySelectorAll('[data-mobile-view]')];
const recentsPanel = document.querySelector('[data-mobile-recents]');
const recentsList = document.querySelector('[data-recents-list]');
const historyStack = ['home'];
const openScreens = new Set(['home']);

const viewNames = {
  home: 'Home',
  notes: 'Notas',
  'note-detail': 'Nota aberta',
  'project-detail': 'Projeto aberto',
  contact: 'Contato',
  settings: 'Config'
};

function renderRecents() {
  recentsList.innerHTML = '';
  [...openScreens].forEach(screen => {
    const button = document.createElement('button');
    button.textContent = viewNames[screen] || screen;
    button.addEventListener('click', () => {
      showMobileView(screen, false);
      recentsPanel.classList.remove('open');
    });
    recentsList.appendChild(button);
  });
}

function showMobileView(name, push = true) {
  mobileViews.forEach(view => {
    view.classList.toggle('active', view.dataset.mobileView === name);
  });

  if (push && historyStack[historyStack.length - 1] !== name) {
    historyStack.push(name);
  }

  openScreens.add(name);
  renderRecents();
}

function goBack() {
  recentsPanel.classList.remove('open');

  if (historyStack.length > 1) {
    historyStack.pop();
    showMobileView(historyStack[historyStack.length - 1], false);
  } else {
    showMobileView('home', false);
  }
}

document.querySelectorAll('[data-open-mobile]').forEach(button => {
  button.addEventListener('click', () => showMobileView(button.dataset.openMobile));
});

document.querySelectorAll('[data-note]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('[data-note-title]').textContent = button.dataset.note;
    document.querySelector('[data-note-body]').textContent = button.dataset.noteContent;
    showMobileView('note-detail');
  });
});

document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('[data-project-title]').textContent = button.dataset.project;
    showMobileView('project-detail');
  });
});

document.querySelectorAll('[data-mobile-back-inline]').forEach(button => {
  button.addEventListener('click', goBack);
});

document.querySelector('[data-mobile-home-button]')?.addEventListener('click', () => {
  recentsPanel.classList.remove('open');
  showMobileView('home');
});

document.querySelector('[data-mobile-back-button]')?.addEventListener('click', goBack);

document.querySelector('[data-mobile-recents-button]')?.addEventListener('click', () => {
  recentsPanel.classList.toggle('open');
  renderRecents();
});
