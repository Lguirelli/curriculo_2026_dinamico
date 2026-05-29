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
    <span class="window-resize-handle" aria-hidden="true"></span>
  `;
  layer.appendChild(win);
  win.addEventListener('pointerdown',()=> win.style.zIndex = ++topZ);
  win.querySelector('.window-close').addEventListener('click',(e)=>{e.stopPropagation();win.remove();});
  win.querySelector('.window-full').addEventListener('click',(e)=>{e.stopPropagation();win.classList.toggle('fullscreen');});
  win.querySelector('.window-min').addEventListener('click',(e)=>{e.stopPropagation();win.style.transform='scale(.92)';win.style.opacity='0';setTimeout(()=>win.remove(),160);});
  makeDraggableWindow(win, win.querySelector('.window-header'));
  makeResizableWindow(win, win.querySelector('.window-resize-handle'));
  return win;
}

function makeResizableWindow(win, handle){
  if(!handle) return;
  let startX=0,startY=0,startW=0,startH=0,resizing=false;

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
    const nextW = Math.max(minW, Math.min(maxW, startW + e.clientX - startX));
    const nextH = Math.max(minH, Math.min(maxH, startH + e.clientY - startY));
    win.style.width = `${nextW}px`;
    win.style.height = `${nextH}px`;
  });

  handle.addEventListener('pointerup', ()=>{
    resizing=false;
  });
}

function makeDraggableWindow(win, handle){
  let startX=0,startY=0,baseX=0,baseY=0,drag=false;
  handle.addEventListener('pointerdown', e=>{
    if(e.target.classList.contains('window-control')) return;
    if(win.classList.contains('fullscreen')) return;
    drag=true;startX=e.clientX;startY=e.clientY;baseX=win.offsetLeft;baseY=win.offsetTop;
    handle.setPointerCapture(e.pointerId);win.style.zIndex=++topZ;
  });
  handle.addEventListener('pointermove', e=>{
    if(!drag) return;
    win.style.left = `${Math.max(0, Math.min(window.innerWidth-120, baseX + e.clientX - startX))}px`;
    win.style.top = `${Math.max(0, Math.min(window.innerHeight-100, baseY + e.clientY - startY))}px`;
  });
  handle.addEventListener('pointerup', ()=>{
    if(!drag) return;drag=false;
    const grid=12;
    win.style.left = `${Math.max(0, Math.round(win.offsetLeft/grid)*grid)}px`;
    win.style.top = `${Math.max(0, Math.round(win.offsetTop/grid)*grid)}px`;
  });
}
async function openTextFile(item){
  const html = await fetchHTML(item.path);
  textWindowOffset = (textWindowOffset + 1) % 6;
  createWindow({title:item.label, html, kind:'text', x:150 + textWindowOffset*24, y:72 + textWindowOffset*18});
}
function openFolder(folder){
  const files = folder.files.map(file => `
    <button class="folder-file" data-file-path="${file.path}" data-file-title="${file.label}">
      <span>HTML</span><small>${file.label}</small>
    </button>`).join('');
  const html = `<div class="folder-grid">${files}</div>`;
  const win = createWindow({title:folder.label, html, kind:'folder-window', x:Math.round(window.innerWidth*.24), y:Math.round(window.innerHeight*.12)});
  win.querySelectorAll('[data-file-path]').forEach(btn=>{
    btn.addEventListener('dblclick', async ()=>{
      const html = await fetchHTML(btn.dataset.filePath);
      createWindow({title:btn.dataset.fileTitle, html, kind:'default', x:Math.round(window.innerWidth*.28), y:Math.round(window.innerHeight*.16)});
    });
    btn.addEventListener('click', ()=>{
      win.querySelectorAll('.folder-file').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}
