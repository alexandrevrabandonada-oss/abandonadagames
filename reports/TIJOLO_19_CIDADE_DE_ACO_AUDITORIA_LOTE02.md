# Relatório do Tijolo 19: Cidade de Aço

Data da verificacao: `2026-06-30`

## 1. Resumo executivo

O Tijolo 19 consolidou duas frentes. Primeiro, a auditoria mobile do Lote `01` confirmou que as fotos reais funcionam bem na mao e continuam fiéis aos landmarks, mas revelou um gargalo de UI no tabuleiro: o território ainda dava destaque demais ao bloco vazio superior e pouco espaço cognitivo para as cartas jogadas. Segundo, o Lote `02` saiu do zero e ganhou uma primeira rodada pragmática de integração com `3` artes históricas/reais aprovadas com notas, sem forçar aprovação de peças fracas.

O resultado prático é que `Cidade de Aco` agora mostra foto real tanto na mao quanto dentro do território em gameplay e já começou a construir a identidade visual do deck industrial com base factual, sem cair em sci-fi genérico.

## 2. Estado inicial

Estado confirmado no início desta rodada:

- o Lote `01` já estava integrado com `6` fotos reais:
  - `aco_005`
  - `aco_006`
  - `aco_007`
  - `rio_006`
  - `rio_007`
  - `rio_008`
- o frontend já suportava:
  - `artPath`
  - `artPosition`
  - `artFit`
  - filtro leve de foto real
- o jogo já passava em:
  - `npm run state`
  - `npm run game:validate -- cidade-de-aco-cartas-vr`
  - `npm run lint`
  - `npm run build`

Limitação detectada antes da auditoria:

- as cartas jogadas no território ainda não exibiam arte; o tabuleiro mostrava apenas chips textuais.

## 3. Auditoria do Lote 01

### Leitura geral

Conclusão consolidada da auditoria:

- as fotos reais funcionam melhor na mao do que no tabuleiro;
- a fidelidade dos landmarks está boa;
- o filtro atual ajuda a unificar o baralho e não destrói a leitura factual;
- a principal fricção não estava nas imagens, mas no layout do território.

### Carta a carta

#### `aco_005` Obelisco da Praça Brasil

1. aparece bem na mão: sim
2. continua reconhecível em tamanho pequeno: sim, embora o obelisco fique no limite da miniatura
3. o texto compete com a foto: pouco
4. o filtro ajuda ou atrapalha: ajuda
5. `artPosition` precisa ajuste: não nesta rodada
6. `artFit` atual é o melhor: sim, `cover`
7. parece parte do mesmo baralho: sim
8. parece foto crua demais ou card game demais: equilibrado
9. o landmark continua fiel: sim
10. funciona em gameplay real: sim

#### `aco_006` Chaminé Antiga

1. aparece bem na mão: sim
2. continua reconhecível em tamanho pequeno: sim
3. o texto compete com a foto: não
4. o filtro ajuda ou atrapalha: ajuda
5. `artPosition` precisa ajuste: não
6. `artFit` atual é o melhor: sim, `contain`
7. parece parte do mesmo baralho: sim
8. parece foto crua demais ou card game demais: equilibrado
9. o landmark continua fiel: sim, sem crop destrutivo
10. funciona em gameplay real: sim

#### `aco_007` Memorial 9 de Novembro

1. aparece bem na mão: sim
2. continua reconhecível em tamanho pequeno: sim, mas o volume do monumento já entra no limite da leitura micro
3. o texto compete com a foto: pouco
4. o filtro ajuda ou atrapalha: ajuda
5. `artPosition` precisa ajuste: não
6. `artFit` atual é o melhor: sim
7. parece parte do mesmo baralho: sim
8. parece foto crua demais ou card game demais: equilibrado
9. o landmark continua fiel: sim
10. funciona em gameplay real: sim

#### `rio_006` Parque do Ingá

