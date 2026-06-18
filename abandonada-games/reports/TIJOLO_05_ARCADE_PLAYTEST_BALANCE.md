# Tijolo 05 - Arcade Playtest Balance

## Diagnostico inicial

- `/jogar/fila-invisivel` e `/jogar/onibus-zero` estavam roteados e gerados no build.
- `/ranking/fila-invisivel` e `/ranking/onibus-zero` usam o ranking mockado existente.
- Os dois `game.json` passam no validador.
- `QueueChaosGame.tsx` ja tinha canvas, combo, caos, card PNG, Web Share/fallback e melhor score local.
- `OnibusZeroGame.tsx` ja tinha canvas, 3 faixas, passageiros, obstaculos, checkpoints, tarifa, buzina, card PNG, Web Share/fallback e melhor score local.
- A home listava os dois jogos, mas o destaque ainda usava texto antigo de `Arraste a fila`.

## Avaliacao - Fila Invisivel

- Clareza em 3 segundos: boa, mas a frase `toque para atender` podia ser mais direta.
- HUD: legivel em mobile, com quatro caixas compactas.
- Ritmo inicial: um pouco tenso para primeira partida.
- Curva de dificuldade: boa, mas desistencias puniam forte.
- Sensacao de acerto: forte por particulas, flash e som.
- Punicao por erro: perceptivel, mas shake estava ligeiramente alto.
- Replay: bom, botao primario forte.
- Mobile vertical: boa leitura; alvos podiam ser maiores.
- Desktop: funcional, sem depender de hover.
- Areas de toque: melhoraveis para dedo em tela pequena.
- Tela final: clara e compartilhavel.
- Card: forte e coerente com a identidade.

## Avaliacao - Onibus Zero

- Clareza em 3 segundos: boa, mas precisava de mais folga no inicio.
- HUD: informativo, seis metricas cabem melhor que texto explicativo.
- Ritmo inicial: rapido cedo demais para primeira tentativa.
- Curva de dificuldade: divertida, mas obstaculos apareciam cedo.
- Sensacao de acerto: satisfatoria ao pegar passageiros e checkpoints.
- Punicao por erro: alta para prototipo inicial.
- Replay: bom, com resultado e card.
- Mobile vertical: controles grandes, mas frase de controle podia ser mais curta.
- Desktop: teclado e canvas funcionam.
- Areas de toque: boas nos botoes; buzina precisava alcance maior.
- Tela final: clara e completa.
- Card: bom, com identidade propria.

## Problemas de diversao encontrados

- Fila Invisivel: inicio podia frustrar por alvo pequeno e paciencia caindo rapido.
- Fila Invisivel: shake de perda podia parecer agressivo.
- Onibus Zero: colisao podia parecer injusta porque a velocidade inicial era alta.
- Onibus Zero: checkpoints demoravam demais para mostrar a recompensa de tarifa.
- Home: card/destaque ainda usava linguagem do primeiro jogo para todos.

## Ajustes de balanceamento

- Fila Invisivel:
  - caos inicial caiu de `12` para `10`;
  - pessoas ficaram maiores;
  - paciencia inicial subiu;
  - queda de paciencia reduziu;
  - spawn inicial ficou um pouco mais lento;
  - acerto da mais score e reduz mais caos;
  - erro e desistencia punem menos;
  - area de toque aumentou.

- Onibus Zero:
  - rank C/B ficou mais acessivel;
  - atraso inicial caiu de `8` para `6`;
  - velocidade inicial caiu;
  - aceleracao final ficou mais suave;
  - obstaculos entram mais tarde e com frequencia mais justa;
  - passageiros aparecem um pouco mais;
  - checkpoints aparecem mais cedo e com menor intervalo;
  - buzina coleta em raio maior;
  - checkpoint reduz mais tarifa;
  - colisao aumenta menos atraso e tarifa.

## Ajustes mobile

- Fila Invisivel: texto inferior virou `toque nas pessoas`.
- Fila Invisivel: alvos maiores melhoram toque em `360x800` e `390x844`.
- Onibus Zero: texto inferior virou `toque lados`.
- Onibus Zero: controles mobile foram mantidos grandes e simples.
- Home: cards ganharam tags curtas de duracao e acao.

## Ajustes visuais

- Fila Invisivel: medidor de caos e feedback permanecem fortes, com shake mais controlado.
- Onibus Zero: a recompensa de tarifa aparece mais cedo por checkpoints mais frequentes.
- Home: cards de jogos ficaram mais escaneaveis e o destaque nao fala mais `Arraste a fila`.

## Melhorias de game feel

- Fila Invisivel ficou mais generoso para iniciantes sem remover tensao final.
- Onibus Zero ficou menos punitivo e mais arcade, com buzina mais util.
- Os dois jogos preservam card PNG local, Web Share/fallback, replay e ranking local.

## Testes executados

- `npm run lint`
- `npm run build`
- `npm run game:validate -- fila-invisivel`
- `npm run game:validate -- onibus-zero`
- `GET http://localhost:3041/jogar/fila-invisivel` retornou `200`.
- `GET http://localhost:3041/jogar/onibus-zero` retornou `200`.
- `GET http://localhost:3041/ranking/fila-invisivel` retornou `200`.
- `GET http://localhost:3041/ranking/onibus-zero` retornou `200`.

## Erros encontrados

- `next start` via `npm` em PowerShell caiu por politica de execucao de `npm.ps1`.
- O primeiro processo de servidor abriu log de pronto, mas encerrou antes dos GETs.

## Erros corrigidos

- A validacao de rotas foi refeita usando `npm.cmd` no mesmo fluxo que iniciou o servidor.
- Todos os GETs obrigatorios retornaram `200`.

## Pendencias

- Playtest humano em celular real para ajustar colisao fina e conforto do dedo.
- Automatizar screenshot mobile se o projeto vier a adotar Playwright.
- Extrair utilitarios compartilhados de card/rank/localStorage depois do proximo jogo.
- Revisar acessibilidade de foco/teclado nas telas finais.

## Recomendacao objetiva

Neste momento, `Corrida do Onibus Zero` esta mais divertido como arcade puro: controle em 3 faixas, coleta, obstaculo, buzina e tarifa caindo criam leitura imediata e replay mais natural. `Fila Invisivel` tem melhor card/tema e esta mais original, mas exige mais atencao para dominar.

## Proximo prompt recomendado

`Voce e o agente ShareCardPolisher do projeto Abandonada Games Web/PWA. Refine os cards PNG e telas finais dos jogos Fila Invisivel e Corrida do Onibus Zero, padronize utilitarios leves de compartilhamento/localStorage e mantenha lint/build passando.`
