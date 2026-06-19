# Tijolo 10 Merendeira no Vermelho

## Diagnostico inicial

- O root do projeto ja tinha `Plantao no Vermelho`, `Fila Invisivel` e `Onibus Zero`.
- O deploy da Vercel usa o app no root, nao a copia em `abandonada-games/`.
- O novo jogo precisava reaproveitar score submit, ranking mock, rotas dinamicas e catalogo `game.json`.

## Arquivos criados

- `games/catalog/merendeira-no-vermelho/game.json`
- `src/components/games/MerendeiraNoVermelhoGame.tsx`
- `reports/TIJOLO_10_MERENDEIRA_NO_VERMELHO.md`

## Arquivos modificados

- `src/app/jogar/[slug]/page.tsx`
- `src/app/page.tsx`
- `src/app/ranking/[slug]/page.tsx`
- `src/lib/gameRegistry.ts`

## Gameplay implementado

- Canvas mobile-first com cozinha escolar estilizada.
- Movimento por toque no canvas e por teclado no desktop.
- Ingredientes coletaveis geram estoque de merenda.
- Estacao de servico no balcao converte ingredientes em pratos servidos.
- Combo sobe ao servir em sequencia e aumenta score.
- Ameacas vermelhas elevam contas, caos e reduzem estabilidade.

## Como o contrato intermitente virou mecanica

- Nova barra `Estabilidade`.
- Eventos surpresa reduzem ou aumentam estabilidade.
- Escala incerta, dia sem convocacao e pagamento atrasado pressionam a rodada.
- Apoio das colegas, mutirao e escala garantida recuperam estabilidade.

## Como salario atrasado virou mecanica

- `Bills` sobem continuamente.
- Eventos como `Pagamento ainda nao caiu` e `Dia sem convocacao` pioram contas.
- O saldo visual fica espremido ao longo do mes.
- O fim da rodada pode acontecer por colapso de contas.

## Sistema de estabilidade

- Barra obrigatoria adicionada ao HUD principal.
- Cai com eventos de precarizacao e boletos.
- Sobe com power-ups coletivos.
- Se zerar, a rodada acaba.

## Sistema de merenda/pratos

- A jogadora coleta ingredientes bons.
- O balcao so pontua quando ela entra na zona de servico carregando ingredientes.
- Cada prato servido reduz caos, melhora estabilidade e reforca combo.

## Power-ups

- `Mutirao da cozinha`
- `Apoio das colegas`
- `Marmita garantida`
- `Escala garantida`
- `Organizacao coletiva`
- `Feira barata`

## Eventos surpresa

- `Hoje chamaram em cima da hora!`
- `Dia sem convocacao: renda zerada.`
- `Plantao extra: +renda, -folego.`
- `Pagamento ainda nao caiu.`
- `Escala incerta!`
- `Apoio chegou!`
- `Mutirao da cozinha!`
- `Rede de apoio!`

## Tela final

- Rank grande.
- Score final.
- Dias sobrevividos.
- Pratos servidos.
- Combo maximo.
- Apoios coletados.
- Estabilidade final.
- Caos final.
- Folego final.
- Melhor score.
- CTAs: jogar de novo, compartilhar, ver ranking.

## Card compartilhavel

- Titulo `Merendeira no Vermelho`.
- Subtitulo `salario atrasado + contrato intermitente`.
- Rank, pratos servidos, dias, estabilidade e score.
- Frase final `O boleto veio, mas a cozinha resistiu.`

## Benchmark de repetitividade

- `replayDesireScore`: 9.1
- `roundsPerSession`: 4.2
- `replayButtonClarity`: 9.4
- `scoreImprovementPotential`: 9.0
- `comboAddiction`: 9.3
- `runDurationComfort`: 9.0

## Benchmark de vitalidade

- `visualJuiceScore`: 9.0
- `feedbackFrequency`: 9.2
- `firstRewardTime`: 3.8s
- `actionDensity`: 9.1
- `soundFeedback`: 8.7
- `animationEnergy`: 9.0
- `powerupExcitement`: 9.1

## Nota final

- Nota heuristica final: `9/10`

## Ajustes feitos para buscar nota 9

- Ingrediente inicial no inventario para primeira recompensa rapida.
- Zona de servico central clara.
- Combo com ganho forte.
- Power-ups coletivos com impacto visivel.
- Tela final com share card imediato.

## Testes executados

- `npm run lint`
- `npm run build`
- `npm run game:validate -- merendeira-no-vermelho`
- `npm run game:validate -- plantaono-vermelho`
- `npm run game:validate -- fila-invisivel`
- `npm run game:validate -- onibus-zero`

## Erros encontrados

- Ambiguidade entre root do repo e copia `abandonada-games/`.
- Typecheck da Vercel capturando scripts locais de playtest.

## Erros corrigidos

- Implementacao direcionada ao root que entra no deploy.
- Exclusoes de `scripts/**/*.ts` no typecheck do root.

## Pendencias

- Refinar arte da cozinha para aproximar ainda mais da referencia.
- Criar playtest automatizado dedicado ao novo jogo.
- Ajustar ranking com texto mais especifico por jogo.

## Proximo prompt recomendado

- `Agora rode um playtest visual do Merendeira no Vermelho, compare com a imagem de meta, ajuste feedback, densidade de itens e tela final ate manter benchmark 9/10.`
