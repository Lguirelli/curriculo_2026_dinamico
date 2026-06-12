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
  document.getElementById('mobileAppTitle').textContent = String(title || '').replace(/\.txt$/i, '');
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
  return [...OS_DATA.portfolio, ...OS_DATA.curriculum].find(item => item.id === id);
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
  const appClass = item.id === 'ranking' || item.id === 'ranking-exe'
    ? 'mobile-ranking-frame'
    : item.id === 'backrooms-landing-3d'
      ? 'mobile-backrooms-frame'
      : 'mobile-landing-frame';

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

function stripHTMLToText(html){
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
}

function getMobileNoteTitle(label){
  return String(label || '').replace(/\.txt$/i, '');
}

async function getMobileNotePreview(path){
  try{
    const html = await fetchHTML(path);
    const text = stripHTMLToText(html);
    return text.length > 96 ? text.slice(0, 96).trim() + '…' : text;
  }catch(error){
    return '';
  }
}

async function renderMobileCurriculoNotes(){
  MOBILE_STATE.stack = [{ type:'home' }];

  const cards = await Promise.all(OS_DATA.curriculum.map(async item => {
    const title = getMobileNoteTitle(item.label);
    const preview = await getMobileNotePreview(item.path);

    return `
      <button class="mobile-note-card" data-note="${item.path}" data-title="${item.label}">
        <span class="mobile-note-title">${mobileEscape(title)}</span>
        <span class="mobile-note-preview">${mobileEscape(preview || 'Toque para abrir esta nota.')}</span>
      </button>
    `;
  }));

  showMobileApp('Currículo', `
    <div class="mobile-notes-list">
      ${cards.join('')}
    </div>
  `);

  document.querySelectorAll('[data-note]').forEach(n => {
    n.addEventListener('click', () => loadMobileFile(n.dataset.title, n.dataset.note));
  });
}

function openMobileNotes(){
  renderMobileCurriculoNotes();
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

function normalizeMobileSearch(value){
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function flattenMobileSearchItems(items, parentLabel=''){
  return (items || []).flatMap(item => {
    const label = parentLabel ? `${parentLabel} / ${item.label}` : item.label;

    if(item.type === 'folder' && Array.isArray(item.files)){
      return [
        {
          label,
          keywords: `${label} pasta portfolio`,
          action:() => renderMobileFolder(item, [{ label:'Portfólio', item }, { label:item.label, item }])
        },
        ...flattenMobileSearchItems(item.files, label)
      ];
    }

    if(item.type === 'project'){
      return [{
        label,
        keywords: `${label} projeto portfolio design fotografia video`,
        action:() => renderMobileProject(item, [{ label:'Portfólio', item }, { label:item.label, item }])
      }];
    }

    if(item.type === 'html-app' || item.type === 'exe-app' || item.appPath || item.projectPath){
      return [{
        label,
        keywords: `${label} app html portfolio`,
        action:() => renderMobileIframeApp(item)
      }];
    }

    if(item.path){
      return [{
        label,
        keywords: `${label} arquivo nota curriculo`,
        action:() => loadMobileFile(item.label, item.path)
      }];
    }

    return [];
  });
}

function getMobileSearchItems(){
  const curriculum = (OS_DATA.curriculum || []).map(item => ({
    label:`Currículo / ${String(item.label || '').replace(/\.txt$/i, '')}`,
    keywords:`curriculo currículo notas ${item.label || ''}`,
    action:() => loadMobileFile(item.label, item.path)
  }));

  const portfolio = flattenMobileSearchItems(OS_DATA.portfolio || []);

  const fixedApps = [
    {
      label:'landing page editavel',
      keywords:'landing page editavel landing página editável site html',
      action:() => {
        const item = (OS_DATA.portfolio || []).find(i => i.id === 'landing-page-editavel');
        if(item) renderMobileIframeApp(item);
      }
    },
    {
      label:'ranking',
      keywords:'ranking rank exe aplicativo',
      action:() => {
        const item = (OS_DATA.portfolio || []).find(i => i.id === 'ranking' || i.id === 'ranking-exe');
        if(item) renderMobileIframeApp(item);
      }
    }
  ];

  return [...curriculum, ...portfolio, ...fixedApps];
}

function performMobileSearch(query){
  const q = normalizeMobileSearch(query);
  if(!q) return;

  const result = getMobileSearchItems().find(item =>
    normalizeMobileSearch(`${item.label} ${item.keywords || ''}`).includes(q)
  );

  if(result?.action){
    result.action();
    return;
  }

  showMobileApp('Busca', `
    <div class="mobile-breadcrumb">
      <button type="button" class="mobile-back-inline" data-mobile-stack-back>‹ Voltar</button>
      <span>Busca</span>
    </div>
    <div class="mobile-content-card mobile-search-empty">
      <strong>Nenhum resultado encontrado.</strong>
      <p>Tente buscar por currículo, design, fotografia, vídeos, landing ou ranking.</p>
    </div>
  `);
  bindMobileStackBack();
}

function initMobileSearch(){
  const form = document.getElementById('mobileSearchForm');
  const input = document.getElementById('mobileSearchInput');
  const button = document.getElementById('mobileSearchButton');

  if(!form || !input) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    performMobileSearch(input.value);
  });

  button?.addEventListener('click', () => {
    if(!input.value.trim()){
      input.focus();
    }
  });

  input.addEventListener('keydown', event => {
    if(event.key === 'Enter'){
      event.preventDefault();
      performMobileSearch(input.value);
    }
  });
}

function initMobile(){
  initMobileSearch();
  document.querySelectorAll('[data-mobile-open]').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.mobileOpen;

    if(id === 'notes'){
      openMobileNotes();
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

  const updateMobileClocks = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
    const weekday = now.toLocaleDateString('pt-BR', {weekday:'long'});
    const date = now.toLocaleDateString('pt-BR', {day:'2-digit', month:'long', year:'numeric'});

    const statusClock = document.getElementById('mobileClock');
    const heroClock = document.getElementById('mobileHeroClock');
    const heroWeekday = document.getElementById('mobileHeroWeekday');
    const heroDate = document.getElementById('mobileHeroDate');

    if(statusClock) statusClock.textContent = time;
    if(heroClock) heroClock.textContent = time;
    if(heroWeekday) heroWeekday.textContent = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    if(heroDate) heroDate.textContent = date.replace(/ de /g, ' De ').replace(/^./, c => c.toUpperCase());
  };

  updateMobileClocks();
  setInterval(updateMobileClocks, 1000);
}
