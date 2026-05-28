(function(){
  const GRID_X = 104, GRID_Y = 112, START_X = 22, START_Y = 48;
  const stateKey = 'lorenzo-os-desktop-layout-v1';
  const saved = JSON.parse(localStorage.getItem(stateKey) || '{}');
  function snap(v, g){ return Math.round(v / g) * g; }
  function save(){
    const layout = {};
    document.querySelectorAll('.desktop-icon').forEach(el=>layout[el.dataset.id]={left:parseFloat(el.style.left), top:parseFloat(el.style.top)});
    localStorage.setItem(stateKey, JSON.stringify(layout));
  }
  function iconTemplate(item, iconType){
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.dataset.id = item.id;
    el.innerHTML = `<div class="icon-art ${iconType}">${iconType === 'folder' ? '' : iconType === 'game' ? '▶' : 'TXT'}</div><span>${item.title}</span>`;
    return el;
  }
  function setInitial(el, index, side='left'){
    const area = document.getElementById('desktopArea');
    const x = side === 'right' ? Math.max(START_X, area.clientWidth - 130) : START_X;
    const y = START_Y + index * GRID_Y;
    const pos = saved[el.dataset.id] || {left:x, top:y};
    el.style.left = pos.left + 'px'; el.style.top = pos.top + 'px';
  }
  function makeIconDraggable(el, openFn){
    let drag=false, sx=0, sy=0, ox=0, oy=0, moved=false;
    el.addEventListener('pointerdown', e=>{
      document.querySelectorAll('.desktop-icon.selected').forEach(i=>i.classList.remove('selected'));
      el.classList.add('selected'); drag=true; moved=false; sx=e.clientX; sy=e.clientY; ox=parseFloat(el.style.left)||0; oy=parseFloat(el.style.top)||0; el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', e=>{
      if(!drag) return; const dx=e.clientX-sx, dy=e.clientY-sy; if(Math.abs(dx)+Math.abs(dy)>4) moved=true; el.style.left=ox+dx+'px'; el.style.top=oy+dy+'px';
    });
    el.addEventListener('pointerup', e=>{
      if(!drag) return; drag=false; try{el.releasePointerCapture(e.pointerId)}catch(_){};
      const area = document.getElementById('desktopArea');
      const maxX = area.clientWidth - 110, maxY = area.clientHeight - 170;
      let x = Math.max(0, Math.min(maxX, snap(parseFloat(el.style.left), GRID_X)));
      let y = Math.max(34, Math.min(maxY, snap(parseFloat(el.style.top), GRID_Y)));
      el.style.left=x+'px'; el.style.top=y+'px'; save();
    });
    el.addEventListener('dblclick', e=>{ e.preventDefault(); openFn(); });
  }
  function renderDesktop(){
    const root = document.getElementById('desktopIcons'); if(!root) return;
    root.innerHTML = '';
    OS_DATA.resume.forEach((item,i)=>{
      const el=iconTemplate(item,'file'); setInitial(el,i,'left'); makeIconDraggable(el,()=>OSWindows.openHtmlWindow(item.title,item.path)); root.appendChild(el);
    });
    OS_DATA.portfolio.forEach((item,i)=>{
      const el=iconTemplate(item,'folder'); setInitial(el,i,'right'); makeIconDraggable(el,()=>OSWindows.openFolderWindow(item.title,item.files)); root.appendChild(el);
    });
    OS_DATA.games.forEach((item,i)=>{
      const el=iconTemplate(item,'game'); setInitial(el,OS_DATA.portfolio.length+i,'right'); makeIconDraggable(el,()=>OSWindows.openGameWindow(item)); root.appendChild(el);
    });
    document.addEventListener('pointerdown', e=>{ if(!e.target.closest('.desktop-icon')) document.querySelectorAll('.desktop-icon.selected').forEach(i=>i.classList.remove('selected')); });
  }
  function renderMenu(){
    const grid = document.getElementById('appMenuGrid'); if(!grid) return;
    grid.innerHTML = '';
    [...OS_DATA.portfolio, ...OS_DATA.games].forEach(item=>{
      const b=document.createElement('button'); b.className='menu-app'; b.innerHTML=`<div class="icon-art ${item.files?'folder':'game'}">${item.files?'':'▶'}</div><span>${item.title}</span>`;
      b.addEventListener('click',()=>{ if(item.files) OSWindows.openFolderWindow(item.title,item.files); else OSWindows.openGameWindow(item); document.getElementById('appMenu').classList.remove('open'); });
      grid.appendChild(b);
    });
  }
  window.OSDesktop = { renderDesktop, renderMenu };
})();
