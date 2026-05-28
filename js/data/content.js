window.OS_DATA = {
  resume: [
    { id:'sobre', title:'Sobre.txt', type:'file', path:'content/curriculo/sobre.html' },
    { id:'experiencia', title:'Experiência.txt', type:'file', path:'content/curriculo/experiencia.html' },
    { id:'formacao', title:'Formação.txt', type:'file', path:'content/curriculo/formacao.html' },
    { id:'skills', title:'Skills.txt', type:'file', path:'content/curriculo/skills.html' },
    { id:'contato', title:'Contato.txt', type:'file', path:'content/curriculo/contato.html' }
  ],
  portfolio: [
    { id:'f1', title:'F1', type:'folder', files:[
      {title:'Visualizador.html', path:'content/portfolio/f1/visualizador.html'},
      {title:'Dados.html', path:'content/portfolio/f1/dados.html'},
      {title:'Preview.html', path:'content/portfolio/f1/preview.html'},
      {title:'Replay.html', path:'content/portfolio/f1/replay.html'}
    ]},
    { id:'ia', title:'IA', type:'folder', files:[
      {title:'Fluxo.html', path:'content/portfolio/ia/fluxo.html'},
      {title:'Dashboard.html', path:'content/portfolio/ia/dashboard.html'},
      {title:'Agente.html', path:'content/portfolio/ia/agente.html'},
      {title:'Prompt.html', path:'content/portfolio/ia/prompt.html'}
    ]},
    { id:'web', title:'Web', type:'folder', files:[
      {title:'Landing.html', path:'content/portfolio/web/landing.html'},
      {title:'Home.html', path:'content/portfolio/web/home.html'},
      {title:'Copy.html', path:'content/portfolio/web/copy.html'},
      {title:'Style.html', path:'content/portfolio/web/style.html'}
    ]},
    { id:'branding', title:'Branding', type:'folder', files:[
      {title:'Logo.html', path:'content/portfolio/branding/logo.html'},
      {title:'Manual.html', path:'content/portfolio/branding/manual.html'},
      {title:'Paleta.html', path:'content/portfolio/branding/paleta.html'},
      {title:'Tom de voz.html', path:'content/portfolio/branding/tom-de-voz.html'}
    ]}
  ],
  games: [
    { id:'snake', title:'Snake', game:'snake' },
    { id:'mines', title:'Campo Minado', game:'mines' },
    { id:'pong', title:'Pong', game:'pong' }
  ],
  mobileApps: [
    { id:'notas', title:'Notas', icon:'▤', screen:'notes' },
    { id:'f1', title:'F1', icon:'🏎', folder:'f1' },
    { id:'ia', title:'IA', icon:'✦', folder:'ia' },
    { id:'web', title:'Web', icon:'◈', folder:'web' },
    { id:'branding', title:'Branding', icon:'✺', folder:'branding' },
    { id:'jogos', title:'Jogos', icon:'🎮', screen:'games' },
    { id:'github', title:'GitHub', icon:'GH', url:'https://github.com/Lguirelli' },
    { id:'contato', title:'Contato', icon:'✉', path:'content/curriculo/contato.html' }
  ]
};
