(function(){
  const STORAGE_KEY = 'lorenzo-os-theme-crt';

  function applyTheme(enabled){
    document.documentElement.classList.toggle('crt-theme', enabled);
    const toggle = document.querySelector('[data-crt-theme-toggle]');
    if(toggle){
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.textContent = enabled ? 'CRT ON' : 'CRT';
      toggle.title = enabled ? 'Desativar tema CRT' : 'Ativar tema CRT';
    }
  }

  function getSaved(){
    return localStorage.getItem(STORAGE_KEY) === '1';
  }

  function setSaved(enabled){
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
  }

  function createToggle(){
    if(document.querySelector('[data-crt-theme-toggle]')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'crt-theme-toggle';
    button.dataset.crtThemeToggle = 'true';
    button.setAttribute('aria-label', 'Alternar tema CRT retrô');
    button.setAttribute('aria-pressed', 'false');
    button.textContent = 'CRT';

    button.addEventListener('click', () => {
      const enabled = !document.documentElement.classList.contains('crt-theme');
      setSaved(enabled);
      applyTheme(enabled);
    });

    document.body.appendChild(button);
    applyTheme(getSaved());
  }

  applyTheme(getSaved());

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', createToggle);
  }else{
    createToggle();
  }
})();
