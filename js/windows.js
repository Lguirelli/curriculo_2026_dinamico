let topZ = 10;
let textWindowOffset = 0;
const windowsLayer = () => document.getElementById('windowsLayer');

async function fetchHTML(path){
  try{
    const res = await fetch(path);
    if(!res.ok) throw new Error('Arquivo não encontrado');
    return await res.text();
  }catch(err){
    return `<h2>Arquivo não carregado</h2><p>${path}</p>`;
  }
}

function createWindow({title, html, kind='default', x=null, y=null}){
  const layer = windowsLayer();
  const win = document.createElement('article');
  win.className = `os-window ${kind === 'text' ? 'text-window' : kind === 'folder-window' ? 'folder-window' : kind === 'game' ? 'game-window' : ''}`;
  win.style.zIndex = ++topZ;
  if(x !== null) win.style.left = `${x}px`;
  if(y !== null) win.style.top = `${y}px`;

  win.innerHTML = `
    <header class="window-header">
      <button class="window-control window-close" title="Fechar" aria-label="Fechar"></button>
      <button class="window-control window-full" title="Tela cheia" aria-label="Tela cheia"></button>
      <button class="window-control window-min" title="Minimizar" aria-label="Minimizar"></button>
      <strong class="window-title">${title}</strong>
    </header>
    <div class="window-body">${html}</div>
    <span class="window-resize-edge window-resize-right" data-resize="right" aria-hidden="true"></span>
    <span class="window-resize-edge window-resize-bottom" data-resize="bottom" aria-hidden="true"></span>
    <span class="window-resize-edge window-resize-corner" data-resize="corner" aria-hidden="true"></span>
  `;

  layer.appendChild(win);

  win.addEventListener('pointerdown',()=> win.style.zIndex = ++topZ);
  win.querySelector('.window-close').addEventListener('click',(e)=>{e.stopPropagation();win.remove();});
  win.querySelector('.window-full').addEventListener('click',(e)=>{e.stopPropagation();win.classList.toggle('fullscreen');});
  win.querySelector('.window-min').addEventListener('click',(e)=>{e.stopPropagation();win.style.transform='scale(.92)';win.style.opacity='0';setTimeout(()=>win.remove(),160);});

  makeDraggableWindow(win, win.querySelector('.window-header'));
  makeResizableWindow(win);

  return win;
}

function makeDraggableWindow(win, handle){
  let startX=0,startY=0,baseX=0,baseY=0,drag=false;

  handle.addEventListener('pointerdown', e=>{
    if(e.target.classList.contains('window-control')) return;
    if(win.classList.contains('fullscreen')) return;
    drag=true;
    startX=e.clientX;
    startY=e.clientY;
    baseX=win.offsetLeft;
    baseY=win.offsetTop;
    handle.setPointerCapture(e.pointerId);
    win.style.zIndex=++topZ;
  });

  handle.addEventListener('pointermove', e=>{
    if(!drag) return;
    win.style.left = `${Math.max(0, Math.min(window.innerWidth-120, baseX + e.clientX - startX))}px`;
    win.style.top = `${Math.max(0, Math.min(window.innerHeight-100, baseY + e.clientY - startY))}px`;
  });

  handle.addEventListener('pointerup', ()=>{
    if(!drag) return;
    drag=false;
    const grid=12;
    win.style.left = `${Math.max(0, Math.round(win.offsetLeft/grid)*grid)}px`;
    win.style.top = `${Math.max(0, Math.round(win.offsetTop/grid)*grid)}px`;
  });
}

function makeResizableWindow(win){
  if(win.classList.contains('game-window')) return;
  const handles = win.querySelectorAll('[data-resize]');
  handles.forEach(handle=>{
    let startX=0,startY=0,startW=0,startH=0,resizing=false;
    const mode = handle.dataset.resize;

    handle.addEventListener('pointerdown', e=>{
      if(win.classList.contains('fullscreen')) return;
      resizing=true;
      startX=e.clientX;
      startY=e.clientY;
      startW=win.offsetWidth;
      startH=win.offsetHeight;
      handle.setPointerCapture(e.pointerId);
      win.style.zIndex=++topZ;
      e.preventDefault();
      e.stopPropagation();
    });

    handle.addEventListener('pointermove', e=>{
      if(!resizing) return;

      const minW = win.classList.contains('text-window') ? 320 : 360;
      const minH = win.classList.contains('text-window') ? 220 : 260;
      const maxW = window.innerWidth - win.offsetLeft - 18;
      const maxH = window.innerHeight - win.offsetTop - 18;

      if(mode === 'right' || mode === 'corner'){
        const nextW = Math.max(minW, Math.min(maxW, startW + e.clientX - startX));
        win.style.width = `${nextW}px`;
      }

      if(mode === 'bottom' || mode === 'corner'){
        const nextH = Math.max(minH, Math.min(maxH, startH + e.clientY - startY));
        win.style.height = `${nextH}px`;
      }
    });

    handle.addEventListener('pointerup', ()=>{
      resizing=false;
    });
  });
}

