# Relatorio Final

## O que foi feito

- Estrutura inicial Next.js App Router em `C:\Projetos\GamesCampanha\abandonada-games`.
- Home mobile-first com identidade visual urbana industrial.
- Manifest PWA e registro de service worker.
- Catalogo dinamico lendo `games/catalog`.
- Primeiro jogo funcional `Fila Invisivel` com template `queue-chaos`.
- Ranking local mockado com API pronta para evolucao.
- Tela final com score, replay e compartilhamento.
- Scripts para criacao e validacao de novos jogos.
- README com fluxo de extensao.

## Como testar

```bash
cd C:\Projetos\GamesCampanha\abandonada-games
npm install
npm run dev
npm run lint
npm run build
npm run game:validate -- fila-invisivel
```

Abra:

- `http://localhost:3000/`
- `http://localhost:3000/jogar/fila-invisivel`
- `http://localhost:3000/ranking/fila-invisivel`

## Proximos passos

- Substituir `tmp/mock-ranking.json` por tabela Supabase com RLS.
- Adicionar autenticacao anonima e assinatura de score por sessao.
- Criar gerador de card OG por jogo e resultado.
- Evoluir o template `queue-chaos` para usar canvas e animacoes dedicadas.
- Adicionar mais templates reutilizaveis para noticias locais.
