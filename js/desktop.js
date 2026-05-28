const GRID = { leftX: 24, rightX: 0, topY: 44, col: 96, row: 102 };
const LS_KEY = 'lorenzo_os_desktop_positions_v5';

function loadPositions(){
  try{return JSON.parse(localStorage.getItem(LS_KEY) || '{}')}catch{return {}}
}
function savePosition(id,x,y){
  const pos = loadPositions();
  pos[id] = {x,y};
  localStorage.setItem(LS_KEY, JSON.stringify(pos));
}
function snapToGrid(x,y,side='left'){
  const originX = side === 'right' ? getRightGridX() : GRID.leftX;
  const originY = GRID.topY;
  const snappedX = originX + Math.round((x - originX) / GRID.col) * GRID.col;
  const snappedY = originY + Math.round((y - originY) / GRID.row) * GRID.row;
  return {
    x: Math.max(0, Math.min(window.innerWidth - 94, snappedX)),
    y: Math.max(GRID.topY, Math.min(window.innerHeight - 132, snappedY))
  };
}
function getRightGridX(){
  return Math.max(GRID.leftX, window.innerWidth - 112);
}
function clearSelection(){
  document.querySelectorAll('.desktop-icon.selected').forEach(i=>i.classList.remove('selected'));
}
function getInitialItems(){
  const rightX = getRightGridX();
  return [
    ...OS_DATA.curriculum.map((it,i)=>({...it, group:'curriculo', side:'left', defaultX:GRID.leftX, defaultY:GRID.topY + i*GRID.row})),
    ...OS_DATA.portfolio.map((it,i)=>({...it, group:'portfolio', side:'right', defaultX:rightX, defaultY:GRID.topY + i*GRID.row})),
    ...OS_DATA.games.map((it,i)=>({...it, group:'game', type:'game', side:'right', defaultX:rightX, defaultY:GRID.topY + (OS_DATA.portfolio.length+i)*GRID.row}))
  ];
}
function renderDesktopIcons(){
  const wrap = document.getElementById('desktopIcons');
  const saved = loadPositions();
  wrap.innerHTML = '';

  getInitialItems().forEach(item=>{
    const icon = document.createElement('button');
    icon.className = `desktop-icon ${item.type === 'folder' ? 'folder' : ''} ${item.type === 'game' ? 'game' : ''}`;
    icon.dataset.id = item.id;
    icon.dataset.type = item.type;
    icon.dataset.side = item.side;
    const pos = saved[item.id] || { x: item.defaultX, y: item.defaultY };
    const snapped = snapToGrid(pos.x, pos.y, item.side);
    icon.style.left = `${snapped.x}px`;
    icon.style.top = `${snapped.y}px`;
    icon.innerHTML = `<span class="icon-glyph">${item.type === 'txt' ? 'TXT' : item.type === 'game' ? 'GAME' : 'DIR'}</span><span>${item.label}</span>`;
    wrap.appendChild(icon);
    makeDesktopIconInteractive(icon, item);
  });
}
function makeDesktopIconInteractive(icon,item){
  let startX=0,startY=0,baseX=0,baseY=0,drag=false,moved=false;
  icon.addEventListener('pointerdown', e=>{
    drag=true;moved=false;startX=e.clientX;startY=e.clientY;baseX=icon.offsetLeft;baseY=icon.offsetTop;
    icon.setPointerCapture(e.pointerId);clearSelection();icon.classList.add('selected','dragging');
  });
  icon.addEventListener('pointermove', e=>{
    if(!drag) return;
    const dx=e.clientX-startX,dy=e.clientY-startY;
    if(Math.abs(dx)>3 || Math.abs(dy)>3) moved=true;
    icon.style.left = `${Math.max(0, Math.min(window.innerWidth-94, baseX+dx))}px`;
    icon.style.top = `${Math.max(GRID.topY, Math.min(window.innerHeight-132, baseY+dy))}px`;
  });
  icon.addEventListener('pointerup', ()=>{
    if(!drag) return;
    drag=false;icon.classList.remove('dragging');
    const p=snapToGrid(icon.offsetLeft,icon.offsetTop,item.side);
    icon.style.left=`${p.x}px`;icon.style.top=`${p.y}px`;savePosition(item.id,p.x,p.y);
  });
  icon.addEventListener('click', e=>{e.stopPropagation();clearSelection();icon.classList.add('selected')});
  icon.addEventListener('dblclick', e=>{
    e.stopPropagation();
    if(moved) return;
    if(item.type === 'txt') openTextFile(item);
    if(item.type === 'folder') openFolder(item);
    if(item.type === 'game') openGameWindow(item.id,item.label);
  });
}
function setupStartMenu(){
  const btn=document.getElementById('startButton'), menu=document.getElementById('startMenu');
  btn.addEventListener('click', e=>{e.stopPropagation();menu.classList.toggle('open')});
  menu.addEventListener('click', e=>e.stopPropagation());
  document.addEventListener('click', ()=>{menu.classList.remove('open');clearSelection();});
  menu.querySelectorAll('[data-open-folder]').forEach(b=>b.addEventListener('click',()=>{
    const folder=OS_DATA.portfolio.find(f=>f.id===b.dataset.openFolder);if(folder) openFolder(folder);menu.classList.remove('open');
  }));
  menu.querySelectorAll('[data-open-game]').forEach(b=>b.addEventListener('click',()=>{
    openGameWindow(b.dataset.openGame,b.querySelector('small')?.textContent.trim() || b.textContent.trim());menu.classList.remove('open');
  }));
}
function updateDesktopClock(){
  const el=document.getElementById('topPanelClock');
  if(!el) return;
  const now=new Date();
  const date=now.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short'}).replace('.', '');
  const time=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  el.textContent=`${date} ${time}`;
}
function initDesktop(){
  renderDesktopIcons();setupStartMenu();updateDesktopClock();setInterval(updateDesktopClock,1000);
  window.addEventListener('resize',()=>renderDesktopIcons());
}
