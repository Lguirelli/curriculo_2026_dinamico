(() => {
  const card = document.querySelector('.business-card');
  if (!card) return;
  card.addEventListener('pointerenter', () => card.classList.add('is-hovered'));
  card.addEventListener('pointerleave', () => card.classList.remove('is-hovered'));
})();
