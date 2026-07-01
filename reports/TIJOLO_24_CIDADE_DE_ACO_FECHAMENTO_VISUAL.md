# Relatorio do Tijolo 24: Cidade de Aco

Data da verificacao: `2026-06-30`

## 1. Resumo executivo

O Tijolo `24` fechou a ultima pendencia estrutural do baralho visual de `Cidade de Aco: Cronicas de VR`.

Resultado final desta rodada:

- `rio_012` deixou de ser `fallback_only` e agora tem arte integrada;
- o baralho inteiro ficou sem fallback visual;
- a revisao rapida das cartas com ressalva nao exigiu troca de imagem;
- `aco_011` e `rio_011` puderam subir para `release_candidate`;
- `rio_012` entra como `approved_with_notes`, com leitura boa em mobile, mas ainda tratado como composicao controlada de primeira integracao;
- validacoes obrigatorias seguiram passando.

Leitura final do estado do deck:

- o jogo esta pronto para fechamento visual quase editorial;
- as pendencias restantes sao de curadoria fina, nao de bloqueio.

## 2. Estado inicial

Estado confirmado no inicio:

- `rio_012` sem `artPath`;
- status visual anterior: `fallback_only`;
- cartas com ressalva para revisao:
  - `aco_004`
  - `aco_006`
  - `aco_008`
  - `aco_011`
  - `aco_012`
  - `rio_005`
  - `rio_006`
  - `rio_009`
  - `rio_011`

Base herdada do Tijolo `23`:

- RC visual ja estabelecido;
- overlays, contraste de crise e leitura de mini ja melhorados;
- faltava apenas eliminar o fallback de `rio_012` e decidir se algumas ressalvas ainda eram relevantes.

## 3. Decisao final de `rio_012`

Carta: `rio_012` `Chuva de Po`

Decisao:

- status final: `approved_with_notes`
- arquivo final integrado:
  - `public/games/cidade-de-aco-cartas-vr/cards/rio_012-chuva-de-po.jpg`

Justificativa:

- a nova arte entrega bairro realista, telhados, carro, varal e superficies com po fino;
- a carta funciona na mao, em mini e no territorio;
- a imagem evita estetica apocaliptica, incendio, explosao ou fabrica vilanesca generica;
- a poluicao aparece como experiencia territorial e domestica, que era o objetivo do prompt;
- como se trata de composicao controlada e nao foto documental direta, a carta entra aprovada com ressalva, nao como `release_candidate` imediato.

## 4. Fontes e justificativas visuais

Base de curadoria usada para `rio_012`:

- referencias locais de poeira e poluicao urbana usadas durante a rodada:
  - `po-preto-poluicao.jpg`
  - `poluicao-csn-10.webp`
  - `Poluição do Vento em Volta Redonda.png`
  - `Chuva e Risco Ambiental.png`
- criterio visual mantido:
  - bairro de Volta Redonda
  - ceu opaco
  - po fino sobre objetos cotidianos
  - ausencia de rosto identificavel
  - ausencia de dramatizacao cinematografica

## 5. Ajustes realizados

Integracao de arte:

- `src/lib/cidadeDeAcoCards.ts`
  - `rio_012` recebeu `artPath`
  - `rio_012` recebeu `artPosition`
  - `rio_012` recebeu `artFit`
  - `artDirection` foi atualizado para refletir a cena final aprovada

Ajuste tecnico de auditoria:

- `src/components/games/CidadeDeAcoCardGame.tsx`
  - texto do bloco de miniaturas foi atualizado para remover referencia antiga a fallback;
  - blocos de auditoria do Tijolo `24` foram fechados:
    - `cidade-audit-rio012-hand`
    - `cidade-audit-rio012-board`
    - `cidade-audit-approved-notes-review`
    - `cidade-audit-final-deck`
  - o fluxo de captura foi confirmado pelo caminho real do jogo:
    - abrir a rota com `#audit`
    - escolher um deck
    - capturar os paineis internos ja dentro da partida

