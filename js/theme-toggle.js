(function(){
  const STORAGE_KEY = 'lorenzo-os-crt-theme-enabled';
  const ROOT = document.documentElement;

  function isEnabled(){
    return localStorage.getItem(STORAGE_KEY) === '1';
  }

  function applyTheme(enabled){
    ROOT.classList.toggle('crt-theme', enabled);
    document.body?.classList.toggle('crt-theme', enabled);

    const switchEl = document.querySelector('[data-crt-theme-switch]');
    if(switchEl){
      switchEl.setAttribute('aria-checked', String(enabled));
      switchEl.classList.toggle('is-active', enabled);

      const label = switchEl.querySelector('.crt-theme-switch__label');
      if(label) label.textContent = enabled ? 'ON' : 'CRT';
    }
  }

  function setTheme(enabled){
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    applyTheme(enabled);
  }

  function createSwitch(){
    let switchEl = document.querySelector('[data-crt-theme-switch]');

    if(!switchEl){
      switchEl = document.createElement('button');
      switchEl.type = 'button';
      switchEl.className = 'crt-theme-switch';
      switchEl.dataset.crtThemeSwitch = 'true';
      switchEl.setAttribute('role', 'switch');
      switchEl.setAttribute('aria-label', 'Alternar tema CRT retrô');
      switchEl.setAttribute('aria-checked', 'false');
      switchEl.innerHTML = `
        <span class="crt-theme-switch__track" aria-hidden="true"></span>
        <span class="crt-theme-switch__knob" aria-hidden="true"></span>
        <span class="crt-theme-switch__label" aria-hidden="true">CRT</span>
      `;
      document.body.appendChild(switchEl);
    }

    switchEl.addEventListener('click', () => {
      setTheme(!ROOT.classList.contains('crt-theme'));
    });

    applyTheme(isEnabled());
  }

  applyTheme(isEnabled());

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', createSwitch);
  }else{
    createSwitch();
  }

  window.toggleCRTTheme = function(){
    setTheme(!ROOT.classList.contains('crt-theme'));
  };
})();
