# Relatorio do Tijolo 22: Cidade de Aco

Data da verificacao: `2026-06-30`

## 1. Resumo executivo

O Tijolo `22` fechou o **Lote 04 - Memoria, Cultura e Acao Coletiva** no frontend de `Cidade de Aco: Cronicas de VR`, com duas cartas sensiveis tratadas em regime de revisao dura: `aco_008` e `rio_005`.

As duas artes foram integradas no jogo com status final `approved_with_notes`, sem mexer em ranking, gameplay, Unity ou WebGL. A rodada tambem adicionou uma auditoria cruzada para verificar se os lotes `01`, `02`, `03` e `04` ja leem como um card game coerente, e nao como um conjunto de imagens soltas.

Leitura final da etapa:

- `aco_008` sustenta memoria operaria com tensao historica sem cair em iconografia policialesca;
- `rio_005` sustenta lideranca cultural afro-brasileira sem caricatura, fantasia ou estetica turistica;
- a amostra cruzada dos quatro lotes confirma dois blocos visuais reconheciveis:
  - `Aco & Memoria`
  - `Rio & Rua`

## 2. Estado inicial

Antes do Tijolo `22`, o jogo ja tinha tres lotes visuais integrados:

- lote `01`: landmarks reais
- lote `02`: identidade industrial
- lote `03`: rio, bairro e cotidiano

Pendencias desta rodada:

- fechar `aco_008` Greve de 1988 com tratamento historico controlado;
- fechar `rio_005` Mestra da Capoeira com dignidade cultural e ancora territorial;
- auditar a coesao visual conjunta dos quatro lotes em mobile.

## 3. Decisao carta a carta

### `aco_008` Greve de 1988

- arquivo final: `public/games/cidade-de-aco-cartas-vr/cards/aco_008-greve-de-1988.jpg`
- status final: `approved_with_notes`
- decisao: composicao historica controlada, centrada em assembleia operaria diante de portao industrial e massa de trabalhadores, sem rosto identificavel em destaque
- justificativa: a carta precisava vender memoria operaria, tensao coletiva e estrutura industrial sem virar cena de guerra, repressao estetizada ou propaganda partidaria
- leitura final: a plataforma de fala, os capacetes, o portao e o fundo fabril seguram o tema da greve; a ausencia de violencia grafica preserva o limite etico pedido
- ressalva: a imagem final e compositada e nao documental; a aprovacao depende exatamente desse enquadramento controlado

### `rio_005` Mestra da Capoeira

- arquivo final: `public/games/cidade-de-aco-cartas-vr/cards/rio_005-mestra-da-capoeira.jpg`
- status final: `approved_with_notes`
- decisao: roda de capoeira em espaco reconhecivel ligado ao Memorial Zumbi, com mestra em posicao de lideranca corporal, berimbau, atabaque e participantes em roda
- justificativa: a carta precisava ancorar capoeira como cultura afro-brasileira viva e comunitaria, e nao como espetaculo turistico ou fantasia de luta
- leitura final: o arco metalico e a cobertura do memorial ajudam a fixar lugar; a roupa branca, a roda, os instrumentos e a postura da mestra seguram a dignidade cultural
- ressalva: a figura central nao representa pessoa real identificavel; a aprovacao depende de manter esse limite de referencia, nao de retrato

## 4. Fontes e justificativas visuais

### Base territorial e cultural

