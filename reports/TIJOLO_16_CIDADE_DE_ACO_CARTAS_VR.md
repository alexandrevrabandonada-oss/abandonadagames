# Tijolo 16 - Cidade de Aco: Cronicas de VR

Data: 2026-06-29
Workspace: `C:\Projetos\GamesCampanha`

## Entrega

Novo jogo web mobile-first adicionado ao portal:

- slug: `cidade-de-aco-cartas-vr`
- rota: `/jogar/cidade-de-aco-cartas-vr`
- template: `card-territory-battle`

## Arquivos criados

- `games/catalog/cidade-de-aco-cartas-vr/game.json`
- `games/catalog/cidade-de-aco-cartas-vr/cards.json`
- `games/catalog/cidade-de-aco-cartas-vr/README.md`
- `src/lib/cidadeDeAcoCards.ts`
- `src/components/games/CidadeDeAcoCardGame.tsx`
- `src/components/games/cidade-de-aco/CidadeDeAcoCardView.tsx`
- `src/components/games/cidade-de-aco/CidadeDeAcoTerritoryView.tsx`
- `reports/TIJOLO_16_CIDADE_DE_ACO_CARTAS_VR.md`

## Arquivos alterados

- `src/app/jogar/[slug]/page.tsx`
- `src/lib/gamePresentation.ts`
- `src/lib/gameRegistry.ts`

## Escopo implementado

- tela inicial com briefing curto e escolha entre 2 decks
- banco inicial com 24 cartas em `cards.json`
- 3 territorios centrais fixos
- Folego da Cidade por rodada: `3, 4, 5, 6, 7`
- mao inicial com 4 cartas
- compra de carta por rodada
- jogo de carta em territorio pagando custo
- bloqueio de jogada sem Folego suficiente
- bot simples que joga cartas em territorios prioritarios
- resolucao por rodada com Influencia Popular
- Cidade Viva com upgrade de territorios
- tela final com score, ranking e reinicio

## Validacoes executadas

Comandos:

- `npm run game:validate -- cidade-de-aco-cartas-vr`
- `npm run lint`
- `npm run build`

Resultado:

- todos os comandos passaram

## Verificacao manual

Fluxo manual automatizado com Playwright sobre `next start` local em `http://localhost:3002`:

- home abriu e exibiu o novo jogo no catalogo
- rota `/jogar/cidade-de-aco-cartas-vr` abriu corretamente
- escolha de deck iniciou a partida
- uma partida completa foi concluida em 5 rodadas
- o estado final exibiu tela de resultado
- o botao de reinicio funcionou
- viewport mobile foi usada durante a verificacao

Capturas geradas:

- `output/playwright/cidade-home-mobile.png`
- `output/playwright/cidade-intro-mobile.png`
- `output/playwright/cidade-play-mobile.png`
- `output/playwright/cidade-result-mobile.png`

## Observacoes

- a verificacao manual foi feita em `next start` para evitar ruido de `allowedDevOrigins` do `next dev` quando acessado por host diferente
- a arquitetura global de ranking nao foi alterada
- nenhuma mudanca foi feita no bloco Unity/WebGL
