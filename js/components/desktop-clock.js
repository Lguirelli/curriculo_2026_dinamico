(function () {
  const COMPONENT_PATH = 'components/desktop-clock.html';

  function formatTime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    }).format(date);
  }

  function updateClock(root) {
    const now = new Date();
    const timeEl = root.querySelector('[data-desktop-clock-time]');
    const dateEl = root.querySelector('[data-desktop-clock-date]');

    if (timeEl) timeEl.textContent = formatTime(now);
    if (dateEl) dateEl.textContent = formatDate(now);
  }

  function fallbackMarkup() {
    return `
      <section class="desktop-clock-widget" data-desktop-clock-widget>
        <div class="desktop-clock-time" data-desktop-clock-time>00:00</div>
        <div class="desktop-clock-date" data-desktop-clock-date>quinta-feira, 28 de maio</div>
      </section>
    `;
  }

  async function loadDesktopClock() {
    const mount = document.getElementById('desktopClockMount');
    if (!mount) return;

    try {
      const response = await fetch(COMPONENT_PATH, { cache: 'no-cache' });
      if (!response.ok) throw new Error('Falha ao carregar componente de relógio');
      mount.innerHTML = await response.text();
    } catch (error) {
      mount.innerHTML = fallbackMarkup();
    }

    updateClock(mount);
    setInterval(() => updateClock(mount), 1000);
  }

  document.addEventListener('DOMContentLoaded', loadDesktopClock);
})();