async function openTextFile(item){
  const html = await fetchHTML(item.path);
  textWindowOffset = (textWindowOffset + 1) % 6;
  createWindow({title:item.label, html, kind:'text', x:150 + textWindowOffset*24, y:72 + textWindowOffset*18});
}

function htmlFileIconMarkup(){
  return `
    <span class="portfolio-html-file-icon" aria-hidden="true">
      <span class="portfolio-html-file-corner"></span>
      <strong>HTML</strong>
    </span>
  `;
}

function portfolioFolderItemIconMarkup(){
  return `
    <span class="portfolio-folder-item-icon" aria-hidden="true">
      <svg viewBox="0 0 873.37 694.59" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <path class="portfolio-folder-item-back" d="M827.19,233.59c1.44,7.07-1.22,288.41-.19,302.99-2.63,25.23-22.55,47.9-48.89,47.9,0,0-690.56-.06-690.56-.06-26.3,0-47.97-24.9-47.97-50.41C63.12-105.93-91.47,13.19,440.93,2.38c47.31.47,63.76,60.47,111.23,59.79,0,0,206.75.33,206.75.33,37.96.07,67.96,33.35,68.1,63.6,1,21.77-.56,84.81.17,107.49Z" />
        <path class="portfolio-folder-item-front" d="M827.23,170.69c27.66,5.6,46.58,29.96,46.13,58.18,0,0-.26,412.61-.26,412.61-2.92,27.98-25,53.11-54.21,53.11,0,0-765.69-.06-765.69-.06C24.03,694.53,0,666.92,0,638.64c0,0,.04-516.79.04-516.79,0-24.21,18.2-45.2,39.76-52.11,5.6-1.79,9.73-2.46,15.49-2.45,0,0,246.67.29,246.67.29,42.74-3.02,72.76,50.38,97.4,76.93,12.45,14.79,30.56,25.85,50.87,25.86,0,0,376.99.31,376.99.31Z" />
      </svg>
    </span>
  `;
}

function createBrowserFrameHTML(title, url){
  return `
    <section class="project-browser-content">
      <div class="project-browser-bar">
        <span class="browser-dot red"></span>
        <span class="browser-dot yellow"></span>
        <span class="browser-dot green"></span>
        <span class="browser-address">${url}</span>
      </div>
      <iframe class="project-browser-frame" src="${url}" title="${title}"></iframe>
    </section>
  `;
}

function openHtmlApp(item){
  const html = createBrowserFrameHTML(item.label, item.appPath || item.projectPath || item.path);
  const win = createWindow({
    title:item.label,
    html,
    kind:'default',
    x:Math.round(window.innerWidth * .06),
    y:Math.round(window.innerHeight * .04)
  });

  win.classList.add('project-browser-window');
}

async function openPortfolioFolderItem(file){
  if(file.type === 'html-project' || file.projectPath || file.appPath){
    openHtmlApp({
      label:file.label,
      appPath:file.appPath || file.projectPath || file.path
    });
    return;
  }

  const html = await fetchHTML(file.path);
  createWindow({
    title:file.label,
    html,
    kind:'default',
    x:Math.round(window.innerWidth * .22),
    y:Math.round(window.innerHeight * .12)
  });
}

function openFolder(folder){
  const files = (folder.files || []).map((file, index) => {
    const icon = (file.type === 'html-project' || file.type === 'html-file' || file.icon === 'html')
      ? htmlFileIconMarkup()
      : portfolioFolderItemIconMarkup();

    return `
      <button class="folder-file portfolio-folder-file" type="button" data-file-index="${index}" title="${file.label}">
        ${icon}
        <small>${file.label}</small>
      </button>
    `;
  }).join('');

  const html = `<div class="folder-grid portfolio-folder-grid">${files}</div>`;

  const win = createWindow({
    title:folder.label,
    html,
    kind:'folder-window',
    x:Math.round(window.innerWidth * .24),
    y:Math.round(window.innerHeight * .12)
  });

  win.querySelectorAll('[data-file-index]').forEach(btn => {
    const file = folder.files[Number(btn.dataset.fileIndex)];

    btn.addEventListener('click', async () => {
      const selected = btn.classList.contains('selected');
      win.querySelectorAll('.folder-file').forEach(el => el.classList.remove('selected'));
      btn.classList.add('selected');

      if(selected){
        await openPortfolioFolderItem(file);
      }
    });

    btn.addEventListener('dblclick', async () => {
      await openPortfolioFolderItem(file);
    });
  });
}