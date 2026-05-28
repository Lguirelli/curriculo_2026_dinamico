const desktopClock = document.querySelector('[data-desktop-clock]');
const desktopClockSmall = document.querySelector('[data-desktop-clock-small]');
const desktopDay = document.querySelector('[data-desktop-day]');
const desktopWeekday = document.querySelector('[data-desktop-weekday]');
const desktopDate = document.querySelector('[data-desktop-date]');
const taskbarDate = document.querySelector('[data-taskbar-date]');
const mobileClock = document.querySelector('[data-mobile-clock]');
const mobileClockSettings = document.querySelector('[data-mobile-clock-settings]');
const weatherTemp = document.querySelector('[data-weather-temp]');
const weatherDesc = document.querySelector('[data-weather-desc]');
const weatherMeta = document.querySelector('[data-weather-meta]');
const weatherIcon = document.querySelector('[data-weather-icon]');
const taskbarWeather = document.querySelector('[data-taskbar-weather]');

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const weekday = now.toLocaleDateString('pt-BR', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const compactDate = now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

  if (desktopClock) desktopClock.textContent = time;
  if (desktopClockSmall) desktopClockSmall.textContent = time;
  if (desktopDay) desktopDay.textContent = String(now.getDate()).padStart(2, '0');
  if (desktopWeekday) desktopWeekday.textContent = weekday;
  if (desktopDate) desktopDate.textContent = fullDate;
  if (taskbarDate) taskbarDate.textContent = compactDate;
  if (mobileClock) mobileClock.textContent = time;
  if (mobileClockSettings) mobileClockSettings.textContent = time;
}

updateClock();
setInterval(updateClock, 1000);

const weatherCodes = {
  0: ['☀', 'Céu limpo'],
  1: ['🌤', 'Poucas nuvens'],
  2: ['⛅', 'Parcialmente nublado'],
  3: ['☁', 'Nublado'],
  45: ['🌫', 'Nevoeiro'],
  48: ['🌫', 'Nevoeiro'],
  51: ['🌦', 'Garoa leve'],
  53: ['🌦', 'Garoa'],
  55: ['🌧', 'Garoa forte'],
  61: ['🌧', 'Chuva leve'],
  63: ['🌧', 'Chuva'],
  65: ['🌧', 'Chuva forte'],
  80: ['🌦', 'Pancadas leves'],
  81: ['🌧', 'Pancadas'],
  82: ['⛈', 'Pancadas fortes'],
  95: ['⛈', 'Trovoadas']
};

function setWeatherFallback() {
  if (weatherTemp) weatherTemp.textContent = '30°C';
  if (weatherDesc) weatherDesc.textContent = 'Clima local';
  if (weatherMeta) weatherMeta.textContent = 'Fallback visual';
  if (weatherIcon) weatherIcon.textContent = '☁';
  if (taskbarWeather) taskbarWeather.textContent = '30°C';
}

async function fetchWeather(latitude = -22.4256, longitude = -45.4528, label = 'Itajubá') {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('weather request failed');
    const data = await response.json();
    const current = data.current || {};
    const temp = Math.round(current.temperature_2m);
    const [icon, desc] = weatherCodes[current.weather_code] || ['☁', 'Clima local'];

    if (weatherTemp) weatherTemp.textContent = `${temp}°C`;
    if (weatherDesc) weatherDesc.textContent = desc;
    if (weatherMeta) weatherMeta.textContent = `${label} · Vento ${Math.round(current.wind_speed_10m || 0)} km/h · Umidade ${current.relative_humidity_2m || '--'}%`;
    if (weatherIcon) weatherIcon.textContent = icon;
    if (taskbarWeather) taskbarWeather.textContent = `${temp}°C`;
  } catch (error) {
    setWeatherFallback();
  }
}

function initWeather() {
  if (!weatherTemp && !taskbarWeather) return;

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => fetchWeather(position.coords.latitude, position.coords.longitude, 'Local atual'),
      () => fetchWeather(),
      { timeout: 3500, maximumAge: 1000 * 60 * 30 }
    );
  } else {
    fetchWeather();
  }
}

initWeather();
setInterval(initWeather, 1000 * 60 * 15);

const GRID = {
  startX: 34,
  startY: 34,
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
  localStorage.setItem('lorenzo-os-desktop-layout-v3', JSON.stringify(layout));
}

function loadLayout() {
  const saved = JSON.parse(localStorage.getItem('lorenzo-os-desktop-layout-v3') || 'null');

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
  win.style.left = `${320 + Math.random() * 120}px`;
  win.style.top = `${120 + Math.random() * 90}px`;
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

document.querySelectorAll('[data-open-program]').forEach(button => {
  button.addEventListener('click', () => {
    const title = button.dataset.openProgram;
    openWindow(title, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Esta janela representa um projeto do portfólio.', true);
    startMenu?.classList.remove('open');
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
