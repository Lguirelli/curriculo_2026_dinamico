window.SnakeGame=function(host){
  host.innerHTML=`<div class="game-card"><h2>Snake</h2><canvas class="game-canvas" width="360" height="360"></canvas><div class="game-actions"><button>Reiniciar</button></div><p class="muted">Use as setas do teclado.</p></div>`;
  const c=host.querySelector('canvas'),ctx=c.getContext('2d'),restart=host.querySelector('button');let snake,food,dir,timer;
  function reset(){snake=[{x:9,y:9}];food={x:14,y:14};dir={x:1,y:0};clearInterval(timer);timer=setInterval(tick,120)}
  function tick(){const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y}; if(h.x<0||h.y<0||h.x>=20||h.y>=20||snake.some(p=>p.x===h.x&&p.y===h.y)) return reset(); snake.unshift(h); if(h.x===food.x&&h.y===food.y) food={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*20)}; else snake.pop(); draw()}
  function draw(){ctx.fillStyle='#0b111a';ctx.fillRect(0,0,360,360);ctx.fillStyle='#f0c978';snake.forEach(p=>ctx.fillRect(p.x*18+2,p.y*18+2,14,14));ctx.fillStyle='#96d5ff';ctx.fillRect(food.x*18+3,food.y*18+3,12,12)}
  window.addEventListener('keydown',e=>{if(e.key==='ArrowUp')dir={x:0,y:-1};if(e.key==='ArrowDown')dir={x:0,y:1};if(e.key==='ArrowLeft')dir={x:-1,y:0};if(e.key==='ArrowRight')dir={x:1,y:0};});restart.onclick=reset;reset();
}
