document.addEventListener('DOMContentLoaded',()=>{
  OSDesktop.renderDesktop();
  OSDesktop.renderMenu();
  OSMobile.initMobile();
  const appMenu=document.getElementById('appMenu');
  document.getElementById('appMenuBtn')?.addEventListener('click',()=>appMenu.classList.toggle('open'));
  document.addEventListener('pointerdown',e=>{ if(!e.target.closest('#appMenu')&&!e.target.closest('#appMenuBtn')) appMenu?.classList.remove('open'); });
  document.querySelector('[data-open-contact]')?.addEventListener('click',()=>OSWindows.openHtmlWindow('Contato.txt','content/curriculo/contato.html'));
});
