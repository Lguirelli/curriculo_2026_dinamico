const pages = () => ({home:document.getElementById('mobileHome'), app:document.getElementById('mobileAppView')});
function showMobileHome(){ const p=pages(); p.home.classList.add('active'); p.app.classList.remove('active'); }
function showMobileApp(title,html){ const p=pages(); document.getElementById('mobileAppTitle').textContent=title; document.getElementById('mobileAppContent').innerHTML=html; p.home.classList.remove('active'); p.app.classList.add('active'); }
async function loadMobileFile(title,path){ const html=await fetchHTML(path); showMobileApp(title, `<div class="mobile-content-card">${html}</div>`); }
function initMobile(){
  document.querySelectorAll('[data-mobile-open]').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.mobileOpen;
    if(id==='notes'){
      showMobileApp('Notas', `<div class="note-list">${OS_DATA.curriculum.map(n=>`<button class="note-item" data-note="${n.path}" data-title="${n.label}">${n.label}</button>`).join('')}</div>`);
      document.querySelectorAll('[data-note]').forEach(n=>n.addEventListener('click',()=>loadMobileFile(n.dataset.title,n.dataset.note)));
      return;
    }
    if(id==='games'){
      showMobileApp('Jogos', `<div class="mobile-file-list mobile-game-list">${OS_DATA.games.map(g=>`<button class="mobile-file-item mobile-game-item" data-mobile-game="${g.id}" data-title="${g.label}"><span class="mobile-game-thumb" style="background-image:url('${g.icon || ''}')"></span><span>${g.label}</span></button>`).join('')}</div>`);
      document.querySelectorAll('[data-mobile-game]').forEach(g=>g.addEventListener('click',()=>openMobileGame(g.dataset.mobileGame,g.dataset.title)));
      return;
    }
    const folder=OS_DATA.portfolio.find(f=>f.id===id);
    if(folder){
      showMobileApp(folder.label, `<div class="mobile-file-list">${folder.files.map(f=>`<button class="mobile-file-item" data-mfile="${f.path || ''}" data-project-path="${f.projectPath || ''}" data-title="${f.label}">${f.label}</button>`).join('')}</div>`);
      document.querySelectorAll('[data-mfile]').forEach(f=>f.addEventListener('click',()=>{
        const projectPath = f.dataset.projectPath;
        if(projectPath){
          showMobileApp(f.dataset.title, `<iframe class="mobile-project-frame" src="${projectPath}" title="${f.dataset.title}"></iframe>`);
        }else{
          loadMobileFile(f.dataset.title,f.dataset.mfile);
        }
      }));
    }
  }));
  document.getElementById('mobileHomeBtn').addEventListener('click',showMobileHome);
  document.getElementById('mobileBack').addEventListener('click',showMobileHome);
  document.getElementById('mobileBackTop').addEventListener('click',showMobileHome);
  document.getElementById('mobileScreens').addEventListener('click',()=>showMobileApp('Telas abertas','<div class="mobile-content-card">Nenhuma tela fixa. Use os apps para navegar.</div>'));
}
