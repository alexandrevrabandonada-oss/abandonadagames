# Tijolo 03 - Fila Invisivel Arcade Polish

## Diagnostico inicial

- A rota `/jogar/fila-invisivel` estava ativa via `src/app/jogar/[slug]/page.tsx`.
- O componente principal era `src/components/games/QueueChaosGame.tsx`.
- O catalogo `games/catalog/fila-invisivel/game.json` continuava data-driven com obstaculos e power-ups.
- A API mock de score em `src/app/api/score/submit/route.ts` seguia validando payload e anti-cheat.
- `localStorage` ja guardava melhor score e nome do jogador.
- Replay funcionava sem reload.
- Compartilhamento usava Web Share API ou copia de texto.
- Scripts npm disponiveis: `lint`, `build`, `game:validate`, `game:create`, `dev`, `start`.

## Mudancas de balanceamento

- Rodada ajustada para 50 segundos.
- Caos inicial reduzido para 12%.
- Spawn inicial mais lento e satisfatorio, com progressao ate o final.
- Primeiros 15 segundos receberam grace period na queda de paciencia.
- Penalidade por erro foi reduzida de 4 para 3 pontos de caos.
- Penalidade por desistência caiu para 10 pontos de caos.
- Obstaculos agora sobem 7 pontos de caos, mantendo tensao sem encerrar cedo demais.
- Multiplicador sobe a cada 4 atendimentos em combo, ate `x5`.
- Ranks recalibrados para jogador medio mirar C/B e A/S exigir consistencia.

## Melhorias de game feel

- Atendimento cria sprite de saida feliz em vez de desaparecer instantaneamente.
- Desistencia cria sprite de saida negativa com feedback textual.
- Shake leve quando caos sobe por erro, obstaculo ou perda.
- Pulso visual quando combo passa de 3.
- Flash/brilho no multiplicador e em eventos positivos.
- Area de atendimento no canvas ganhou pulso e mais contraste.
- Particulas de score e microfrases foram reforcadas.

## Melhorias visuais

- Area de fila recebeu borda mais clara e contraste maior.
- HUD continua grande e direto para mobile vertical.
- Personagens mantêm shapes simples, com expressao de espera ou panico.
- Fundo industrial foi mantido, mas com leitura mais limpa da area jogavel.
- Texto de objetivo permanece curto para entendimento em poucos segundos.

## Tela final

- Rank ficou grande e dominante.
- Tela mostra score, maior combo, melhor score local, atendidos e caos final.
- Frases por rank:
  - D: `A fila engoliu o atendimento.`
  - C: `Voce segurou o caos por pouco.`
  - B: `A fila andou.`
  - A: `Mutirao funcionando!`
  - S: `Fila derrotada!`
- Botao `Jogar de novo` virou acao principal.
- Botao `Compartilhar` e link `Ver ranking` foram preservados.

## Card compartilhavel

- Criado card PNG local no frontend via canvas.
- Card contem nome do jogo, rank, score, atendidos, combo maximo, melhor score, frase `A fila nao venceu hoje.` e chamada `Jogue tambem`.
- Preview do card aparece na tela final para orientar print quando compartilhamento de arquivo nao estiver disponivel.
- Estrutura fica pronta para futura versao OG dinamica no servidor.

## Compartilhamento

- Texto atualizado:
  `Joguei Fila Invisivel: atendi {atendidos} pessoas, fiz combo {comboMax}, marquei {score} pontos e terminei com rank {rank}. A fila nao venceu hoje.`
- Quando o navegador suporta `navigator.canShare` com arquivos, compartilha o PNG.
- Quando nao suporta arquivo, usa Web Share API com texto.
- Fallback final copia o texto para a area de transferencia.

## Refatoracoes

- A logica segue em `QueueChaosGame.tsx`, mas ficou mais segmentada por funcoes:
  - estado e balanceamento;
  - loop;
  - renderizacao canvas;
  - score/rank;
  - card compartilhavel;
  - compartilhamento.
- Nao houve refatoracao grande para evitar risco no jogo funcional.

## Testes executados

- `npm run lint`
- `npm run build`
- `npm run game:validate -- fila-invisivel`
- `npm run start -- --port 3020`
- `GET http://localhost:3020/jogar/fila-invisivel` retornou `200`.

## Erros encontrados

- ESLint/React Compiler bloqueou uma limpeza sincrona de `setResultImageUrl` dentro de `useEffect`.
- O servidor `next start` demorou mais que a primeira janela de leitura de log, mas subiu corretamente na porta `3020`.
- Playwright nao esta instalado no projeto, entao nao foi feito screenshot automatizado de viewport mobile para evitar dependencia pesada.

## Erros corrigidos

- Limpeza de preview do card foi movida para o fluxo de replay/geracao.
- Inicializacao do melhor score foi ajustada para preservar o valor de `localStorage`.
- Build e lint voltaram a passar.

## Pendencias

- Fazer playtest real em celular para ajustar curva fina.
- Extrair `queue-chaos` para pasta/template reutilizavel quando houver segundo jogo usando o mesmo motor.
- Criar OG image dinamico para resultado compartilhavel no servidor.
- Integrar ranking real via Supabase em tijolo futuro.

## Proximo prompt recomendado

`Voce e o agente TemplateExtractor do projeto Abandonada Games Web/PWA. Extraia o motor queue-chaos para uma estrutura reutilizavel sem perder o game feel, crie contratos de configuracao para novos jogos via game.json e prepare hooks de ranking para futura integracao Supabase.`
