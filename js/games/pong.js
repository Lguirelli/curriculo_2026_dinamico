window.PongGame=function(host){
  host.innerHTML=`<div class="game-card"><h2>Pong</h2><div class="pong-area"><i class="pong-ball"></i><i class="pong-paddle" data-left></i><i class="pong-paddle" data-right></i></div><p class="muted">W/S movem a raquete esquerda.</p></div>`;
  const area=host.querySelector('.pong-area'),ball=host.querySelector('.pong-ball'),L=host.querySelector('[data-left]'),R=host.querySelector('[data-right]');let x=120,y=70,vx=3,vy=2,ly=120,ry=120;
  function draw(){x+=vx;y+=vy;if(y<0||y>306)vy*=-1;if(x<18&&y>ly&&y<ly+76)vx*=-1;if(x>590&&y>ry&&y<ry+76)vx*=-1;if(x<0||x>620){x=300;y=160}ry+=(y-ry-38)*.06;ball.style.left=x+'px';ball.style.top=y+'px';L.style.left='16px';L.style.top=ly+'px';R.style.right='16px';R.style.top=ry+'px';requestAnimationFrame(draw)}
  window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='w')ly=Math.max(0,ly-24);if(e.key.toLowerCase()==='s')ly=Math.min(244,ly+24)});draw();
}