1. aparece bem na mão: sim
2. continua reconhecível em tamanho pequeno: razoavelmente
3. o texto compete com a foto: não
4. o filtro ajuda ou atrapalha: ajuda
5. `artPosition` precisa ajuste: não nesta rodada
6. `artFit` atual é o melhor: sim
7. parece parte do mesmo baralho: sim
8. parece foto crua demais ou card game demais: ligeiramente mais crua que os demais
9. o landmark continua fiel: sim
10. funciona em gameplay real: com ressalva; é o landmark menos marcante em miniatura

#### `rio_007` Memorial Zumbi

1. aparece bem na mão: sim
2. continua reconhecível em tamanho pequeno: sim
3. o texto compete com a foto: não
4. o filtro ajuda ou atrapalha: ajuda
5. `artPosition` precisa ajuste: não
6. `artFit` atual é o melhor: sim
7. parece parte do mesmo baralho: sim
8. parece foto crua demais ou card game demais: equilibrado
9. o landmark continua fiel: sim
10. funciona em gameplay real: sim

#### `rio_008` Cinema 9 de Abril

1. aparece bem na mão: sim
2. continua reconhecível em tamanho pequeno: sim
3. o texto compete com a foto: pouco
4. o filtro ajuda ou atrapalha: ajuda
5. `artPosition` precisa ajuste: não
6. `artFit` atual é o melhor: sim, `cover`
7. parece parte do mesmo baralho: sim
8. parece foto crua demais ou card game demais: equilibrado
9. o landmark continua fiel: sim
10. funciona em gameplay real: sim

### Achado principal da auditoria

O maior problema não era a foto e nem o filtro. O maior problema era a composição do território:

- cards jogados ainda estavam baixos demais na hierarquia visual;
- a faixa hero do território ocupava altura excessiva no mobile;
- isso empurrava a leitura da carta jogada para baixo da dobra de atenção.

## 4. Ajustes feitos em `artPosition` e `artFit`

Nenhum ajuste adicional de `artPosition` ou `artFit` foi necessário no Lote `01` nesta rodada.

O estado final mantido foi:

- `aco_005`: `cover`
- `aco_006`: `contain`
- `aco_007`: `cover`
- `rio_006`: `cover`
- `rio_007`: `cover`
- `rio_008`: `cover`

No Lote `02`, a integração inicial usou:

- `aco_004`: `contain`
- `aco_010`: `cover`
- `aco_012`: `cover`

## 5. Mudanças no componente de carta e tabuleiro

Arquivos alterados:

- `src/components/games/cidade-de-aco/CidadeDeAcoCardView.tsx`
- `src/components/games/cidade-de-aco/CidadeDeAcoTerritoryView.tsx`
- `src/components/games/CidadeDeAcoCardGame.tsx`
- `src/lib/cidadeDeAcoCards.ts`

Mudanças realizadas:

- `CidadeDeAcoCardView` passou a suportar modo `mini` para preview de tabuleiro
- `CidadeDeAcoCardView` agora renderiza `div` não interativa quando não há `onClick`
- `CidadeDeAcoTerritoryView` deixou de mostrar só chips e passou a renderizar cartas reais jogadas
- a área superior do território foi compactada no mobile com `aspect-[16/5]` para reduzir espaço morto
- foi criado um modo de auditoria por hash `#audit` para capturas reproduzíveis do Lote `01` e da primeira leva do Lote `02`

Conclusão dessa mudança:

- agora existe auditoria real de foto no território;
- o tabuleiro continua leve, mas parou de esconder a carta jogada.

## 6. Status carta a carta do Lote 02

### `aco_001` Arigó

- status: `not_generated`
- leitura: ainda sem base segura que venda o arquétipo sem usar pessoa real identificável

### `aco_002` Operária da Laminação

- status: `not_generated`
- leitura: não foi aprovada foto real de pessoa; precisa composição nova ou geração endurecida

### `aco_003` Mestre do Alto-Forno

- status: `not_generated`
- leitura: referências de alto-forno existem, mas ainda não entregam o personagem

### `aco_004` Cronista da Cidade Operária

