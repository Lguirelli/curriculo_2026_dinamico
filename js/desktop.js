const GRID = { leftX: 38, topY: 30, rightPad: 132, col: 106, row: 112 };
const LS_KEY = 'lorenzo_os_desktop_positions_v1';

function loadPositions(){
  try{return JSON.parse(localStorage.getItem(LS_KEY) || '{}')}catch{return {}}
}
function savePosition(id,x,y){
  const pos = loadPositions(); pos[id] = {x,y}; localStorage.setItem(LS_KEY, JSON.stringify(pos));
}
function snap(v,step){return Math.round(v/step)*step}
function clearSelection(){document.querySelectorAll('.desktop-icon.selected').forEach(i=>i.classList.remove('selected'))}

function renderDesktopIcons(){
  const wrap = document.getElementById('desktopIcons');
  const saved = loadPositions();
  wrap.innerHTML = '';

  const items = [
    ...OS_DATA.curriculum.map((it,i)=>({...it, group:'curriculo', defaultX:GRID.leftX, defaultY:GRID.topY + i*GRID.row})),
    ...OS_DATA.portfolio.map((it,i)=>({...it, group:'portfolio', defaultX:window.innerWidth - GRID.rightPad, defaultY:GRID.topY + i*GRID.row})),
    ...OS_DATA.games.map((it,i)=>({...it, group:'game', type:'game', defaultX:window.innerWidth - GRID.rightPad, defaultY:GRID.topY + (OS_DATA.portfolio.length+i)*GRID.row}))
  ];

  items.forEach(item=>{
    const icon = document.createElement('button');
    icon.className = `desktop-icon ${item.type === 'folder' ? 'folder' : ''} ${item.type === 'game' ? 'game' : ''}`;
    icon.dataset.id = item.id;
    icon.dataset.type = item.type;
    const pos = saved[item.id] || { x: item.defaultX, y: item.defaultY };
    icon.style.left = `${snap(pos.x, GRID.col)}px`;
    icon.style.top = `${snap(pos.y, GRID.row)}px`;
    icon.innerHTML = `<span class="icon-glyph">${item.type === 'txt' ? 'TXT' : item.type === 'game' ? 'GAME' : 'DIR'}</span><span>${item.label}</span>`;
    wrap.appendChild(icon);
    makeDesktopIconInteractive(icon, item);
  });
}

function makeDesktopIconInteractive(icon,item){
  let startX=0,startY=0,baseX=0,baseY=0,drag=false,moved=false;
  icon.addEventListener('pointerdown', e=>{
    drag=true; moved=false; startX=e.clientX; startY=e.clientY; baseX=icon.offsetLeft; baseY=icon.offsetTop;
    icon.setPointerCapture(e.pointerId); clearSelection(); icon.classList.add('selected'); icon.classList.add('dragging');
  });
  icon.addEventListener('pointermove', e=>{
    if(!drag) return;
    const dx=e.clientX-startX, dy=e.clientY-startY;
    if(Math.abs(dx)>3 || Math.abs(dy)>3) moved=true;
    icon.style.left = `${Math.max(0, Math.min(window.innerWidth-100, baseX+dx))}px`;
    icon.style.top = `${Math.max(0, Math.min(window.innerHeight-150, baseY+dy))}px`;
  });
  icon.addEventListener('pointerup', ()=>{
    if(!drag) return; drag=false; icon.classList.remove('dragging');
    const x=snap(icon.offsetLeft, GRID.col), y=snap(icon.offsetTop, GRID.row);
    icon.style.left=`${x}px`; icon.style.top=`${y}px`; savePosition(item.id,x,y);
  });
  icon.addEventListener('click', e=>{ e.stopPropagation(); clearSelection(); icon.classList.add('selected') });
  icon.addEventListener('dblclick', e=>{
    e.stopPropagation();
    if(item.type === 'txt') openTextFile(item);
    if(item.type === 'folder') openFolder(item);
    if(item.type === 'game') openGameWindow(item.id, item.label);
  });
}

function setupStartMenu(){
  const btn=document.getElementById('startButton'), menu=document.getElementById('startMenu');
  btn.addEventListener('click', e=>{e.stopPropagation(); menu.classList.toggle('open')});
  menu.addEventListener('click', e=>e.stopPropagation());
  document.addEventListener('click', ()=>{ menu.classList.remove('open'); clearSelection(); });
  menu.querySelectorAll('[data-open-folder]').forEach(b=>b.addEventListener('click',()=>{
    const folder=OS_DATA.portfolio.find(f=>f.id===b.dataset.openFolder); if(folder) openFolder(folder); menu.classList.remove('open');
  }));
  menu.querySelectorAll('[data-open-game]').forEach(b=>b.addEventListener('click',()=>{
    openGameWindow(b.dataset.openGame, b.textContent.trim()); menu.classList.remove('open');
  }));
}

function initDesktop(){ renderDesktopIcons(); setupStartMenu(); window.addEventListener('resize',()=>renderDesktopIcons()); }
