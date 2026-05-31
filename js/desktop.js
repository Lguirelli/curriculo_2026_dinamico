const GRID = {
  marginX: 28,
  topY: 28,
  bottomSafe: 112,
  iconW: 90,
  iconH: 98,
  minCellW: 94,
  maxCellW: 112,
  minCellH: 100,
  maxCellH: 106
};

const LS_KEY = 'lorenzo_os_desktop_positions_v9_txt_drag_fixed';
let resizeTimer = null;

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function getGridMetrics(){
  const width = window.innerWidth;
  const height = window.innerHeight;
  const marginX = width < 980 ? 18 : GRID.marginX;
  const topY = GRID.topY;
  const bottomSafe = width < 980 ? 96 : GRID.bottomSafe;
  const cellW = clamp(Math.round(width / 16), GRID.minCellW, GRID.maxCellW);
  const cellH = clamp(Math.round(height / 8), GRID.minCellH, GRID.maxCellH);
  const maxRows = Math.max(1, Math.floor((height - topY - bottomSafe) / cellH));

  const centerGap = width < 1080 ? 120 : 180;
  const usableSideWidth = Math.max(GRID.iconW, (width - marginX * 2 - centerGap) / 2);
  const maxColsPerSide = Math.max(1, Math.floor((usableSideWidth - GRID.iconW) / cellW) + 1);
  const maxCols = Math.max(1, Math.floor((width - marginX * 2 - GRID.iconW) / cellW) + 1);

  return { width, height, marginX, topY, bottomSafe, cellW, cellH, maxRows, maxCols, maxColsPerSide, centerGap };
}

function loadPositions(){
  try{
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  }catch{
    return {};
  }
}

function savePosition(id, cellIndex){
  const pos = loadPositions();
  pos[id] = {
    mode: 'cell-index',
    index: cellIndex,
    savedAtWidth: window.innerWidth,
    savedAtHeight: window.innerHeight
  };
  localStorage.setItem(LS_KEY, JSON.stringify(pos));
}

function getCellIndexFromPosition(x, y, side = 'left'){
  const m = getGridMetrics();
  const sideCols = m.maxColsPerSide || m.maxCols;
  const col = side === 'right'
    ? clamp(Math.round((m.width - m.marginX - GRID.iconW - x) / m.cellW), 0, sideCols - 1)
    : clamp(Math.round((x - m.marginX) / m.cellW), 0, sideCols - 1);
  const row = clamp(Math.round((y - m.topY) / m.cellH), 0, m.maxRows - 1);
  return col * m.maxRows + row;
}

function normalizeIndex(index){
  const m = getGridMetrics();
  const maxCells = (m.maxColsPerSide || m.maxCols) * m.maxRows;
  return clamp(index, 0, maxCells - 1);
}

function positionFromIndex(index){
  const m = getGridMetrics();
  const normalized = normalizeIndex(index);
  const col = Math.floor(normalized / m.maxRows);
  const row = normalized % m.maxRows;

  return {
    x: m.marginX + col * m.cellW,
    y: m.topY + row * m.cellH,
    index: normalized,
    col,
    row
  };
}

function defaultPosition(item, defaultIndex){
  const m = getGridMetrics();
  const sideCols = m.maxColsPerSide || m.maxCols;
  const maxCells = sideCols * m.maxRows;
  const normalized = clamp(defaultIndex, 0, maxCells - 1);
  const col = Math.floor(normalized / m.maxRows);
  const row = normalized % m.maxRows;
  const y = clamp(m.topY + row * m.cellH, m.topY, m.height - m.bottomSafe - GRID.iconH);

  if(item.side === 'right'){
    const x = m.width - m.marginX - GRID.iconW - col * m.cellW;
    const minRightX = Math.ceil(m.width / 2 + m.centerGap / 2);
    return {
      x: clamp(x, minRightX, m.width - m.marginX - GRID.iconW),
      y,
      index: normalized,
      col,
      row
    };
  }

  const maxLeftX = Math.floor(m.width / 2 - m.centerGap / 2 - GRID.iconW);
  return {
    x: clamp(m.marginX + col * m.cellW, m.marginX, Math.max(m.marginX, maxLeftX)),
    y,
    index: normalized,
    col,
    row
  };
}

function migrateOldPosition(saved, item){
  if(!saved) return null;

  if(saved.mode === 'cell-index' && Number.isFinite(saved.index)){
    return defaultPosition(item, saved.index);
  }

  if(Number.isFinite(saved.x) && Number.isFinite(saved.y)){
    return defaultPosition(item, getCellIndexFromPosition(saved.x, saved.y, item.side));
  }

  return null;
}

