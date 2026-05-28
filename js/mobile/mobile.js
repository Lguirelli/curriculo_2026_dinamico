(function(){
  const stack = [];
  function screen(){ return document.getElementById('mobileScreen'); }
  async function fetchHtml(path){ const r=await fetch(path); return r.text(); }
  function push(render){ stack.push(render); render(); }
  function home(){
    const s=screen(); if(!s) return;
    s.innerHTML = `<div class="mobile-home"><div class="mobile-clock-widget"><div class="big" data-live-clock>--:--</div><div class="small">LORENZO OS</div></div><div class="mobile-app-grid">${OS_DATA.mobileApps.map(app=>`<button class="mobile-app" data-id="${app.id}"><span class="mobile-app-icon">${app.icon}</span><span>${app.title}</span></button>`).join('')}</div></div>`;
    OSClock.update();
    s.querySelectorAll('.mobile-app').forEach(btn=>btn.addEventListener('click',()=>openApp(btn.dataset.id)));
  }
  function panel(title, inner){
    screen().innerHTML = `<section class="mobile-panel"><header class="mobile-panel-head"><button class="mobile-back" type="button">‹</button><span>${title}</span></header>${inner}</section>`;
    screen().querySelector('.mobile-back').addEventListener('click',back);
  }
  function notes(){
    panel('Notas', `<div class="mobile-list">${OS_DATA.resume.map(i=>`<button class="mobile-list-item" data-path="${i.path}" data-title="${i.title}">${i.title}</button>`).join('')}</div>`);
    screen().querySelectorAll('[data-path]').forEach(b=>b.addEventListener('click',()=>openNote(b.dataset.title,b.dataset.path)));
  }
  async function openNote(title,path){
    const html = await fetchHtml(path);
    panel(title, `<article class="mobile-note">${html}</article>`);
  }
  function folder(folderId){
    const item = OS_DATA.portfolio.find(i=>i.id===folderId);
    panel(item.title, `<div class="mobile-list">${item.files.map(f=>`<button class="mobile-list-item" data-path="${f.path}" data-title="${f.title}">${f.title}</button>`).join('')}</div>`);
    screen().querySelectorAll('[data-path]').forEach(b=>b.addEventListener('click',()=>openNote(b.dataset.title,b.dataset.path)));
  }
  function games(){
    panel('Jogos', `<div class="mobile-list">${OS_DATA.games.map(g=>`<button class="mobile-list-item" data-game="${g.id}">${g.title}</button>`).join('')}</div>`);
    screen().querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',()=>mobileGame(b.dataset.game)));
  }
  function mobileGame(id){
    const g=OS_DATA.games.find(x=>x.id===id);
    panel(g.title, `<div class="game-host"></div>`);
    const host=screen().querySelector('.game-host');
    if(g.game==='snake') SnakeGame(host); if(g.game==='mines') MinesGame(host); if(g.game==='pong') PongGame(host);
  }
  function tasks(){
    screen().innerHTML = `<div class="tasks-view"><div class="task-card"><b>Home</b><p>Tela inicial</p></div><div class="task-card"><b>Notas</b><p>Currículo em blocos de nota.</p></div><div class="task-card"><b>Apps</b><p>Portfólio e jogos.</p></div></div>`;
  }
  function openApp(id){
    const app=OS_DATA.mobileApps.find(a=>a.id===id);
    if(app.url) return window.open(app.url,'_blank');
    if(app.path) return push(()=>openNote(app.title,app.path));
    if(app.screen==='notes') return push(notes);
    if(app.screen==='games') return push(games);
    if(app.folder) return push(()=>folder(app.folder));
  }
  function back(){ if(stack.length>1){ stack.pop(); stack[stack.length-1](); } else home(); }
  function initMobile(){
    stack.length=0; stack.push(home); home();
    document.getElementById('mobileHome')?.addEventListener('click',()=>{stack.length=0;stack.push(home);home();});
    document.getElementById('mobileBack')?.addEventListener('click',back);
    document.getElementById('mobileTasks')?.addEventListener('click',()=>push(tasks));
  }
  window.OSMobile = { initMobile };
})();
