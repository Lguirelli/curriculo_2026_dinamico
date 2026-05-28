# Lorenzo OS — Portfólio Interativo

Protótipo de currículo e portfólio em formato de sistema operacional.

## Como editar

- Currículo desktop: `content/curriculo/*.html`
- Currículo mobile: `content/mobile/notas/*.html`
- Portfólio: `content/portfolio/*/*.html`
- Estilo desktop: `css/desktop.css`
- Estilo das janelas: `css/windows.css`
- Lógica dos ícones: `js/desktop.js`
- Lógica das janelas: `js/windows.js`

## Comportamento desktop

- Arquivos `.txt` começam alinhados no grid à esquerda.
- Pastas e jogos começam alinhados no grid à direita.
- 1 clique seleciona.
- Arrastar reposiciona.
- Ao soltar, aplica snap to grid.
- 2 cliques abre.
- `.txt` abre como caixa pequena flutuante.
- Botão amarelo expande para tela cheia.
- Botão vermelho fecha.

## Rodar localmente

Use um servidor local, porque os conteúdos são carregados via `fetch`:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.
