(function(){
  let z = 50;
  function layer(){ return document.getElementById('windowLayer'); }
  async function readHtml(path){
    const res = await fetch(path);
    if(!res.ok) throw new Error('Não foi possível carregar ' + path);
    return await res.text();
  }
  function createWindow({title='Janela', html='', fullscreen=true, onMount=null}){
    const el = document.createElement('article');
    el.className = 'os-window' + (fullscreen ? ' fullscreen' : '');
    el.style.zIndex = ++z;
    el.innerHTML = `<header class="window-head"><strong class="window-title">${title}</strong><div class="window-controls"><button class="win-btn min" title="Minimizar"></button><button class="win-btn max" title="Tela cheia"></button><button class="win-btn close" title="Fechar"></button></div></header><section class="window-body">${html}</section>`;
    layer().appendChild(el);
    makeDraggable(el, el.querySelector('.window-head'));
    el.addEventListener('pointerdown',()=>{el.style.zIndex=++z;});
    el.querySelector('.close').addEventListener('click',()=>el.remove());
    el.querySelector('.min').addEventListener('click',()=>{el.style.display='none'; setTimeout(()=>{el.style.display='flex'; el.style.zIndex=++z;},180);});
    el.querySelector('.max').addEventListener('click',()=>el.classList.toggle('fullscreen'));
    if(onMount) onMount(el.querySelector('.window-body'), el);
    return el;
  }
  function makeDraggable(el, handle){
    let sx=0,sy=0,ox=0,oy=0,drag=false;
    handle.addEventListener('pointerdown', e=>{
      if(el.classList.contains('fullscreen')) return;
      drag=true; sx=e.clientX; sy=e.clientY; const r=el.getBoundingClientRect(); ox=r.left; oy=r.top; handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', e=>{
      if(!drag) return; el.style.left = ox + e.clientX - sx + 'px'; el.style.top = oy + e.clientY - sy + 'px'; el.style.transform='none';
    });
    handle.addEventListener('pointerup', e=>{ drag=false; try{handle.releasePointerCapture(e.pointerId)}catch(_){} });
  }
  async function openHtmlWindow(title, path){
    try{ createWindow({title, html:`<div class="content-file">${await readHtml(path)}</div>`}); }
    catch(err){ createWindow({title:'Erro', html:`<p>${err.message}</p>`}); }
  }
  function openFolderWindow(title, files){
    const html = `<div class="folder-view">${files.map(f=>`<button class="folder-item" data-path="${f.path}" data-title="${f.title}"><span class="mini-icon">HTML</span><span>${f.title}</span></button>`).join('')}</div>`;
    createWindow({title, html, onMount:(body)=>{
      body.querySelectorAll('[data-path]').forEach(btn => btn.addEventListener('dblclick',()=>openHtmlWindow(btn.dataset.title, btn.dataset.path)));
    }});
  }
  function openGameWindow(game){
    createWindow({title:game.title, html:`<div class="game-host" id="game-${game.id}"></div>`, onMount:(body)=>{
      const host = body.querySelector('.game-host');
      if(game.game === 'snake') window.SnakeGame(host);
      if(game.game === 'mines') window.MinesGame(host);
      if(game.game === 'pong') window.PongGame(host);
    }});
  }
  window.OSWindows = { createWindow, openHtmlWindow, openFolderWindow, openGameWindow };
})();