function physicalKey(x, y){
  return `${Math.round(x)}:${Math.round(y)}`;
}

function findFreePosition(proposed, item, occupied){
  const m = getGridMetrics();
  const maxAttempts = m.maxCols * m.maxRows;

  if(!occupied.has(physicalKey(proposed.x, proposed.y))){
    return proposed;
  }

  for(let step = 1; step < maxAttempts; step++){
    let candidate;

    if(item.side === 'right' && !item.wasManuallyMoved){
      candidate = defaultPosition(item, proposed.index + step);
    }else{
      candidate = positionFromIndex(proposed.index + step);
    }

    const key = physicalKey(candidate.x, candidate.y);
    if(!occupied.has(key)) return candidate;
  }

  return proposed;
}

function snapToResponsiveGrid(x, y, side = 'left'){
  const item = { side };
  return defaultPosition(item, getCellIndexFromPosition(x, y, side));
}

function getOccupiedPositionKeys(excludeElement){
  const occupied = new Set();
  document.querySelectorAll('.desktop-icon').forEach(el => {
    if(el === excludeElement) return;
    occupied.add(physicalKey(el.offsetLeft, el.offsetTop));
  });
  return occupied;
}

function getAvailableSnappedPosition(icon, item){
  const snapped = snapToResponsiveGrid(icon.offsetLeft, icon.offsetTop, item.side);
  const occupied = getOccupiedPositionKeys(icon);
  return findFreePosition(snapped, item, occupied);
}

function clearSelection(){
  document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
}

function getInitialItems(){
  return [
    ...OS_DATA.curriculum.map((it, i) => ({...it, group: 'curriculo', side: 'left', defaultIndex: i})),
    ...OS_DATA.portfolio.map((it, i) => ({...it, group: 'portfolio', side: 'right', defaultIndex: i})),
    ...OS_DATA.games.map((it, i) => ({...it, group: 'game', type: 'game', side: 'right', defaultIndex: OS_DATA.portfolio.length + i}))
  ];
}

function renderDesktopIcons(){
  const wrap = document.getElementById('desktopIcons');
  const saved = loadPositions();
  const occupied = new Set();

  wrap.innerHTML = '';

  getInitialItems().forEach(item => {
    const stored = saved[item.id];
    const migrated = migrateOldPosition(stored, item);
    item.wasManuallyMoved = Boolean(migrated);

    const proposed = migrated || defaultPosition(item, item.defaultIndex);
    const finalPos = findFreePosition(proposed, item, occupied);
    occupied.add(physicalKey(finalPos.x, finalPos.y));

    const icon = document.createElement('button');
    icon.className = `desktop-icon ${item.type === 'folder' ? 'folder' : ''} ${item.type === 'game' ? 'game' : ''}`;
    icon.dataset.id = item.id;
    icon.dataset.type = item.type;
    icon.dataset.side = item.side;
    icon.style.left = `${finalPos.x}px`;
    icon.style.top = `${finalPos.y}px`;

    if (item.type === 'html-app') {
      icon.innerHTML = `
        <span class="desktop-duck-app-icon" aria-hidden="true">
          <img src="assets/icons/landing-duck.svg" alt="" draggable="false" />
        </span>
        <span class="desktop-icon-label">${item.label}</span>
      `;
    } else if (item.type === 'exe-app') {
      icon.innerHTML = `
        <span class="desktop-ranking-app-icon" aria-hidden="true">
          <img src="assets/icons/ranking-trophy.svg" alt="" draggable="false" />
        </span>
        <span class="desktop-icon-label">${item.label}</span>
      `;
    }
    else if (item.type === 'folder') {
      icon.innerHTML = `
        <span class="folder-glass-icon desktop-folder-icon" aria-hidden="true"><svg class="folder-glass-svg" viewBox="0 0 873.37 694.59" xmlns="http://www.w3.org/2000/svg" focusable="false">
  <path class="folder-back-path" d="M827.19,233.59c1.44,7.07-1.22,288.41-.19,302.99-2.63,25.23-22.55,47.9-48.89,47.9,0,0-690.56-.06-690.56-.06-26.3,0-47.97-24.9-47.97-50.41C63.12-105.93-91.47,13.19,440.93,2.38c47.31.47,63.76,60.47,111.23,59.79,0,0,206.75.33,206.75.33,37.96.07,67.96,33.35,68.1,63.6,1,21.77-.56,84.81.17,107.49Z" />
  <path class="folder-front-path" d="M827.23,170.69c27.66,5.6,46.58,29.96,46.13,58.18,0,0-.26,412.61-.26,412.61-2.92,27.98-25,53.11-54.21,53.11,0,0-765.69-.06-765.69-.06C24.03,694.53,0,666.92,0,638.64c0,0,.04-516.79.04-516.79,0-24.21,18.2-45.2,39.76-52.11,5.6-1.79,9.73-2.46,15.49-2.45,0,0,246.67.29,246.67.29,42.74-3.02,72.76,50.38,97.4,76.93,12.45,14.79,30.56,25.85,50.87,25.86,0,0,376.99.31,376.99.31Z" />
</svg></span>
        <span class="desktop-icon-label">${item.label}</span>
      `;
    } else if (item.type === 'txt') {
      icon.innerHTML = `
        <span class="txt-file-shell" aria-hidden="true">
          <img class="txt-file-icon" src="assets/icons/txt-file.svg" alt="" aria-hidden="true" draggable="false" />
        </span>
        <span class="desktop-icon-label">${item.label}</span>
      `;
    } else if (item.type === 'game') {
      icon.innerHTML = `
        <span class="game-cover-icon" aria-hidden="true" style="background-image:url('${item.icon || ''}')"></span>
        <span class="desktop-icon-label">${item.label}</span>
      `;
    } else {
      icon.innerHTML = `
        <span class="icon-glyph">DIR</span>
        <span class="desktop-icon-label">${item.label}</span>
      `;
    }

    wrap.appendChild(icon);
    makeDesktopIconInteractive(icon, item);
  });
}