- [Prefeitura de Volta Redonda - pontos historicos](https://www2.voltaredonda.rj.gov.br/turismo/mod/pontos_historicos/)
- leitura usada:
  - Memorial Zumbi como ancora territorial de `rio_005`
  - Memorial 9 de Novembro como ancora de memoria operaria e do contexto da greve de `1988`

### Capoeira e Memorial Zumbi

- [Prefeitura de Volta Redonda - 1º Festival de Capoeira](https://www.voltaredonda.rj.gov.br/comunicacao/noticias/102-sejuv/10470-1%C2%BA-festival-de-capoeira-encerra-m%C3%AAs-da-juventude-2025-em-volta-redonda/)
- [Prefeitura de Volta Redonda - 36 anos do Memorial Zumbi](https://www.voltaredonda.rj.gov.br/comunicacao/noticias/14-smc/11989-memorial-zumbi-inicia-comemora%C3%A7%C3%B5es-pelos-36-anos-com-reabertura-de-biblioteca-e-apresenta%C3%A7%C3%A3o-cultural-em-volta-redonda/)
- uso na aprovacao:
  - confirmar linguagem arquitetonica do memorial
  - confirmar coerencia entre capoeira e o contexto cultural do espaco

### Referencias locais de memoria operaria

- referencia local de arquivo usada para orientar massa, assembleia e linguagem de greve:
  - `C:\Users\Micro\Downloads\greve.jpg`
  - `C:\Users\Micro\Downloads\Fotos greve de 88-20251101T182028Z-1-001\Fotos greve de 88\_usr_share_nginx_atom_csbh-dados_000324A_141.jpg`
- criterio de selecao:
  - rejeitar imagens onde tropa, confronto ou leitura militarizada virassem o centro estetico
  - preservar portao, concreto, usina, faixa generica e aglomeracao operaria como eixo semantico principal

## 5. Integracao realizada

Arquivos conectados em `src/lib/cidadeDeAcoCards.ts`:

- `aco_008`
  - `artPath`
  - `artPosition`
  - `artFit`
- `rio_005`
  - `artPath`
  - `artPosition`
  - `artFit`

Auditoria adicionada em `src/components/games/CidadeDeAcoCardGame.tsx`:

- `cidade-audit-lote04-hand`
- `cidade-audit-lote04-board`
- `cidade-audit-coesao-geral`

Leitura de integracao:

- `aco_008` conversa bem com `aco_005`, `aco_010` e `aco_012` no bloco `Aco & Memoria`
- `rio_005` conversa bem com `rio_001`, `rio_008` e `rio_010` no bloco `Rio & Rua`
- os quatro lotes juntos ja mostram contraste interno suficiente sem quebra de linguagem de produto

## 6. Prints mobile

Artefatos finais salvos em `output/playwright/`:

- `cidade22-memoria-cultura-hand-audit.png`
- `cidade22-memoria-cultura-board-audit.png`
- `cidade22-coesao-geral-mobile.png`

Leitura consolidada das capturas:

- a carta `aco_008` mantem leitura clara de multidão, plataforma e usina mesmo em miniatura;
- a carta `rio_005` mantem leitura clara de roda, mestra e memorial sem sexualizacao nem folclorizacao;
- o tabuleiro mostra diferenca visual real entre `Aco & Memoria` e `Rio & Rua`, mas dentro de uma mesma linguagem de moldura, contraste e fotografia tratada;
- nao ha rosto identificavel destacado como retrato;
- nao ha estereotipo cultural gritante nas cartas revisadas desta rodada.

## 7. Arquivos criados

- `public/games/cidade-de-aco-cartas-vr/cards/aco_008-greve-de-1988.jpg`
- `public/games/cidade-de-aco-cartas-vr/cards/rio_005-mestra-da-capoeira.jpg`
- `output/playwright/cidade22-memoria-cultura-hand-audit.png`
- `output/playwright/cidade22-memoria-cultura-board-audit.png`
- `output/playwright/cidade22-coesao-geral-mobile.png`
- `reports/TIJOLO_22_CIDADE_DE_ACO_MEMORIA_CULTURA.md`

## 8. Arquivos alterados

- `src/lib/cidadeDeAcoCards.ts`
- `src/components/games/CidadeDeAcoCardGame.tsx`

## 9. Validacoes executadas

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

## 10. Pendencias para o Tijolo 23

- revisar se algum card anterior dos lotes `01` a `03` ainda destoar demais quando comparado diretamente com as novas cartas mais fotograficas;
- decidir se `aco_008` merece no futuro uma base documental licenciada mais direta, caso apareca fonte segura e utilizavel;
- executar uma rodada final de curadoria de texto sobre imagem e consistencia de thumb para o baralho completo, agora que os quatro lotes principais estao visiveis;
- consolidar um fechamento de produto olhando o deck inteiro como release candidate visual, nao apenas como lotes separados.
