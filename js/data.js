window.OS_DATA = {
  curriculum: [
    { id:'resumo', label:'Resumo.txt', type:'txt', path:'content/curriculo/resumo.html' },
    { id:'formacao', label:'Formação.txt', type:'txt', path:'content/curriculo/formacao.html' },
    { id:'cursos', label:'Cursos.txt', type:'txt', path:'content/curriculo/cursos.html' },
    { id:'experiencia', label:'Experiência.txt', type:'txt', path:'content/curriculo/experiencia.html' },
    { id:'habilidades', label:'Habilidades.txt', type:'txt', path:'content/curriculo/habilidades.html' }
  ],
  portfolio: [
    { id:'f1', label:'F1', type:'folder', path:'content/portfolio/f1/index.html', files:[
      { label:'visualizador.html', path:'content/portfolio/f1/visualizador.html' },
      { label:'dados.html', path:'content/portfolio/f1/dados.html' },
      { label:'replay.html', path:'content/portfolio/f1/replay.html' }
    ]},
    { id:'ia', label:'IA', type:'folder', path:'content/portfolio/ia/index.html', files:[
      { label:'fluxo.html', path:'content/portfolio/ia/fluxo.html' },
      { label:'dashboard.html', path:'content/portfolio/ia/dashboard.html' },
      { label:'agente.html', path:'content/portfolio/ia/agente.html' }
    ]},
    { id:'web', label:'Web', type:'folder', path:'content/portfolio/web/index.html', files:[
      { label:'landing.html', path:'content/portfolio/web/landing.html' },
      { label:'home.html', path:'content/portfolio/web/home.html' },
      { label:'style.html', path:'content/portfolio/web/style.html' }
    ]},
    { id:'branding', label:'Branding', type:'folder', path:'content/portfolio/branding/index.html', files:[
      { label:'logo.html', path:'content/portfolio/branding/logo.html' },
      { label:'manual.html', path:'content/portfolio/branding/manual.html' },
      { label:'tom-de-voz.html', path:'content/portfolio/branding/tom-de-voz.html' }
    ]}
  ],
  games: [
    { id:'snake', label:'Snake', icon:'assets/icons/game-snake.png' },
    { id:'mines', label:'Campo Minado', icon:'assets/icons/game-mines.png' },
    { id:'pong', label:'Pong', icon:'assets/icons/game-pong.png' }
  ]
};
