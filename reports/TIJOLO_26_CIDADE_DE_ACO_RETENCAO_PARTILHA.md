# Relatorio do Tijolo 26: Cidade de Aco

Data da verificacao: `2026-07-01`

## 1. Resumo executivo

O Tijolo `26` fechou uma rodada curta de polimento focada em retencao, partilha e sensacao de resposta no mobile, sem mexer na regra central do jogo.

Resultado desta rodada:

- a selecao de carta ganhou pulso visual leve;
- falta de Folego agora reage com shake curto em carta e territorio;
- territorio impactado ganhou resposta visual breve;
- o resultado final ficou mais forte para virar print;
- o texto compartilhavel passou a citar deck, estado da cidade e chamada de desafio;
- o fluxo de share ganhou toast curto e mais contexto;
- a auditoria em producao revelou um erro de hidratacao do React, que foi corrigido antes do fechamento.

## 2. Microfeedbacks adicionados

### Cartas

- carta selecionada agora usa um pulso leve e continuo;
- carta sem Folego dispara shake curto quando o jogador tenta usa-la fora do custo;
- a mao continua legivel, sem particula nem animacao longa.

### Territorios

- territorio jogavel recebe resposta curta ao receber a carta;
- territorio bloqueado por Folego reage com shake curto e hint laranja;
- o texto do territorio continua dizendo se a carta entra agora ou quanto Folego ainda falta.

### Estado de partida

- o bloco de `matchup` reage quando o saldo de influencia melhora ou piora;
- o CTA `Fechar rodada` continua forte quando a mao trava;
- o jogo manteve o ritmo rapido, sem modal nem efeito pesado.

## 3. Textos de resultado revisados

Melhorias aplicadas:

- reforco do titulo e do estado final da cidade;
- nova linha de impacto para:
  - vitoria;
  - derrota;
  - empate;
  - recorde local;
- card de resultado exportado agora mostra:
  - nome do jogo;
  - deck usado;
  - Cidade Viva final;
  - territorios vencidos;
  - saldo de influencia;
  - chamada curta de desafio;
- o texto de share passou a seguir uma direcao mais direta:
  - nome do jogador;
  - deck usado;
  - Cidade Viva final;
  - rodada;
  - provocacao para outra pessoa jogar.

## 4. Fluxo de compartilhamento

Fluxo final mantido leve:

1. tenta compartilhar com Web Share API;
2. se nao houver share nativo com arquivo, usa share de texto e URL;
3. se isso nao existir, cai para copia de texto;
4. em sucesso, exibe toast curto de confirmacao;
5. em falha real, volta o rotulo padrao e mostra aviso curto.

Observacao importante:

- a captura mobile foi feita com `share` e `clipboard` simulados no navegador de teste apenas para verificar a UI final e o estado visual do fluxo;
- no navegador de producao local, o console ficou limpo depois da correcao de hidratacao.

## 5. Achados de playtest

### Observacao mobile feita nesta rodada

- a carta selecionada ficou mais “tocavel” sem esconder informacao;
- a falta de Folego agora comunica frustracao de forma curta e util;
- o resultado final ficou mais acionavel para `Jogar de novo` e `Compartilhar`;
- o toast de share ajuda a fechar a acao sem depender de texto pequeno no botao;
- o replay continua claro e imediato depois do fim da partida.

### Roteiro para pessoas novas

Roteiro preparado para `2` ou `3` pessoas:

1. entendeu o que fazer sem explicacao externa?
2. escolheu deck por curiosidade?
3. conseguiu jogar a primeira carta?
4. entendeu Folego?
5. entendeu o resultado?
6. teve vontade de jogar de novo?
7. teve vontade de compartilhar?

Status:

- ainda falta executar esse roteiro com pessoas externas reais;
- a recomendacao continua sendo observar pelo menos `2` pessoas antes da publicacao aberta.

## 6. Prints mobile

Arquivos gerados:

- `output/playwright/cidade26-card-feedback-mobile.png`
- `output/playwright/cidade26-territory-feedback-mobile.png`
- `output/playwright/cidade26-result-share-mobile.png`
- `output/playwright/cidade26-replay-flow-mobile.png`

Leitura dos prints:

- `cidade26-card-feedback-mobile.png`
  - mostra a carta selecionada, o custo legivel e o estado de pronta para jogar;
- `cidade26-territory-feedback-mobile.png`
  - mostra o territorio ja impactado e a leitura conjunta entre banner, tabuleiro e mao;
- `cidade26-result-share-mobile.png`
  - mostra o card de resultado, o CTA de share e o toast curto de confirmacao;
- `cidade26-replay-flow-mobile.png`
  - mostra a volta rapida para uma nova partida, sem perder contexto.

## 7. Arquivos alterados

- `src/components/games/CidadeDeAcoCardGame.tsx`
- `src/components/games/cidade-de-aco/CidadeDeAcoCardView.tsx`
- `src/components/games/cidade-de-aco/CidadeDeAcoTerritoryView.tsx`
- `src/app/globals.css`
- `reports/TIJOLO_26_CIDADE_DE_ACO_RETENCAO_PARTILHA.md`

## 8. Validacoes executadas

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

Verificacao adicional:

- auditoria mobile em build de producao local: OK
- console do navegador apos nova captura: `0` erros

Incidente corrigido durante a rodada:

- a primeira auditoria em producao apontou erro de hidratacao do React;
- a causa era leitura de `localStorage` no estado inicial do componente;
- o jogo passou a hidratar com estado SSR-estavel e sincronizar os dados locais depois do mount.

## 9. Recomendacao para publicacao inicial

Leitura final:

- o jogo esta mais gostoso de jogar e mais natural de compartilhar;
- o fechamento de resultado agora parece mais editorial e menos tecnico;
- o escopo continuou controlado;
- nao houve mudanca de regra central.

Recomendacao:

- publicar em lote inicial controlado;
- antes de abrir mais, rodar o roteiro com `2` ou `3` pessoas novas em celular real;
- acompanhar principalmente:
  - taxa de `Jogar de novo`;
  - uso de `Compartilhar resultado`;
  - clareza da derrota e do empate;
  - possivel necessidade de reduzir ainda mais a altura visual do card final em telas muito baixas.