- status: `approved_with_notes`
- arte integrada: `public/games/cidade-de-aco-cartas-vr/cards/aco_004-cronista-cidade-operaria.jpg`
- base usada: página histórica de `O Lingote`
- nota: funciona melhor como memória de arquivo do que como personagem pleno; pode ser refinada em rodada futura

### `aco_009` Turno Virado

- status: `not_generated`
- leitura: ainda falta imagem segura que venda troca de turno sem pessoa real identificável

### `aco_010` Cidade de Aço

- status: `approved_with_notes`
- arte integrada: `public/games/cidade-de-aco-cartas-vr/cards/aco_010-cidade-de-aco.jpg`
- base usada: foto histórica industrial da CSN
- nota: a identidade industrial entra forte; a origem exata do arquivo deve ser formalizada melhor no próximo tijolo

### `aco_011` Sirene da Usina

- status: `not_generated`
- leitura: referências noturnas de usina consultadas não vendem a sirene como objeto principal

### `aco_012` Peso do Concreto

- status: `approved_with_notes`
- arte integrada: `public/games/cidade-de-aco-cartas-vr/cards/aco_012-peso-do-concreto.jpg`
- base usada: foto histórica do centro comercial / massa modernista de Vila Santa Cecília
- nota: entrega o peso urbano e o concreto planejado; pode ganhar opção mais brutalista no futuro

## 7. Artes aprovadas

Artes que entraram no frontend como arte principal nesta rodada:

- `aco_004-cronista-cidade-operaria.jpg`
- `aco_010-cidade-de-aco.jpg`
- `aco_012-peso-do-concreto.jpg`

Todas entraram como `approved_with_notes`, não como aprovação plena.

## 8. Artes rejeitadas

Nenhuma arte foi integrada e depois rejeitada formalmente no frontend.

Referências descartadas como arte principal nesta rodada:

- fotos puramente ambientais de alto-forno para `aco_003`, porque não vendem o personagem
- vistas noturnas de usina sem sirene legível para `aco_011`
- referências humanas diretas para `aco_001`, `aco_002` e `aco_009`, por conflito com a regra de evitar pessoa real identificável

## 9. Prints mobile gerados

Arquivos finais salvos em `output/playwright/`:

- `output/playwright/cidade19-lote01-hand-audit.png`
- `output/playwright/cidade19-lote01-board-audit.png`
- `output/playwright/cidade19-lote02-hand-audit.png`
- `output/playwright/cidade19-lote02-board-audit.png`
- `output/playwright/cidade19-result-mobile.png`

Leitura prática dos prints:

- o Lote `01` mantém boa fidelidade na mão;
- a Chaminé confirma que `contain` era a decisão correta;
- o tabuleiro passou a exibir cartas reais sem depender só de chips;
- o Lote `02` já mostra um começo coerente de identidade industrial, mas ainda parcial.

## 10. Validações executadas

Comandos finais reexecutados:

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

## 11. Pendências para o Tijolo 20

Fila objetiva para a próxima rodada:

1. manter o padrão do território agora que a carta real já aparece em gameplay
2. fechar fonte melhor ou alternativa para `rio_006`, que ainda é o landmark menos marcante em miniatura
3. produzir composições seguras para `aco_001`, `aco_002`, `aco_003`, `aco_009` e `aco_011`
4. formalizar melhor a proveniência dos arquivos históricos do Lote `02`
5. só então avançar para `Tijolo 20 — Lote 03: Rio, Bairro e Cotidiano`

## 12. Conclusão

O Tijolo 19 foi bem-sucedido porque resolveu uma lacuna real de produto: as cartas agora podem ser auditadas como carta de mao e como carta jogada no território. Ao mesmo tempo, o Lote `02` não foi tratado como preenchimento de tabela; apenas `3` peças com lastro visual suficiente entraram no jogo, todas com ressalvas explicitadas. O baralho industrial começou a ganhar corpo sem sacrificar fidelidade nem rigor de aprovação.
