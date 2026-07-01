# Relatorio do Tijolo 23: Cidade de Aco

Data da verificacao: `2026-06-30`

## 1. Resumo executivo

O Tijolo `23` parou a expansao de conteudo e fechou uma **auditoria geral do baralho** para transformar `Cidade de Aco: Cronicas de VR` em **release candidate visual** no frontend.

Resultado consolidado:

- o baralho completo funciona visualmente em mobile;
- `Aco & Memoria` e `Rio & Rua` ja leem como partes do mesmo jogo;
- as miniaturas no territorio estao mais legiveis depois do ajuste de overlay e da auditoria dedicada;
- nao houve substituicao de arte aprovada nesta rodada;
- houve apenas ajuste tecnico de `artPosition`, leitura de miniatura e contraste;
- a unica pendencia estrutural de arte continua sendo `rio_012`, ainda sem `artPath`, em modo `fallback_only`.

Leitura final do RC:

- deck pronto para release visual com ressalvas controladas;
- gargalos restantes concentrados em:
  - `rio_012` sem arte final;
  - algumas cartas historicas ou muito escuras que continuam corretas, mas menos fortes em thumb que as melhores do baralho.

## 2. Estado inicial

Estado confirmado no inicio desta rodada:

- lote `01`: landmarks reais
- lote `02`: identidade industrial
- lote `03`: rio, bairro e cotidiano
- lote `04`: memoria, cultura e acao coletiva

Validacoes anteriores ja estavam passando:

- `npm run state`
- `npm run game:validate -- cidade-de-aco-cartas-vr`
- `npm run lint`
- `npm run build`

Arquivos revisados nesta rodada:

- `src/lib/cidadeDeAcoCards.ts`
- `src/components/games/cidade-de-aco/CidadeDeAcoCardView.tsx`
- `src/components/games/cidade-de-aco/CidadeDeAcoTerritoryView.tsx`
- `src/components/games/CidadeDeAcoCardGame.tsx`
- `reports/TIJOLO_19_CIDADE_DE_ACO_AUDITORIA_LOTE02.md`
- `reports/TIJOLO_20_CIDADE_DE_ACO_FECHAMENTO_LOTE02.md`
- `reports/TIJOLO_21_CIDADE_DE_ACO_LOTE03.md`
- `reports/TIJOLO_22_CIDADE_DE_ACO_MEMORIA_CULTURA.md`

Observacao de trilha:

- o prompt mencionava `reports/TIJOLO_21_CIDADE_DE_ACO_LOTE03_RIO_BAIRRO.md`, mas o arquivo presente no workspace e revisado foi `reports/TIJOLO_21_CIDADE_DE_ACO_LOTE03.md`.

## 3. Ajustes realizados

Nenhuma arte aprovada foi trocada nesta rodada.

Ajustes tecnicos aplicados:

- novo bloco de auditoria RC em `#audit` com:
  - mao completa do deck `Aco & Memoria`
  - mao completa do deck `Rio & Rua`
  - tabuleiro `Aco & Memoria`
  - tabuleiro `Rio & Rua`
  - miniaturas criticas
  - resumo visual de release candidate
- miniaturas receberam menos interferencia do selo de origem:
  - selo unico menor
  - reposicionamento do selo em mini
  - leve aumento da altura util da arte em `mini`
- a moldura da arte ganhou sombra interna leve para segurar leitura sem filtro agressivo
- cartas de crise receberam filtro tecnico um pouco mais claro para recuperar detalhe no thumb
- `artPosition` foi ajustado em:
  - `rio_002`
  - `rio_003`
  - `rio_004`

Leitura pratica dos ajustes:

- as miniaturas ficaram menos obstruidas;
- `rio_002`, `rio_003` e `rio_004` passaram a funcionar melhor na mao;
- as crises continuam escuras, mas com leitura mais defensavel em thumb.

## 4. Inventario visual do baralho

