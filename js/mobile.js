const MOBILE_CONTACT_LINKS = {
  email: '#',
  linkedin: '#',
  instagram: '#',
  whatsapp: '#'
};

const pages = () => ({
  home: document.getElementById('mobileHome'),
  app: document.getElementById('mobileAppView')
});

const MOBILE_STATE = {
  stack: []
};

function showMobileHome(){
  const p = pages();
  MOBILE_STATE.stack = [];
  p.home.classList.add('active');
  p.app.classList.remove('active');
}

function showMobileApp(title, html){
  const p = pages();
  document.getElementById('mobileAppTitle').textContent = title;
  document.getElementById('mobileAppContent').innerHTML = html;
  p.home.classList.remove('active');
  p.app.classList.add('active');
}

function mobileEscape(value){
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  }[char]));
}

function getMobileItemById(id){
  return [...OS_DATA.portfolio, ...OS_DATA.curriculum, ...OS_DATA.games].find(item => item.id === id);
}

async function loadMobileFile(title, path){
  const html = await fetchHTML(path);
  MOBILE_STATE.stack.push({ type:'file', title, path });
  showMobileApp(title, `
    <div class="mobile-breadcrumb">
      <button type="button" class="mobile-back-inline" data-mobile-stack-back>‹ Voltar</button>
      <span>${mobileEscape(title)}</span>
    </div>
    <div class="mobile-content-card">${html}</div>
  `);
  bindMobileStackBack();
}

function mobileFolderIcon(){
  return `
    <span class="mobile-window-folder-icon" aria-hidden="true">
      <svg viewBox="0 0 873.37 694.59" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <path class="mobile-window-folder-back" d="M827.19,233.59c1.44,7.07-1.22,288.41-.19,302.99-2.63,25.23-22.55,47.9-48.89,47.9,0,0-690.56-.06-690.56-.06-26.3,0-47.97-24.9-47.97-50.41C63.12-105.93-91.47,13.19,440.93,2.38c47.31.47,63.76,60.47,111.23,59.79,0,0,206.75.33,206.75.33,37.96.07,67.96,33.35,68.1,63.6,1,21.77-.56,84.81.17,107.49Z" />
        <path class="mobile-window-folder-front" d="M827.23,170.69c27.66,5.6,46.58,29.96,46.13,58.18,0,0-.26,412.61-.26,412.61-2.92,27.98-25,53.11-54.21,53.11,0,0-765.69-.06-765.69-.06C24.03,694.53,0,666.92,0,638.64c0,0,.04-516.79.04-516.79,0-24.21,18.2-45.2,39.76-52.11,5.6-1.79,9.73-2.46,15.49-2.45,0,0,246.67.29,246.67.29,42.74-3.02,72.76,50.38,97.4,76.93,12.45,14.79,30.56,25.85,50.87,25.86,0,0,376.99.31,376.99.31Z" />
      </svg>
    </span>
  `;
}

function mobileProjectIcon(item){
  const first = item.assets?.[0] || '';
  if(first){
    return `<span class="mobile-project-thumb"><img src="${first}" alt="" loading="lazy" /></span>`;
  }
  return mobileFolderIcon();
}

function mobileAppIcon(item){
  if(item.id === 'landing-page-editavel'){
    return `<span class="mobile-project-thumb mobile-app-thumb mobile-duck-thumb"><img src="assets/icons/landing-duck.svg" alt="" /></span>`;
  }

  if(item.id === 'ranking' || item.id === 'ranking-exe'){
    return `<span class="mobile-project-thumb mobile-app-thumb"><img src="assets/icons/ranking-trophy.svg" alt="" /></span>`;
  }

  return `<span class="mobile-project-thumb mobile-app-thumb"><strong>APP</strong></span>`;
}

function mobileItemIcon(item){
  if(item.type === 'folder') return mobileFolderIcon();
  if(item.type === 'project') return mobileProjectIcon(item);
  if(item.type === 'html-app' || item.type === 'exe-app' || item.appPath || item.projectPath) return mobileAppIcon(item);
  return `<span class="mobile-project-thumb mobile-app-thumb"><strong>TXT</strong></span>`;
}

function buildMobilePath(path=[]){
  if(!path.length) return '';
  return `
    <div class="mobile-breadcrumb">
      <button type="button" class="mobile-back-inline" data-mobile-stack-back ${path.length <= 1 ? 'disabled' : ''}>‹ Voltar</button>
      <span>${path.map((p, i) => i === 0 ? 'Portfólio' : mobileEscape(p.label)).join(' / ')}</span>
    </div>
  `;
}

