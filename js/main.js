function updateClock(){
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const text = `${hh}:${mm}`;
  const desk=document.getElementById('systemClock'); if(desk) desk.textContent=text;
  const mob=document.getElementById('mobileClock'); if(mob) mob.textContent=text;
}
updateClock(); setInterval(updateClock,1000);
window.addEventListener('DOMContentLoaded',()=>{ initDesktop(); initMobile(); });
