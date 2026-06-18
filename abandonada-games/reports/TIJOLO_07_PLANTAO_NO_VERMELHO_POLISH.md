# Tijolo 07 - Plantao no Vermelho polish

## Resumo

Polimento do jogo `Plantao no Vermelho`, mantendo a arquitetura data-driven do Abandonada Games e sem adicionar dependencias pesadas. O foco foi melhorar leitura mobile, game feel, balanceamento de rodada curta, poder dos apoios coletivos e qualidade do resultado compartilhavel.

## Arquivos alterados

- `src/components/games/PlantaoNoVermelhoGame.tsx`
- `src/app/page.tsx`
- `reports/TIJOLO_07_PLANTAO_NO_VERMELHO_POLISH.md`

## Gameplay atual

- Rota principal: `/jogar/plantaono-vermelho`
- Ranking publico mockado/local preparado para API: `/ranking/plantaono-vermelho`
- Duracao alvo: 60 segundos, com progresso de `dia 1` a `dia 30`
- Objetivo: sobreviver ao mes desviando de boletos, segurando folego, contas e caos, e coletando apoios
- Fim da rodada: dia 30, folego zerado, caos 100% ou contas 100%

## Melhorias de diversao

- Inicio menos punitivo nos primeiros 10 segundos, permitindo entender o controle antes da pressao subir.
- Spawn agora escala por fase da rodada, com menos boletos no comeco e mais risco no fim.
- Power-ups ficaram mais presentes e mais decisivos.
- `Mutirao` agora limpa boletos perigosos da tela e gera pulso visual.
- Quase erro em boleto agora pontua e mostra feedback `Passou raspando!`.
- Obstaculos financeiros como juros, cobranca e cartao geram feedback especifico `Juros apertou!`.
- Marmita e apoios agora comunicam melhor o alivio com `Respira!` e `Apoio chegou!`.
- Evento de meio de rodada reforca a premissa com `O salario nao caiu!`.

## Melhorias visuais

- HUD ganhou barras de leitura rapida para `folego`, `contas` e `caos`.
- Boletos agora diferenciam tipos como `ALUGUEL`, `LUZ`, `MERCADO`, `JUROS`, `PLANTAO` e `BOLETO`.
- Power-ups ganharam brilho e cores distintas por tipo.
- Personagem muda expressao/cor quando folego esta baixo ou caos esta alto.
- Card do catalogo na home destaca `1 min` e `sobreviva ao mes` para o jogo.

## Como testar

```bash
npm run lint
npm run build
npm run game:validate -- plantaono-vermelho
npm run game:validate -- fila-invisivel
npm run game:validate -- onibus-zero
```

Rotas para smoke test:

- `http://localhost:3060/jogar/plantaono-vermelho`
- `http://localhost:3060/ranking/plantaono-vermelho`
- `http://localhost:3060/jogar/fila-invisivel`
- `http://localhost:3060/jogar/onibus-zero`

## Pendencias

- Playtest manual em celular real para calibrar tamanho dos alvos e velocidade final.
- Integrar ranking Supabase definitivo quando as tabelas e RLS estiverem ativas.
- Criar captura social server-side/OG para compartilhar resultado sem depender apenas do canvas local.
- Adicionar telemetria simples de abandono, duracao media e taxa de conclusao.

## Proximo prompt recomendado

Voce e o agente ArcadePlaytestQA do projeto Abandonada Games. Rode playtest mobile real/simulado dos tres jogos, compare dificuldade, legibilidade e retencao de rodada curta, ajuste apenas numeros de balanceamento e gere relatorio com recomendacoes objetivas.
