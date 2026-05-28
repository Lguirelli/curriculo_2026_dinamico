# Lorenzo OS — Portfólio modular dark

Projeto de prova de conceito para currículo e portfólio em formato de sistema operacional.

## Estrutura

- Desktop: área de trabalho com arquivos do currículo, pastas do portfólio e jogos.
- Mobile: tela de celular com app de notas, apps soltos e pasta Jogos.
- Conteúdos editáveis em `content/`.
- Estilos separados em `css/`.
- Scripts separados em `js/`.

## Como rodar

Use um servidor local para o `fetch()` carregar os HTMLs:

```bash
python -m http.server 8000
```

Depois abra:

```txt
http://localhost:8000
```
