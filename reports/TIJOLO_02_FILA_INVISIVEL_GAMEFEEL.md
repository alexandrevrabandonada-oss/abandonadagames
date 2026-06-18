# Tijolo 02 - Fila Invisivel Game Feel

## Diagnostico inicial

- A rota `C:\Projetos\GamesCampanha\abandonada-games\src\app\jogar\[slug]\page.tsx` ja apontava corretamente para o template `QueueChaosGame`.
- O jogo anterior era baseado em cards arrastaveis no DOM, sem canvas, sem loop arcade e com feedback limitado.
- O catalogo em `games/catalog` e o ranking mockado em `tmp/mock-ranking.json` estavam operacionais.
- Scripts npm existentes: `dev`, `build`, `start`, `lint`, `game:create`, `game:validate`.
- `lint` e `build` estavam passando antes da reescrita.

## Arquivos modificados

- `C:\Projetos\GamesCampanha\abandonada-games\src\components\games\QueueChaosGame.tsx`
- `C:\Projetos\GamesCampanha\abandonada-games\reports\TIJOLO_02_FILA_INVISIVEL_GAMEFEEL.md`

## Mecanicas implementadas

- Canvas principal responsivo mobile-first.
- Loop com `requestAnimationFrame`.
- Spawn continuo de pessoas na fila.
- Barra de paciencia individual por pessoa.
- Toque/clique para atender.
- Combo por sequencia rapida.
- Multiplicador progressivo ate `x5`.
- Medidor de caos com fim por colapso.
- Fim por tempo de rodada ou caos maximo.
- Replay sem reload da pagina.

## Melhorias visuais

- Fundo escuro industrial com faixas de alerta.
- Pista de fila mais clara e legivel.
- Personagens simples com animacao, humor e barra de paciencia.
- HUD maior e mais legivel para celular.
- Overlay de flash para acerto, combo e erro.
- Particulas textuais no canvas para score, combo e perda.

## Melhorias de game feel

- Feedback instantaneo ao tocar certo ou errado.
- Ritmo de spawn acelera com a rodada.
- Eventos publicos alternam pressao e alivio usando obstaculos/power-ups do `game.json`.
- Audio sintetizado com Web Audio para atendimento, erro e combo.
- Melhor score salvo em `localStorage`.
- Microfrases curtas: `Atendeu!`, `Combo!`, `Caos subiu!`, `Perdeu atendimento!`, `Mutirao!`.

## Ranking e localStorage

- Mantido ranking local mockado existente.
- Score final continua sendo enviado para `POST /api/score/submit`.
- Melhor score salvo em `localStorage` com chave `abandonada:fila-invisivel:best-score`.
- Nome do jogador salvo em `localStorage` com chave `abandonada:fila-invisivel:player-name`.

## Compartilhamento

- Web Share API quando disponivel.
- Fallback para copiar texto:
  `Joguei Fila Invisivel: atendi {atendidos} pessoas, fiz combo {comboMax} e terminei com rank {rank}. A fila nao venceu hoje.`

## Testes executados

- `npm run lint`
- `npm run build`
- `npm run game:validate -- fila-invisivel`
- validacao HTTP manual da rota `/jogar/fila-invisivel`

## Erros corrigidos

- Remocao do fluxo anterior baseado em drag-and-drop, inadequado para mobile-first arcade.
- Ajuste do loop para replay sem recarregar a pagina.
- Persistencia de melhor score sem adicionar dependencias pesadas.

## Pendencias

- Melhorar screenshot/card visual compartilhavel com OG image dedicada.
- Substituir ranking mockado por Supabase com RLS.
- Considerar separar o motor `queue-chaos` em hooks/modulos reutilizaveis para novos jogos.
- Afinar dificuldade com playtest real em celular.

## Proximo prompt recomendado

`Voce e o agente SystemsPolisher do projeto Abandonada Games Web/PWA. Refine o balanceamento, extraia o motor queue-chaos para um template reutilizavel e integre ranking real via Supabase com RLS, mantendo o game feel arcade mobile-first.`
