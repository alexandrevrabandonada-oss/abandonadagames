# Relatório do Tijolo 21: Cidade de Aço

Data da verificacao: `2026-06-30`

## 1. Resumo executivo

O Tijolo `21` integrou o **Lote 03 - Rio, Bairro e Cotidiano** no frontend de `Cidade de Aco: Cronicas de VR`, consolidando o deck `Rio & Rua` com `7/7` cartas novas visiveis no jogo. A rodada foi fechada sem mexer em ranking, gameplay, Unity ou WebGL.

A decisao visual desta etapa foi hibrida e mais dura em fidelidade local:

- `rio_001` e `rio_004` ficaram ancoradas em foto real do territorio;
- `rio_002`, `rio_003`, `rio_009`, `rio_010` e `rio_011` foram fechadas como composicoes realistas controladas, baseadas em referencias publicas de Volta Redonda e no comportamento visual ja estabelecido no jogo.

## 2. Cartas integradas

Arquivos finais salvos em `public/games/cidade-de-aco-cartas-vr/cards/`:

- `rio_001-curva-do-paraiba.jpg`
- `rio_002-guardia-do-rio.jpg`
- `rio_003-catador-do-pev.jpg`
- `rio_004-menino-do-retiro.jpg`
- `rio_009-roda-de-escuta.jpg`
- `rio_010-mutirao-de-bairro.jpg`
- `rio_011-defesa-do-paraiba.jpg`

As cartas foram conectadas em `src/lib/cidadeDeAcoCards.ts` com `artPath` e `artPosition`, e o modo `#audit` passou a incluir:

- `cidade-audit-lote03-hand`
- `cidade-audit-lote03-board`
- `cidade-audit-lote03-mini-cards`

Arquivo de UI atualizado:

- `src/components/games/CidadeDeAcoCardGame.tsx`

## 3. Proveniencia visual

### `rio_001` Curva do Paraiba

- base final: foto real
- arquivo-base usado: `tmp/tijolo21_refs/curva-paraiba-full.jpg`
- referencia publica confirmada:
  - [Monitor Economico - aniversario de Volta Redonda](https://monitoreconomico.jor.br/volta-redonda-comemora-67-anos-de-emancipacao-com-crescimento-em-todas-as-areas-e-com-muitas-curiosidades/)
- leitura: a curva do Paraiba do Sul aparece de forma inequívoca, com margem urbana e implantacao reconhecivel
- status final: `approved`

### `rio_004` Menino do Retiro

- base final: foto real do Retiro com edicao controlada para inserir a presenca juvenil sem descaracterizar a avenida
- referencia publica confirmada:
  - [A Voz da Cidade - rua de compras no Retiro](https://avozdacidade.com/wp/rua-de-compras-em-vr-pelo-dia-das-criancas-sera-no-retiro/)
- leitura: banner `Bem vindo ao Retiro`, sinalizacao viaria, fios, onibus e comercio local foram preservados
- ressalva: a figura juvenil e compositada sobre a foto real, logo o local e real mas a cena nao e documental pura
- status final: `approved_with_notes`

### `rio_002` Guardiã do Rio

- base final: composicao realista
- ancora: margem do Paraiba, agua barrenta, vegetacao ciliar e distancia urbana
- referencia de lugar:
  - [Monitor Economico - curva do Paraiba em Volta Redonda](https://monitoreconomico.jor.br/volta-redonda-comemora-67-anos-de-emancipacao-com-crescimento-em-todas-as-areas-e-com-muitas-curiosidades/)
- leitura: protege a ideia de cuidado ambiental comunitario sem virar guarda armada nem propaganda
- status final: `approved_with_notes`

### `rio_003` Catador do PEV

- base final: composicao realista
- ancora: rua de bairro, baia de reciclaveis secos e logistica popular
- referencias de ambiente:
  - [Prefeitura de Volta Redonda - programacao de coleta seletiva](https://www.voltaredonda.rj.gov.br/comunicacao/noticias/34-smma/11513-volta-redonda-divulga-nova-programa%C3%A7%C3%A3o-para-coleta-seletiva-de-lixo-domiciliar/)
- leitura: vende trabalho urbano e reciclagem sem miseria estetizada
- status final: `approved_with_notes`

### `rio_009` Roda de Escuta

- base final: composicao realista
- ancora: patio comunitario, cadeiras plasticas, cartazes e cadernos
- leitura: a dinamica coletiva esta clara e os rostos foram mantidos sem destaque frontal
- status final: `approved_with_notes`

### `rio_010` Mutirão de Bairro

- base final: composicao realista
- ancora: rua popular, pintura, varricao, muda e entulho leve
- referencia de energia de trabalho:
  - [Prefeitura de Volta Redonda - Meu Bairro + Limpo](https://www.voltaredonda.rj.gov.br/comunicacao/noticias/25-secom/11359-prefeitura-de-volta-redonda-inicia-mais-uma-etapa-do-projeto-%E2%80%98meu-bairro-limpo%E2%80%99-na-pr%C3%B3xima-semana/)
- leitura: boa carta de acao coletiva sem institucionalismo forte
- status final: `approved_with_notes`

### `rio_011` Defesa do Paraiba

- base final: composicao realista
- ancora: margem do rio, coleta manual, luvas, sacos e faixa ambiental generica
- referencia de territorio:
  - [Monitor Economico - curva do Paraiba em Volta Redonda](https://monitoreconomico.jor.br/volta-redonda-comemora-67-anos-de-emancipacao-com-crescimento-em-todas-as-areas-e-com-muitas-curiosidades/)
- leitura: funciona como defesa civil-popular do rio, nao como protesto espetacularizado
- status final: `approved_with_notes`

## 4. Auditoria mobile

Artefatos salvos em `output/playwright/`:

- `cidade21-lote03-hand-audit.png`
- `cidade21-lote03-board-audit.png`
- `cidade21-lote03-mini-cards.png`
- `cidade21-audit-mobile.png`

Leitura consolidada das capturas:

- `rio_001`, `rio_002`, `rio_003` e `rio_004` seguram leitura boa tanto em carta cheia quanto em mini;
- `rio_009` continua deliberadamente menos frontal para evitar rostos destacados, mas a roda permanece legivel;
- `rio_010` e `rio_011` sao as cartas de acao coletiva mais fortes do lote em leitura mobile;
- o territorio `Rio em Recuperacao` agora recebe um bloco visual coerente com a identidade `Rio & Rua`.

## 5. Validacoes executadas

Comandos reexecutados:

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

## 6. Estado resultante do jogo

Depois do Tijolo `21`, `Cidade de Aco` fica assim:

- lote `01`: landmarks reais integrados
- lote `02`: bloco industrial integrado
- lote `03`: bloco `Rio, Bairro e Cotidiano` integrado

Leitura pratica:

- o deck `Rio & Rua` deixa de depender de placeholders conceituais em parte central do baralho;
- o jogo passa a ter dois polos visuais mais definidos:
  - `Aco & Memoria`
  - `Rio & Rua`
- a proxima rodada pode focar mais em refinamento fino e fechamento de pendencias do que em ausencia bruta de arte.

## 7. Conclusao

O Tijolo `21` fecha um avanço estrutural do jogo: `Cidade de Aco` agora mostra nao apenas industria e memoria, mas tambem rio, bairro, cuidado e cotidiano com um nivel de aderencia local suficiente para sustentar auditoria mobile e leitura de produto publicado.
