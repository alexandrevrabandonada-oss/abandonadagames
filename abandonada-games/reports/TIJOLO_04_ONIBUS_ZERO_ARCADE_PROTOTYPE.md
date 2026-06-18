# Tijolo 04 - Onibus Zero Arcade Prototype

## Diagnostico inicial

- A plataforma ja tinha catalogo dinamico em `games/catalog`.
- A rota `/jogar/[slug]` renderizava somente `QueueChaosGame`.
- A API mock de score e ranking local ja estava ativa.
- `Fila Invisivel` estava funcional e precisava permanecer intacto.
- Scripts disponiveis: `lint`, `build`, `game:validate`, `dev` e `start`.

## Arquivos criados

- `games/catalog/onibus-zero/game.json`
- `src/components/games/OnibusZeroGame.tsx`
- `reports/TIJOLO_04_ONIBUS_ZERO_ARCADE_PROTOTYPE.md`

## Arquivos modificados

- `src/app/jogar/[slug]/page.tsx`

## Gameplay implementado

- Novo jogo em `/jogar/onibus-zero`.
- Canvas responsivo mobile-first.
- Loop com `requestAnimationFrame`.
- Onibus controlavel em 3 faixas.
- Movimento automatico para frente com pista vertical.
- Passageiros aparecem em pontos.
- Obstaculos aparecem na pista.
- Checkpoints de bairro aparecem periodicamente.
- Controles por teclado, clique/toque e botoes mobile.
- Buzina como acao especial simples com cooldown.

## HUD

- Tempo.
- Tarifa atual.
- Combo.
- Passageiros transportados.
- Bairros conectados.
- Score.
- Barra de atraso.
- Microfrases rapidas como `Pegou geral!`, `Tarifa caiu!` e `Cuidado com o buraco!`.

## Sistema de tarifa

- A tarifa inicia em `R$ 5,00`.
- Checkpoints de bairro reduzem a tarifa.
- Combo melhora a reducao da tarifa nos checkpoints.
- Bater em obstaculos aumenta levemente a tarifa e o atraso.

## Sistema de combo

- Coletar passageiros em sequencia aumenta combo.
- Combo aumenta ganho de score.
- Obstaculos zeram combo.
- Buzina pode capturar passageiros proximos e sustentar ritmo.

## Card compartilhavel

- Card PNG local gerado por canvas no frontend.
- Card contem nome do jogo, rank, score, passageiros, bairros, combo maximo, tarifa final e chamada `Jogue tambem`.
- Preview aparece na tela final.

## Ranking e localStorage

- Score final usa a API mock existente `POST /api/score/submit`.
- Melhor score local salvo em `localStorage` com chave `abandonada:onibus-zero:best-score`.
- Nome do jogador salvo em `localStorage` com chave `abandonada:onibus-zero:player-name`.
- Link para `/ranking/onibus-zero` preservado.

## Testes executados

- `npm run lint`
- `npm run build`
- `npm run game:validate -- onibus-zero`
- `npm run game:validate -- fila-invisivel`
- `npm run start -- --port 3030`
- `GET http://localhost:3030/jogar/onibus-zero` retornou `200`.
- `GET http://localhost:3030/jogar/fila-invisivel` retornou `200`.

## Erros encontrados

- A rota dinamica carregava apenas `QueueChaosGame`; foi necessario selecionar componente por slug/template.
- ESLint/React Compiler bloqueou mutacao direta de item em array (`item.hit = true`).
- A funcao `useHorn` foi interpretada como hook pelo lint por causa do prefixo `use`.

## Erros corrigidos

- Rota `/jogar/[slug]` agora renderiza `OnibusZeroGame` para `onibus-zero`/`bus-runner`.
- Marcacao de itens atingidos passou a usar `Set` e `map` imutavel.
- `useHorn` virou `triggerHorn`.
- `lint` e `build` passam.

## Pendencias

- Playtest real em celular para calibrar velocidade, colisao e spawn.
- Separar utilitarios compartilhaveis de card/rank/localStorage depois do terceiro jogo.
- Criar arte mais refinada para onibus, obstaculos e bairros.
- Integrar ranking real via Supabase em tijolo futuro.

## Proximo prompt recomendado

`Voce e o agente ArcadePlaytestBalancer do projeto Abandonada Games Web/PWA. Faça playtest tecnico dos jogos Fila Invisivel e Corrida do Onibus Zero, ajuste curva de dificuldade, colisao, feedback visual e ergonomia mobile sem adicionar dependencias pesadas.`