Nenhuma arte funcional foi trocada nesta rodada.

## 6. Revisao das cartas com ressalva

| carta | decisao final | observacao |
| --- | --- | --- |
| `aco_004` | manter `approved_with_notes` | arquivo historico continua correto, mas perde impacto em thumb |
| `aco_006` | manter `approved_with_notes` | landmark vertical continua dependente de `contain`; nao vale forcar `cover` |
| `aco_008` | manter `approved_with_notes` | carta historica sensivel segue boa, mas depende da curadoria atual |
| `aco_011` | promover para `release_candidate` | filtro tecnico e leitura mobile ja seguram a crise sem virar mancha ilegivel |
| `aco_012` | manter `approved_with_notes` | foto historica e massa cinza seguem menos incisivas em microescala |
| `rio_005` | manter `approved_with_notes` | carta cultural sensivel segue correta e digna, mas continua dependente do enquadramento central |
| `rio_006` | manter `approved_with_notes` | foto oficial correta, porem menos marcante em mini que landmarks mais fortes |
| `rio_009` | manter `approved_with_notes` | cena coletiva continua menos iconica em miniatura |
| `rio_011` | promover para `release_candidate` | leitura no territorio e no painel final ficou suficientemente clara |

## 7. Cartas promovidas para `release_candidate`

- `aco_011`
- `rio_011`

## 8. Cartas mantidas como `approved_with_notes`

- `aco_004`
- `aco_006`
- `aco_008`
- `aco_012`
- `rio_005`
- `rio_006`
- `rio_009`
- `rio_012`

## 9. Prints mobile

Arquivos gerados:

- `output/playwright/cidade24-rio012-hand-mobile.png`
- `output/playwright/cidade24-rio012-board-mobile.png`
- `output/playwright/cidade24-approved-notes-review.png`
- `output/playwright/cidade24-final-deck-mobile.png`

Leitura consolidada dos prints:

- `rio_012` segura bem mao, mini e territorio;
- o territorio de `rio_012` confirma leitura sem estetica de desastre;
- `aco_011` continua escura, mas ja defensavel como carta final de crise;
- `rio_011` ficou mais clara no tabuleiro do que na auditoria anterior;
- o baralho agora aparece sem qualquer carta fallback.
- os PNGs finais foram recapturados em servidor de producao local para evitar ruido visual de ferramentas de desenvolvimento.

## 10. Arquivos criados

- `public/games/cidade-de-aco-cartas-vr/cards/rio_012-chuva-de-po.jpg`
- `output/playwright/cidade24-rio012-hand-mobile.png`
- `output/playwright/cidade24-rio012-board-mobile.png`
- `output/playwright/cidade24-approved-notes-review.png`
- `output/playwright/cidade24-final-deck-mobile.png`
- `reports/TIJOLO_24_CIDADE_DE_ACO_FECHAMENTO_VISUAL.md`

## 11. Arquivos alterados

- `src/lib/cidadeDeAcoCards.ts`
- `src/components/games/CidadeDeAcoCardGame.tsx`

## 12. Validacoes executadas

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

## 13. Pendencias finais para o Tijolo 25

Pendencias restantes:

- decidir se `rio_012` pode subir de `approved_with_notes` para `release_candidate` depois de mais uma rodada de observacao editorial;
- avaliar se vale uma ultima curadoria futura para:
  - `aco_004`
  - `aco_006`
  - `aco_008`
  - `aco_012`
  - `rio_005`
  - `rio_006`
  - `rio_009`
- se o objetivo do Tijolo `25` for fechamento total, ele ja nao precisa criar arte nova; precisa apenas confirmar se as ressalvas remanescentes ficam registradas como curadoria futura e nao como bloqueio.

Fechamento objetivo:

- baralho completo com arte integrada: `sim`
- fallback visual restante: `nao`
- imagem generica aprovada por falta de opcao: `nao`
- jogo segue validando e buildando: `sim`
- pronto para fechamento visual com poucas ressalvas editoriais: `sim`
