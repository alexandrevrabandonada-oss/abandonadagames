# Relatorio do Tijolo 25: Cidade de Aco

Data da verificacao: `2026-07-01`

## 1. Resumo executivo

O Tijolo `25` transformou `Cidade de Aco: Cronicas de VR` de um baralho visualmente fechado em uma primeira partida bem mais legivel para mobile.

Resultado desta rodada:

- a abertura agora explica o jogo em `3` passos curtos;
- a escolha de deck ficou mais clara com preview real das cartas;
- a primeira jogada ganhou sinais melhores de carta pronta, territorio alvo e territorio bloqueado por Folego;
- a tela final ficou mais objetiva e jogavel;
- o compartilhamento foi mantido simples, com Web Share API quando disponivel e copia de texto como fallback;
- uma pessoa nova ja consegue abrir, entender o minimo, jogar e sair com opcoes claras de repetir, trocar deck ou compartilhar.

## 2. Friccoes encontradas

Auditoria mobile real da primeira partida:

1. A tela inicial explicava o universo do jogo, mas nao dizia rapido o que fazer primeiro.
2. A escolha entre `Aco & Memoria` e `Rio & Rua` dependia demais de texto corrido; faltava leitura instantanea do estilo.
3. Antes desta rodada, os territorios pareciam mais travados do que orientados: o jogador precisava descobrir sozinho que primeiro devia selecionar a carta.
4. O custo em Folego existia, mas a relacao entre carta pronta, territorio liberado e territorio bloqueado ainda estava pouco didatica.
5. A tela final antiga funcionava, mas o resultado abria com sinal muito abstrato e o botao de replay nao era o melhor fechamento para primeira partida.
6. O compartilhamento existia, mas estava pouco enquadrado como acao final do jogador.

## 3. Mudancas feitas

### Onboarding curto

- painel compacto de primeira partida com `3` passos:
  - escolha um deck
  - jogue nos territorios
  - segure a cidade viva
- botoes:
  - `Comecar`
  - `Pular`
- o onboarding e leve e nao bloqueia o jogo com modal grande.

### Escolha de deck

- cada deck agora mostra:
  - subtitulo de estilo
  - tags curtas
  - preview com `3` cartas reais do proprio baralho
- leitura reforcada:
  - `Aco & Memoria`: historico, industrial, pressao alta
  - `Rio & Rua`: comunitario, ambiental, mais flexivel

### Primeira jogada

- objetivo rapido ficou visivel no topo da partida;
- os `3` passos da primeira rodada aparecem de forma compacta;
- a mensagem central agora orienta melhor:
  - carta pronta
  - falta de Folego
  - necessidade de escolher carta antes do territorio
- territorios jogaveis recebem destaque claro;
- territorios bloqueados por Folego passaram a comunicar o problema em vez de parecerem apenas inertes;
- a mao agora mostra melhor quando a carta esta `pronta para jogar`.

### Tela final e fechamento

- titulo final curto e legivel;
- resumo do estado da cidade em uma frase;
- metricas principais mais claras:
  - score territorial
  - cidade viva
  - territorios ganhos
  - recorde local
- novos botoes finais:
  - `Jogar de novo`
  - `Trocar deck`
  - `Compartilhar resultado`
  - `Ver ranking`

### Compartilhamento

- texto de share ficou mais contextualizado com deck e narrativa;
- fluxo final:
  - share nativo com arquivo quando possivel
  - share nativo com texto/url
  - copia de texto como fallback

## 4. Prints mobile

Arquivos gerados:

- `output/playwright/cidade25-start-mobile.png`
- `output/playwright/cidade25-deck-select-mobile.png`
- `output/playwright/cidade25-first-card-mobile.png`
- `output/playwright/cidade25-feedback-mobile.png`
- `output/playwright/cidade25-result-mobile.png`

Leitura dos prints:

- `cidade25-start-mobile.png`
  - o jogo agora explica a entrada em segundos;
- `cidade25-deck-select-mobile.png`
  - a escolha de deck virou decisao visual e nao so textual;
- `cidade25-first-card-mobile.png`
  - a primeira selecao ja comunica carta pronta e relacao com Folego;
- `cidade25-feedback-mobile.png`
  - o territorio mostra melhor o impacto da jogada;
- `cidade25-result-mobile.png`
  - o encerramento ficou claro, curto e acionavel.

## 5. Arquivos alterados

- `src/components/games/CidadeDeAcoCardGame.tsx`
- `src/components/games/cidade-de-aco/CidadeDeAcoCardView.tsx`
- `src/components/games/cidade-de-aco/CidadeDeAcoTerritoryView.tsx`

## 6. Validacoes executadas

Comandos:

```bash
npm run state
npm run game:validate -- cidade-de-aco-cartas-vr
npm run lint
npm run build
```

Resultado:

- `npm run state`: OK
- `npm run game:validate -- cidade-de-aco-cartas-vr`: OK
- `npm run lint`: OK
- `npm run build`: OK

## 7. Pendencias para publicacao

Pendencias pequenas, sem bloquear o jogo:

- observar mais uma rodada real de gente nova para ver se o texto de perda final pode ficar um pouco menos seco;
- decidir se o card de resultado deve sempre ficar expandido ou se, no futuro, vale reduzir sua altura no mobile;
- acompanhar se o jogador usa mais `Jogar de novo` ou `Trocar deck` para decidir qual botao merece mais destaque na publicacao.

## 8. Recomendacao para o Tijolo 26

O Tijolo `26` nao precisa mexer em regra central.

Recomendacao:

- fazer uma rodada curta de polimento de retencao e partilha:
  - microanimacoes leves de carta jogada
  - ajuste fino do resultado compartilhavel
  - eventual refinamento do texto de derrota e empate
  - verificacao com `2` ou `3` pessoas novas em mobile real

Leitura final:

- o jogo ja esta entendivel na primeira partida;
- o fluxo de abrir, escolher deck, jogar, terminar e compartilhar esta fechado;
- `Cidade de Aco` ja parece jogavel para publicacao inicial.
