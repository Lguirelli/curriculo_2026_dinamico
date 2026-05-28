window.MinesGame=function(host){
  host.innerHTML=`<div class="game-card"><h2>Campo Minado</h2><div class="mines-grid"></div><div class="game-actions"><button>Reiniciar</button></div></div>`;const grid=host.querySelector('.mines-grid'),btn=host.querySelector('button');
  function reset(){grid.innerHTML='';const mines=new Set();while(mines.size<10)mines.add(Math.floor(Math.random()*64));for(let i=0;i<64;i++){const c=document.createElement('button');c.className='mine-cell';c.onclick=()=>{c.classList.add('open');if(mines.has(i)){c.textContent='✹';alert('Fim de jogo');reset()}else{c.textContent=[...mines].filter(m=>Math.abs(m%8-i%8)<=1&&Math.abs(Math.floor(m/8)-Math.floor(i/8))<=1).length||''}};grid.appendChild(c)}}btn.onclick=reset;reset();
}
