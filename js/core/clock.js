(function(){
  const pad = n => String(n).padStart(2,'0');
  const months = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
  const days = ['DOM','SEG','TER','QUA','QUI','SEX','SAB'];
  function update(){
    const now = new Date();
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const top = document.getElementById('topbarClock');
    const mob = document.getElementById('mobileClock');
    const dh = document.getElementById('desktopHeroHour');
    const dm = document.getElementById('desktopHeroMinute');
    const dd = document.getElementById('desktopHeroDate');
    if(top) top.textContent = `${days[now.getDay()]}, ${pad(now.getDate())} ${months[now.getMonth()]} ${h}:${m}`;
    if(mob) mob.textContent = `${h}:${m}`;
    if(dh) dh.textContent = h;
    if(dm) dm.textContent = m;
    if(dd) dd.textContent = `${pad(now.getDate())} · ${months[now.getMonth()]} · ${days[now.getDay()]}`;
    document.querySelectorAll('[data-live-clock]').forEach(el => el.textContent = `${h}:${m}`);
  }
  window.OSClock = { update };
  update(); setInterval(update, 1000);
})();
