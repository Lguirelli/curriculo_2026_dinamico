function openGameWindow(id,label){
  const html = `<div class="game-box"><div class="game-screen" id="game-${id}">${label}</div><div class="game-actions"><button>Iniciar</button><button>Reset</button></div><p>Placeholder funcional para o jogo ${label}. Estrutura pronta para substituir pela lógica completa.</p></div>`;
  createWindow({title:label, html, kind:'game', x:window.innerWidth*.3, y:window.innerHeight*.16});
}