function renderMobileFolder(folder, path=[]){
  const files = folder.files || [];
  MOBILE_STATE.stack.push({ type:'folder', folder, path });

  const list = files.length
    ? files.map((item, index) => `
        <button class="mobile-file-item mobile-portfolio-item" data-mobile-folder-index="${index}">
          ${mobileItemIcon(item)}
          <span>${mobileEscape(item.label)}</span>
        </button>
      `).join('')
    : `<div class="mobile-empty-folder">Esta pasta ainda está vazia.</div>`;

  showMobileApp(folder.label, `
    ${buildMobilePath(path)}
    <div class="mobile-file-list mobile-portfolio-list">${list}</div>
  `);

  document.querySelectorAll('[data-mobile-folder-index]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = files[Number(btn.dataset.mobileFolderIndex)];
      openMobilePortfolioItem(item, [...path, { label:item.label, item }]);
    });
  });

  bindMobileStackBack();
}

function renderMobileProject(project, path=[]){
  MOBILE_STATE.stack.push({ type:'project', project, path });

  const imgs = (project.assets || []).map((src, index) => `
    <figure class="mobile-gallery-card">
      <img src="${src}" alt="${mobileEscape(project.label)} ${index + 1}" loading="lazy" />
    </figure>
  `).join('');

  showMobileApp(project.label, `
    ${buildMobilePath(path)}
    <section class="mobile-project-view">
      <h2>${mobileEscape(project.label)}</h2>
      <div class="mobile-gallery-grid">${imgs}</div>
    </section>
  `);

  bindMobileStackBack();
}

function renderMobileIframeApp(item){
  MOBILE_STATE.stack.push({ type:'app', item });

  const src = item.appPath || item.projectPath || item.path;
  const appClass = item.id === 'ranking' || item.id === 'ranking-exe' ? 'mobile-ranking-frame' : 'mobile-landing-frame';

  showMobileApp(item.label, `
    <div class="mobile-breadcrumb">
      <button type="button" class="mobile-back-inline" data-mobile-stack-back>‹ Voltar</button>
      <span>${mobileEscape(item.label)}</span>
    </div>
    <iframe class="mobile-project-frame mobile-fullscreen-frame ${appClass}" src="${src}" title="${mobileEscape(item.label)}"></iframe>
  `);

  bindMobileStackBack();
}

async function openMobilePortfolioItem(item, path=[]){
  if(!item) return;

  if(item.type === 'folder'){
    renderMobileFolder(item, path);
    return;
  }

  if(item.type === 'project'){
    renderMobileProject(item, path);
    return;
  }

  if(item.type === 'html-app' || item.type === 'exe-app' || item.appPath || item.projectPath){
    renderMobileIframeApp(item);
    return;
  }

  if(item.path){
    await loadMobileFile(item.label, item.path);
  }
}

function bindMobileStackBack(){
  document.querySelectorAll('[data-mobile-stack-back]').forEach(btn => {
    btn.addEventListener('click', () => mobileGoBack());
  });
}

function mobileGoBack(){
  if(MOBILE_STATE.stack.length <= 1){
    showMobileHome();
    return;
  }

  MOBILE_STATE.stack.pop();
  const previous = MOBILE_STATE.stack.pop();

  if(!previous){
    showMobileHome();
    return;
  }

  if(previous.type === 'folder') renderMobileFolder(previous.folder, previous.path);
  else if(previous.type === 'project') renderMobileProject(previous.project, previous.path);
  else if(previous.type === 'app') renderMobileIframeApp(previous.item);
  else if(previous.type === 'file') loadMobileFile(previous.title, previous.path);
  else showMobileHome();
}

function openMobileNotes(){
  MOBILE_STATE.stack = [{ type:'home' }];
  showMobileApp('Notas', `
    <div class="note-list">
      ${OS_DATA.curriculum.map(n => `
        <button class="note-item" data-note="${n.path}" data-title="${n.label}">
          ${mobileEscape(n.label)}
        </button>
      `).join('')}
    </div>
  `);

  document.querySelectorAll('[data-note]').forEach(n => {
    n.addEventListener('click', () => loadMobileFile(n.dataset.title, n.dataset.note));
  });
}

function openMobileGames(){
  MOBILE_STATE.stack = [{ type:'home' }];
  showMobileApp('Jogos', `
    <div class="mobile-file-list mobile-game-list">
      ${OS_DATA.games.map(g => `
        <button class="mobile-file-item mobile-game-item" data-mobile-game="${g.id}" data-title="${g.label}">
          <span class="mobile-game-thumb" style="background-image:url('${g.icon || ''}')"></span>
          <span>${mobileEscape(g.label)}</span>
        </button>
      `).join('')}
    </div>
  `);

  document.querySelectorAll('[data-mobile-game]').forEach(g => {
    g.addEventListener('click', () => openMobileGame(g.dataset.mobileGame, g.dataset.title));
  });
}