function makeDesktopIconInteractive(icon, item){
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;
  let drag = false;
  let moved = false;

  icon.addEventListener('pointerdown', e => {
    e.preventDefault();
    drag = true;
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
    baseX = icon.offsetLeft;
    baseY = icon.offsetTop;
    icon.setPointerCapture(e.pointerId);
    clearSelection();
    icon.classList.add('selected', 'dragging');
  });

  icon.addEventListener('pointermove', e => {
    if(!drag) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if(Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;

    const m = getGridMetrics();
    icon.style.left = `${clamp(baseX + dx, 0, m.width - GRID.iconW)}px`;
    icon.style.top = `${clamp(baseY + dy, m.topY, m.height - m.bottomSafe - GRID.iconH)}px`;
  });

  icon.addEventListener('pointerup', () => {
    if(!drag) return;

    drag = false;
    icon.classList.remove('dragging');

    const snapped = getAvailableSnappedPosition(icon, item);
    icon.style.left = `${snapped.x}px`;
    icon.style.top = `${snapped.y}px`;
    savePosition(item.id, snapped.index);
  });

  icon.addEventListener('click', e => {
    e.stopPropagation();
    clearSelection();
    icon.classList.add('selected');
  });

  icon.addEventListener('dblclick', e => {
    e.stopPropagation();
    if(moved) return;
    if(item.type === 'txt') openTextFile(item);
    if(item.type === 'folder') openFolder(item);
    if(item.type === 'html-app' || item.type === 'exe-app') openHtmlApp(item);
    if(item.type === 'game') openGameWindow(item.id, item.label);
  });
}

function setupStartMenu(){
  const btn = document.getElementById('startButton');
  const menu = document.getElementById('startMenu');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('open');
  });

  menu.addEventListener('click', e => e.stopPropagation());

  document.addEventListener('click', () => {
    menu.classList.remove('open');
    clearSelection();
  });

  menu.querySelectorAll('[data-open-folder]').forEach(b => b.addEventListener('click', () => {
    const folder = OS_DATA.portfolio.find(f => f.id === b.dataset.openFolder);
    if(folder) openFolder(folder);
    menu.classList.remove('open');
  }));

  menu.querySelectorAll('[data-open-game]').forEach(b => b.addEventListener('click', () => {
    openGameWindow(b.dataset.openGame, b.querySelector('small')?.textContent.trim() || b.textContent.trim());
    menu.classList.remove('open');
  }));
}