| id | nome | deck | territorio | artPath | artPosition | artFit | status visual | problema encontrado | acao recomendada |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `aco_001` | Arigo | `aco_memoria` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/aco_001-arigo.jpg` | `center 40%` | `cover` | `release_candidate` | nenhum relevante | manter |
| `aco_002` | Operaria da Laminacao | `aco_memoria` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/aco_002-operaria-da-laminacao.jpg` | `46% 46%` | `cover` | `release_candidate` | nenhum relevante | manter |
| `aco_003` | Mestre do Alto-Forno | `aco_memoria` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/aco_003-mestre-do-alto-forno.jpg` | `center 42%` | `cover` | `release_candidate` | nenhum relevante | manter |
| `aco_004` | Cronista da Cidade Operaria | `aco_memoria` | `memorial-9` | `/games/cidade-de-aco-cartas-vr/cards/aco_004-cronista-cidade-operaria.jpg` | `center 22%` | `contain` | `approved_with_notes` | arte grafica de arquivo perde impacto em mini | manter; revisar so se surgir recorte melhor sem perder documento |
| `aco_005` | Obelisco da Praca Brasil | `aco_memoria` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/aco_005-praca-brasil-historica.jpg` | `center 38%` | `cover` | `release_candidate` | nenhum relevante | manter |
| `aco_006` | Chamine Antiga | `aco_memoria` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/aco_006-chamine-antiga.jpg` | `center 18%` | `contain` | `approved_with_notes` | landmark muito vertical depende de `contain` | manter; nao forcar `cover` |
| `aco_007` | Memorial 9 de Novembro | `aco_memoria` | `memorial-9` | `/games/cidade-de-aco-cartas-vr/cards/aco_007-memorial-9-novembro.jpg` | `center 54%` | `cover` | `release_candidate` | nenhum relevante | manter |
| `aco_008` | Greve de 1988 | `aco_memoria` | `memorial-9` | `/games/cidade-de-aco-cartas-vr/cards/aco_008-greve-de-1988.jpg` | `52% 44%` | `cover` | `approved_with_notes` | carta historica sensivel; aprovacao depende do crop atual | manter sem trocar sem nova curadoria |
| `aco_009` | Turno Virado | `aco_memoria` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/aco_009-turno-virado.jpg` | `42% 46%` | `cover` | `release_candidate` | nenhum relevante | manter |
| `aco_010` | Cidade de Aco | `aco_memoria` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/aco_010-cidade-de-aco.jpg` | `center 44%` | `cover` | `release_candidate` | grayscale historico levemente frio, mas firme | manter |
| `aco_011` | Sirene da Usina | `aco_memoria` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/aco_011-sirene-da-usina.jpg` | `center 34%` | `cover` | `approved_with_notes` | crise muito escura no thumb | contraste tecnico ja ajustado; monitorar em futuras rodadas |
| `aco_012` | Peso do Concreto | `aco_memoria` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/aco_012-peso-do-concreto.jpg` | `58% 34%` | `cover` | `approved_with_notes` | foto historica + crise reduz leitura micro | manter com contraste atual |
| `rio_001` | Curva do Paraiba | `rio_rua` | `rio-paraiba` | `/games/cidade-de-aco-cartas-vr/cards/rio_001-curva-do-paraiba.jpg` | `50% 45%` | `cover` | `release_candidate` | nenhum relevante | manter |
| `rio_002` | Guardia do Rio | `rio_rua` | `rio-paraiba` | `/games/cidade-de-aco-cartas-vr/cards/rio_002-guardia-do-rio.jpg` | `60% 43%` | `cover` | `release_candidate` | crop anterior na mao escondia a cena | manter; ajuste de `artPosition` ja aplicado |
| `rio_003` | Catador do PEV | `rio_rua` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/rio_003-catador-do-pev.jpg` | `56% 42%` | `cover` | `release_candidate` | crop anterior na mao estava baixo | manter; ajuste de `artPosition` ja aplicado |
| `rio_004` | Menino do Retiro | `rio_rua` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/rio_004-menino-do-retiro.jpg` | `60% 42%` | `cover` | `release_candidate` | banner e figura central perdiam leitura na mao | manter; ajuste de `artPosition` ja aplicado |
| `rio_005` | Mestra da Capoeira | `rio_rua` | `memorial-9` | `/games/cidade-de-aco-cartas-vr/cards/rio_005-mestra-da-capoeira.jpg` | `50% 44%` | `cover` | `approved_with_notes` | carta cultural sensivel depende da mestra central visivel | manter enquadramento atual |
| `rio_006` | Parque do Inga | `rio_rua` | `rio-paraiba` | `/games/cidade-de-aco-cartas-vr/cards/rio_006-parque-do-inga.jpeg` | `44% 56%` | `cover` | `approved_with_notes` | foto oficial correta, mas menos incisiva em mini que os landmarks fortes | manter foto oficial; revisar so se surgir foto oficial melhor |
| `rio_007` | Memorial Zumbi | `rio_rua` | `memorial-9` | `/games/cidade-de-aco-cartas-vr/cards/rio_007-memorial-zumbi.jpg` | `center 46%` | `cover` | `release_candidate` | nenhum relevante | manter |
| `rio_008` | Cinema 9 de Abril | `rio_rua` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/rio_008-cinema-9-de-abril.jpg` | `center 42%` | `cover` | `release_candidate` | nenhum relevante | manter |
| `rio_009` | Roda de Escuta | `rio_rua` | `memorial-9` | `/games/cidade-de-aco-cartas-vr/cards/rio_009-roda-de-escuta.jpg` | `50% 44%` | `cover` | `approved_with_notes` | cena coletiva menos iconica em thumb | manter; sem troca por agora |
| `rio_010` | Mutirao de Bairro | `rio_rua` | `praca-brasil` | `/games/cidade-de-aco-cartas-vr/cards/rio_010-mutirao-de-bairro.jpg` | `50% 58%` | `cover` | `release_candidate` | nenhum relevante | manter |
| `rio_011` | Defesa do Paraiba | `rio_rua` | `rio-paraiba` | `/games/cidade-de-aco-cartas-vr/cards/rio_011-defesa-do-paraiba.jpg` | `48% 54%` | `cover` | `approved_with_notes` | leitura um pouco difusa em thumb pela cena aberta | manter |
| `rio_012` | Chuva de Po | `rio_rua` | `rio-paraiba` | `-` | `-` | `cover` | `fallback_only` | ainda sem arte final integrada | substituicao futura obrigatoria |

