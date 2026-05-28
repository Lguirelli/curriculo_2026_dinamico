(function () {
  const selector = [
    '.icon-glyph',
    '.desktop-code-folder',
    '.folder-file',
    '.dock-icon',
    '.start-menu-grid button',
    '.mobile-app span'
  ].join(',');

  function bindGlassHover(element) {
    if (!element || element.dataset.glassHoverBound === 'true') return;
    element.dataset.glassHoverBound = 'true';

    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      element.style.setProperty('--mouse-x', `${x}%`);
      element.style.setProperty('--mouse-y', `${y}%`);
    });

    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--mouse-x', '50%');
      element.style.setProperty('--mouse-y', '50%');
    });
  }

  function scanGlassHoverItems(root = document) {
    root.querySelectorAll(selector).forEach(bindGlassHover);
  }

  document.addEventListener('DOMContentLoaded', () => {
    scanGlassHoverItems();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.(selector)) bindGlassHover(node);
          scanGlassHoverItems(node);
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();
