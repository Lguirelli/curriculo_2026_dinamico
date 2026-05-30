window.OS_DATA = {
  curriculum: [
    { id:'resumo', label:'Resumo.txt', type:'txt', path:'content/curriculo/resumo.html' },
    { id:'formacao', label:'Formação.txt', type:'txt', path:'content/curriculo/formacao.html' },
    { id:'cursos', label:'Cursos.txt', type:'txt', path:'content/curriculo/cursos.html' },
    { id:'experiencia', label:'Experiência.txt', type:'txt', path:'content/curriculo/experiencia.html' },
    { id:'habilidades', label:'Habilidades.txt', type:'txt', path:'content/curriculo/habilidades.html' }
  ],
  portfolio: [
    { id:'design', label:'Design', type:'folder', path:'content/portfolio/design/index.html', files:[
      { label:'landing page editavel.html', path:'content/portfolio/design/landing-page-editavel.html' },
      { label:'interfaces.html', path:'content/portfolio/design/interfaces.html' },
      { label:'identidade visual.html', path:'content/portfolio/design/identidade-visual.html' }
    ]},
    { id:'fotografia', label:'Fotografia', type:'folder', path:'content/portfolio/fotografia/index.html', files:[
      { label:'editorial.html', path:'content/portfolio/fotografia/editorial.html' },
      { label:'tratamento de imagem.html', path:'content/portfolio/fotografia/tratamento-de-imagem.html' }
    ]},
    { id:'videos', label:'Vídeos', type:'folder', path:'content/portfolio/videos/index.html', files:[
      { label:'edicao.html', path:'content/portfolio/videos/edicao.html' },
      { label:'motion.html', path:'content/portfolio/videos/motion.html' }
    ]}
  ],
  games: [
    { id:'snake', label:'Snake', icon:'assets/icons/game-snake.png' },
    { id:'mines', label:'Campo Minado', icon:'assets/icons/game-mines.png' },
    { id:'pong', label:'Pong', icon:'assets/icons/game-pong.png' }
  ]
};