## 5. Cartas em release candidate

Cartas prontas para release visual sem pendencia tecnica aberta:

- `aco_001`
- `aco_002`
- `aco_003`
- `aco_005`
- `aco_007`
- `aco_009`
- `aco_010`
- `rio_001`
- `rio_002`
- `rio_003`
- `rio_004`
- `rio_007`
- `rio_008`
- `rio_010`

Leitura consolidada:

- o deck `Aco & Memoria` ja tem um nucleo forte de massa industrial, memorial e landmark historico;
- o deck `Rio & Rua` ja sustenta rio, bairro e centro cultural sem parecer banco de imagem genérico;
- as cartas melhores do baralho continuam fortes na mao, no territorio e em mini.

## 6. Cartas aprovadas com ressalvas

Cartas visualmente utilizaveis, mas com observacao de thumb, sensibilidade tematica ou dependencia maior de crop atual:

- `aco_004`
- `aco_006`
- `aco_008`
- `aco_011`
- `aco_012`
- `rio_005`
- `rio_006`
- `rio_009`
- `rio_011`

Leitura pratica das ressalvas:

- nenhuma dessas cartas bloqueia release;
- as ressalvas sao de intensidade menor que a pendencia de `rio_012`;
- as ressalvas se concentram em:
  - arte historica muito vertical ou de arquivo
  - cartas de crise mais escuras
  - cenas comunitarias menos icônicas em microescala
  - cartas culturalmente sensiveis que dependem do enquadramento atual

## 7. Cartas que precisam substituicao futura

Cartas com substituicao futura obrigatoria:

- `rio_012` `fallback_only`

Motivo:

- continua sem `artPath`, usando fallback textual;
- quebra o nivel de acabamento do resto do baralho;
- deve ser a prioridade visual numero `1` do Tijolo `24`.

## 8. Prints mobile

Artefatos finais salvos em `output/playwright/`:

- `cidade23-deck-aco-hand-mobile.png`
- `cidade23-deck-rio-hand-mobile.png`
- `cidade23-board-aco-mobile.png`
- `cidade23-board-rio-mobile.png`
- `cidade23-mini-cards-mobile.png`
- `cidade23-release-candidate-mobile.png`

Leitura consolidada dos prints:

- a mao completa dos dois decks agora funciona como vitrine real do RC visual;
- o tabuleiro confirma que as miniaturas jogadas ja sustentam gameplay sem virar chips abstratos;
- o modo `mini` esta mais limpo com o selo reduzido e menos intrusivo;
- `Aco & Memoria` e `Rio & Rua` mantem contraste interno suficiente sem quebra de linguagem;
- a diferenca entre foto real, composicao real e fallback agora esta clara e diagnosticavel.

## 9. Validacoes executadas

Comandos executados nesta rodada:

```bash
npm run state
npm run game:validate -- cidade-de-aco-cartas-vr
npm run lint
npm run build
```

Resultado final:

- `npm run state`: OK
- `npm run game:validate -- cidade-de-aco-cartas-vr`: OK
- `npm run lint`: OK
- `npm run build`: OK

## 10. Arquivos alterados

- `src/lib/cidadeDeAcoCards.ts`
- `src/components/games/cidade-de-aco/CidadeDeAcoCardView.tsx`
- `src/components/games/CidadeDeAcoCardGame.tsx`
- `reports/TIJOLO_23_CIDADE_DE_ACO_RC_VISUAL.md`

## 11. Pendencias para o Tijolo 24

- produzir e integrar a arte final de `rio_012` para eliminar o unico `fallback_only` do baralho;
- decidir se alguma carta `approved_with_notes` merece refinamento final antes de considerar o deck um fechamento visual de release:
  - `aco_004`
  - `aco_006`
  - `aco_011`
  - `aco_012`
  - `rio_006`
  - `rio_009`
  - `rio_011`
- fazer uma rodada curta de verificacao final com foco so em:
  - thumb de crises
  - landmarks historicos em `contain`
  - estabilidade do carregamento de imagens em listas horizontais

## 12. Conclusao

O Tijolo `23` deixa `Cidade de Aco` em estado claro de **release candidate visual**: o baralho completo ja funciona em mobile, a identidade dos dois decks esta consolidada e a fila de trabalho restante ficou pequena, objetiva e rastreavel.

Se o Tijolo `24` fechar `rio_012` e decidir se alguma carta com ressalva merece retoque final, o jogo passa de RC visual para fechamento quase editorial do baralho.
