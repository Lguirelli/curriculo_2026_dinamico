let topZ = 10;
const windowsLayer = () => document.getElementById('windowsLayer');

async function fetchHTML(path){
  try{
    const res = await fetch(path);
    if(!res.ok) throw new Error('Arquivo não encontrado');
    return await res.text();
  }catch(err){
    return `<h2>Placeholder</h2><p>Conteúdo não carregado: ${path}</p>`;
  }
}

function createWindow({title, html, kind='default', x=null, y=null}){
  const layer = windowsLayer();
  const win = document.createElement('article');
  win.className = `os-window ${kind === 'text' ? 'text-window' : ''}`;
  win.style.zIndex = ++topZ;
  if(x !== null) win.style.left = `${x}px`;
  if(y !== null) win.style.top = `${y}px`;
  win.innerHTML = `
    <header class="window-header">
      <button class="window-control window-close" title="Fechar"></button>
      <button class="window-control window-full" title="Tela cheia"></button>
      <button class="window-control window-min" title="Minimizar"></button>
      <strong class="window-title">${title}</strong>
    </header>
    <div class="window-body">${html}</div>
  `;
  layer.appendChild(win);
  win.addEventListener('pointerdown',()=> win.style.zIndex = ++topZ);
  win.querySelector('.window-close').addEventListener('click',(e)=>{ e.stopPropagation(); win.remove(); });
  win.querySelector('.window-full').addEventListener('click',(e)=>{ e.stopPropagation(); win.classList.toggle('fullscreen'); });
  win.querySelector('.window-min').addEventListener('click',(e)=>{ e.stopPropagation(); win.style.display='none'; setTimeout(()=> win.style.display='flex', 600); });
  makeDraggableWindow(win, win.querySelector('.window-header'));
  return win;
}

function makeDraggableWindow(win, handle){
  let startX=0,startY=0,baseX=0,baseY=0,drag=false;
  handle.addEventListener('pointerdown', e=>{
    if(e.target.classList.contains('window-control')) return;
    if(win.classList.contains('fullscreen')) return;
    drag=true; startX=e.clientX; startY=e.clientY; baseX=win.offsetLeft; baseY=win.offsetTop;
    handle.setPointerCapture(e.pointerId); win.style.zIndex=++topZ;
  });
  handle.addEventListener('pointermove', e=>{
    if(!drag) return;
    win.style.left = `${baseX + e.clientX - startX}px`;
    win.style.top = `${baseY + e.clientY - startY}px`;
  });
  handle.addEventListener('pointerup', e=>{
    if(!drag) return; drag=false;
    const grid=12;
    win.style.left = `${Math.max(0, Math.round(win.offsetLeft/grid)*grid)}px`;
    win.style.top = `${Math.max(0, Math.round(win.offsetTop/grid)*grid)}px`;
  });
}

async function openTextFile(item){
  const html = await fetchHTML(item.path);
  createWindow({title:item.label, html, kind:'text'});
}

function openFolder(folder){
  const files = folder.files.map(file => `
    <button class="folder-file" data-file-path="${file.path}" data-file-title="${file.label}">
      <span>HTML</span><small>${file.label}</small>
    </button>`).join('');
  const html = `<div class="folder-grid">${files}</div>`;
  const win = createWindow({title:folder.label, html, kind:'folder', x:window.innerWidth*.24, y:window.innerHeight*.12});
  win.querySelectorAll('[data-file-path]').forEach(btn=>{
    btn.addEventListener('dblclick', async ()=>{
      const html = await fetchHTML(btn.dataset.filePath);
      createWindow({title:btn.dataset.fileTitle, html, kind:'default', x:window.innerWidth*.28, y:window.innerHeight*.16});
    });
    btn.addEventListener('click', ()=>{
      win.querySelectorAll('.folder-file').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}
