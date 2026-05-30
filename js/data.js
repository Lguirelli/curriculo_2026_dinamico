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
      { id:'landing-editavel', label:'landing page editavel', type:'project-folder', projectPath:'content/portfolio/design/landing-page-editavel/index.html' },
      { id:'interfaces', label:'interfaces', type:'folder-file', path:'content/portfolio/design/interfaces.html' },
      { id:'identidade-visual', label:'identidade visual', type:'folder-file', path:'content/portfolio/design/identidade-visual.html' }
    ]},
    { id:'fotografia', label:'Fotografia', type:'folder', path:'content/portfolio/fotografia/index.html', files:[
      { id:'editorial', label:'editorial', type:'folder-file', path:'content/portfolio/fotografia/editorial.html' },
      { id:'tratamento-imagem', label:'tratamento de imagem', type:'folder-file', path:'content/portfolio/fotografia/tratamento-de-imagem.html' }
    ]},
    { id:'videos', label:'Vídeos', type:'folder', path:'content/portfolio/videos/index.html', files:[
      { id:'edicao', label:'edição', type:'folder-file', path:'content/portfolio/videos/edicao.html' },
      { id:'motion', label:'motion', type:'folder-file', path:'content/portfolio/videos/motion.html' }
    ]}
  ],
  games: [
    { id:'snake', label:'Snake', icon:'assets/icons/game-snake.png' },
    { id:'mines', label:'Campo Minado', icon:'assets/icons/game-mines.png' },
    { id:'pong', label:'Pong', icon:'assets/icons/game-pong.png' }
  ]
};
