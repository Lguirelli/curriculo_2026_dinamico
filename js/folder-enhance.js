
function enhanceFolders(){
  const icons = document.querySelectorAll('.desktop-icon.folder');
  icons.forEach(icon => {
    if(icon.dataset.enhanced) return;

    const label = icon.querySelector('.desktop-icon-label');
    const text = label ? label.textContent : '';

    const papers = [text, '', ''];

    icon.innerHTML = `
      <div class="react-folder">
        <div class="folder__back">
          ${papers.map((t,i)=>`<div class="paper paper-${i+1}">${t||''}</div>`).join('')}
          <div class="folder__front"></div>
        </div>
      </div>
      <div class="desktop-icon-label">${text}</div>
    `;

    const folder = icon.querySelector('.react-folder');
    folder.addEventListener('click', () => {
      folder.classList.toggle('open');
    });

    icon.dataset.enhanced = "true";
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(enhanceFolders, 300);
});