function flattenPortfolioItems(items, parentLabel=''){
  return items.flatMap(item => {
    const label = parentLabel ? `${parentLabel} / ${item.label}` : item.label;

    if(item.type === 'folder' && Array.isArray(item.files)){
      return [
        {
          label,
          typeLabel:'Pasta',
          action:() => openFolder(item)
        },
        ...flattenPortfolioItems(item.files, label)
      ];
    }

    if(item.type === 'project'){
      return [{
        label,
        typeLabel:'Projeto',
        action:() => openPortfolioProject(item)
      }];
    }

    if(item.type === 'html-app' || item.type === 'exe-app'){
      return [{
        label,
        typeLabel:'App',
        action:() => openHtmlApp(item)
      }];
    }

    if(item.path){
      return [{
        label,
        typeLabel:'Arquivo',
        action:() => openPortfolioFolderItem(item)
      }];
    }

    return [];
  });
}

function getSearchItems(){
  const curriculum = OS_DATA.curriculum.map(item => ({
    label: item.label,
    typeLabel: 'Currículo',
    action: () => openTextFile(item)
  }));
  const portfolio = flattenPortfolioItems(OS_DATA.portfolio);
  const games = OS_DATA.games.map(item => ({
    label: item.label,
    typeLabel: 'Jogo',
    action: () => openGameWindow(item.id, item.label)
  }));
  return [...curriculum, ...portfolio, ...games];
}

function setupDesktopSearch(){
  const dock = document.querySelector('[data-dock]');
  const input = document.getElementById('desktopSearchInput');
  const results = document.getElementById('desktopSearchResults');
  const form = document.querySelector('[data-search-form]');
  const toggle = document.querySelector('[data-search-toggle]');
  if(!dock || !input || !results || !form || !toggle) return;
  const items = getSearchItems();

  function closeSearch(){
    dock.classList.remove('search-open', 'has-results');
    results.innerHTML = '';
    input.value = '';
  }

  function openSearch(){
    dock.classList.add('search-open');
    window.setTimeout(() => input.focus(), 60);
  }

  function renderResults(){
    const query = input.value.trim().toLowerCase();
    results.innerHTML = '';
    if(!query){
      dock.classList.remove('has-results');
      return;
    }
    const filtered = items
      .filter(item => item.label.toLowerCase().includes(query) || item.typeLabel.toLowerCase().includes(query))
      .slice(0, 7);
    if(!filtered.length){
      dock.classList.add('has-results');
      results.innerHTML = '<div class="search-result-item"><strong>Nenhum resultado</strong><small>Digite outro termo</small></div>';
      return;
    }
    filtered.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-result-item';
      button.innerHTML = `<strong>${item.label}</strong><small>${item.typeLabel}</small>`;
      button.addEventListener('click', () => {
        item.action();
        closeSearch();
      });
      results.appendChild(button);
    });
    dock.classList.add('has-results');
  }

  toggle.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    if(dock.classList.contains('search-open')){
      if(input.value.trim()){
        input.value = '';
        renderResults();
        input.focus();
      }else{
        closeSearch();
      }
    }else{
      openSearch();
    }
  });

  input.addEventListener('input', renderResults);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const query = input.value.trim().toLowerCase();
    const match = items.find(item => item.label.toLowerCase().includes(query));
    if(match){
      match.action();
      closeSearch();
    }
  });
  dock.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && dock.classList.contains('search-open')) closeSearch();
  });
  document.addEventListener('click', e => {
    if(dock.classList.contains('search-open') && !dock.contains(e.target)) closeSearch();
  });
}

function updateDesktopClock(){
  const el = document.getElementById('topPanelClock');
  if(!el) return;

  const now = new Date();
  const date = now.toLocaleDateString('pt-BR', {weekday: 'short', day: '2-digit', month: 'short'}).replace('.', '');
  const time = now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
  el.textContent = `${date} ${time}`;
}

function initDesktop(){
  renderDesktopIcons();
  setupStartMenu();
  setupDesktopSearch();
  updateDesktopClock();
  setInterval(updateDesktopClock, 1000);

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(renderDesktopIcons, 120);
  });
}


function setupCrtSwitch(){
  const crtSwitch = document.querySelector('[data-crt-toggle]');
  if(!crtSwitch) return;

  const applyState = (enabled) => {
    document.body.classList.toggle('crt-disabled', !enabled);
    crtSwitch.classList.toggle('is-off', !enabled);
    crtSwitch.setAttribute('aria-pressed', String(enabled));
    localStorage.setItem('lorenzo_os_crt_enabled', enabled ? '1' : '0');
  };

  const saved = localStorage.getItem('lorenzo_os_crt_enabled');
  applyState(saved !== '0');

  crtSwitch.addEventListener('click', () => {
    applyState(crtSwitch.getAttribute('aria-pressed') !== 'true');
  });
}

document.addEventListener('DOMContentLoaded', setupCrtSwitch);