function openMobileContact(type){
  const href = MOBILE_CONTACT_LINKS[type] || '#';

  if(!href || href === '#'){
    showMobileApp('Contato', `
      <div class="mobile-fullscreen-view mobile-contact-view">
        <div class="mobile-breadcrumb">
          <button type="button" class="mobile-back-inline" data-mobile-stack-back>‹ Voltar</button>
          <span>Contato</span>
        </div>
        <div class="mobile-content-card">
          <p>Link de contato ainda não configurado.</p>
        </div>
      </div>
    `);
    bindMobileStackBack();
    return;
  }

  window.open(href, '_blank', 'noopener,noreferrer');
}


function getMobilePortfolioRootPath(item){
  return [{ label:'Portfólio', item }, { label:item.label, item }];
}

function collectMobileSearchItems(){
  const results = [];

  (OS_DATA.curriculum || []).forEach(item => {
    results.push({
      label: item.label,
      group: 'Notas',
      item,
      action: () => loadMobileFile(item.label, item.path)
    });
  });

  function walkPortfolio(items, path=[]){
    (items || []).forEach(item => {
      const nextPath = [...path, { label:item.label, item }];
      results.push({
        label: item.label,
        group: path.length ? path.map(p => p.label).join(' / ') : 'Portfólio',
        item,
        action: () => {
          MOBILE_STATE.stack = [{ type:'home' }];
          openMobilePortfolioItem(item, nextPath);
        }
      });
      if(item.files) walkPortfolio(item.files, nextPath);
    });
  }

  walkPortfolio(OS_DATA.portfolio || [], [{ label:'Portfólio' }]);

  (OS_DATA.games || []).forEach(item => {
    results.push({
      label: item.label,
      group: 'Jogos',
      item,
      action: () => openMobileGame(item.id, item.label)
    });
  });

  return results;
}

function bindMobileSearch(){
  const input = document.getElementById('mobileSearchInput');
  const resultsBox = document.getElementById('mobileSearchResults');
  const form = document.querySelector('[data-mobile-search-form]');
  if(!input || !resultsBox) return;

  const index = collectMobileSearchItems();

  function render(){
    const q = input.value.trim().toLowerCase();
    if(!q){
      resultsBox.innerHTML = '';
      resultsBox.classList.remove('active');
      return;
    }

    const matches = index
      .filter(entry => `${entry.label} ${entry.group}`.toLowerCase().includes(q))
      .slice(0, 8);

    if(!matches.length){
      resultsBox.innerHTML = '<p>Nenhum item encontrado.</p>';
      resultsBox.classList.add('active');
      return;
    }

    resultsBox.innerHTML = matches.map((entry, index) => `
      <button type="button" data-mobile-search-result="${index}">
        <strong>${mobileEscape(entry.label)}</strong>
        <small>${mobileEscape(entry.group)}</small>
      </button>
    `).join('');
    resultsBox.classList.add('active');

    resultsBox.querySelectorAll('[data-mobile-search-result]').forEach(btn => {
      btn.addEventListener('click', () => {
        const entry = matches[Number(btn.dataset.mobileSearchResult)];
        input.value = '';
        resultsBox.innerHTML = '';
        resultsBox.classList.remove('active');
        entry.action();
      });
    });
  }

  input.addEventListener('input', render);
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const first = resultsBox.querySelector('[data-mobile-search-result]');
    if(first) first.click();
  });
}

function updateMobileClocks(){
  const value = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  const statusClock = document.getElementById('mobileClock');
  const heroClock = document.getElementById('mobileHeroClock');
  if(statusClock) statusClock.textContent = value;
  if(heroClock) heroClock.textContent = value;
}

function initMobile(){
  document.querySelectorAll('[data-mobile-open]').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.mobileOpen;

    if(id === 'notes'){
      openMobileNotes();
      return;
    }

    if(id === 'games'){
      openMobileGames();
      return;
    }

    const item = OS_DATA.portfolio.find(f => f.id === id);

    if(item){
      MOBILE_STATE.stack = [{ type:'home' }];

      if(item.type === 'folder'){
        renderMobileFolder(item, [{ label:'Portfólio', item }, { label:item.label, item }]);
        return;
      }

      openMobilePortfolioItem(item, [{ label:'Portfólio', item }, { label:item.label, item }]);
    }
  }));

  
  document.querySelectorAll('[data-mobile-contact]').forEach(btn => {
    btn.addEventListener('click', () => openMobileContact(btn.dataset.mobileContact));
  });

  document.getElementById('mobileHomeBtn')?.addEventListener('click', showMobileHome);
  document.getElementById('mobileBack')?.addEventListener('click', mobileGoBack);
  document.getElementById('mobileBackTop')?.addEventListener('click', mobileGoBack);

  bindMobileSearch();
  updateMobileClocks();
  setInterval(updateMobileClocks, 1000);
}
