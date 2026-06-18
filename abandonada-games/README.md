# Abandonada Games

PWA mobile-first de mini-jogos curtos, viralizaveis e compartilhaveis.

## Rodando

```bash
npm install
npm run dev
```

## Estrutura principal

- `src/app/page.tsx`: home mobile.
- `src/app/jogar/[slug]/page.tsx`: pagina do jogo.
- `src/app/ranking/[slug]/page.tsx`: ranking publico.
- `src/app/api/score/*`: API mockada para score.
- `games/catalog/[slug]/game.json`: catalogo data-driven.
- `games/templates/queue-chaos`: template inicial.
- `scripts/create-game-from-news.ts`: gera novos jogos.
- `scripts/validate-game.ts`: valida o `game.json`.

## Como adicionar um jogo

1. Crie um briefing JSON com `slug`, `title`, `tagline`, `summary`, `template`, `obstacles` e `powerUps`.
2. Rode `npm run game:create -- caminho/do/brief.json`.
3. Valide com `npm run game:validate -- seu-slug`.
4. Se o template for `queue-chaos`, o jogo ja aparece na home e na rota `/jogar/seu-slug`.

## Supabase

`src/lib/supabase.ts` ja expõe um cliente lazy. O ranking ainda usa store local em `tmp/mock-ranking.json`, mas a troca por Supabase fica concentrada nas rotas e no store.
