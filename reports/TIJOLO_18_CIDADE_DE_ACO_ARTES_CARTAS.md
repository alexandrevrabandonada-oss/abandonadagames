# Relatório do Tijolo 18: Cidade de Aço

Data da verificacao: `2026-06-29`

## 1. Resumo executivo
O Tijolo 18 saiu do nivel de planejamento de arte e entrou em execucao real de imagens com revisao visual carta a carta. O foco desta rodada foi o lote de landmarks de `Cidade de Aco: Cronicas de VR`, especialmente os casos em que a geracao inicial se afastou demais dos lugares e monumentos reais de Volta Redonda.

A decisao de direcao foi endurecida: estilizar apenas luz, textura, cor e atmosfera, sem redesenhar forma, silhueta, volumetria ou composicao dos landmarks. Com isso, o loop atual produziu candidatas de revisao para os `6` landmarks do lote `01`, com ganho mais forte em `aco_005`, `aco_007`, `rio_007`, `aco_006` e `rio_008`. O caso que ainda pede maior refinamento fino e `rio_006`, que melhorou como parque urbano, mas ainda pode ganhar identidade local mais especifica.

## 2. Diagnóstico desta rodada
Os principais desvios detectados nas primeiras geracoes foram:

- monumentos inventando esculturas heroicas que nao existem no local real;
- massa arquitetonica ficando mais monumental ou mais vertical do que a obra verdadeira;
- cenarios urbanos ganhando dramatizacao excessiva;
- perda de leitura do landmark real em favor de uma cena conceitual genérica.

O problema nao era falta de beleza. O problema era fidelidade estrutural.

## 3. Referencias reais confirmadas
As correcoes desta rodada foram guiadas por fontes oficiais ou locais de referencia:

- `aco_005` Obelisco da Praca Brasil:
  [Praca Brasil - Cultura VR](https://cultura.voltaredonda.rj.gov.br/pracabrasil/)
  e [Turismo e patrimonio de Volta Redonda](https://turismo.voltaredonda.rj.gov.br/cultura-patrimonio/)
- `aco_007` Memorial 9 de Novembro:
  [Fundacao Oscar Niemeyer - Monumento IX de Novembro](https://www.oscarniemeyer.org.br/obra/pro309)
  e [Pontos historicos de Volta Redonda](https://www2.voltaredonda.rj.gov.br/turismo/mod/pontos_historicos/)
- `rio_007` Memorial Zumbi dos Palmares:
  [Cultura VR - Memorial Zumbi dos Palmares](https://cultura.voltaredonda.rj.gov.br/memorialzumbipalmares/)
  e [Memorial Zumbi revitalizado - Prefeitura VR](https://www.voltaredonda.rj.gov.br/comunicacao/noticias/14-smc/11643-prefeitura-de-volta-redonda-entrega-memorial-zumbi-revitalizado-%C3%A0-popula%C3%A7%C3%A3o/)
- `aco_006` Chamine Antiga:
  [Turismo e patrimonio de Volta Redonda](https://turismo.voltaredonda.rj.gov.br/cultura-patrimonio/)
  e [Joias Raras - Chamine da Antiga Olaria](https://www.joiasrarasvoltaredonda.com.br/chamine-da-antiga-olaria/)
- `rio_006` Parque do Inga:
  [Parque Natural Municipal Fazenda Santa Cecilia do Inga](https://www2.voltaredonda.rj.gov.br/smma/10-interno/17-parque-natural-municipal-fazenda-santa-cecilia-do-inga)
- `rio_008` Cinema 9 de Abril:
  [Cultura VR - Cine 9 de Abril](https://cultura.voltaredonda.rj.gov.br/cine9deabril/)
  e [Joias Raras - Cinema Nove de Abril](https://www.joiasrarasvoltaredonda.com.br/cinema-nove-de-abril/)

## 4. Ajustes de pipeline realizados
Arquivos de prompt endurecidos nesta fase:

- `games/catalog/cidade-de-aco-cartas-vr/art-prompts.json`
- `games/catalog/cidade-de-aco-cartas-vr/art-prompts.pt-BR.json`
- `games/catalog/cidade-de-aco-cartas-vr/art-lots/lote-01-landmarks.json`

Diretriz adicionada ao lote:

- preservar forma, silhueta, volumetria e composicao reais dos landmarks;
- estilizar apenas luz, textura, cor e atmosfera.

## 5. Status por carta do lote 01
Leitura atual dos landmarks revisados:

- `aco_005` Obelisco da Praca Brasil:
  melhorou bem na versao `v3`; a leitura do obelisco e da piscina voltou para algo proximo do local real; ainda pode receber refinamento fino de layout da praca, mas ja virou candidata forte.
- `aco_006` Chamine Antiga:
  a versao `v2` corrigiu bem o principal erro; a chamine deixou de parecer monumento de praca e passou a ler melhor como remanescente industrial urbano preservado.
- `aco_007` Memorial 9 de Novembro:
  a nova versao ficou significativamente mais proxima do monumento real; saiu da leitura de escultura gigante e voltou para memorial baixo, concreto e em espelho d'agua.
- `rio_006` Parque do Inga:
  a versao `v2` melhorou ao incluir viveiro, trilha molhada e estrutura de apoio, reforcando parque urbano manejado; ainda e o caso com maior margem para refinamento fino de identidade.
- `rio_007` Memorial Zumbi dos Palmares:
  a nova versao corrigiu o erro estrutural mais grave; deixou de ser estatua heroica e passou a mostrar o pavilhao com arco metalico, muito mais alinhado ao memorial real.
- `rio_008` Cinema 9 de Abril:
  a versao `v2` consolidou melhor a fachada modernista, a marquise e a implantacao de rua; hoje ja e candidata forte para aprovacao.

## 6. Candidatas salvas no workspace
Arquivos de revisao salvos para esta rodada:

- `output/cidade-de-aco/art-review/aco_005-obelisco-praca-brasil-v3-review.png`
- `output/cidade-de-aco/art-review/aco_007-memorial-9-novembro-v3-review.png`
- `output/cidade-de-aco/art-review/rio_007-memorial-zumbi-v3-review.png`

Essas tres imagens representam o melhor estado atual dos casos mais problemáticos desta bateria.

Segunda bateria salva nesta rodada:

- `output/cidade-de-aco/art-review/aco_006-chamine-antiga-v2-review.png`
- `output/cidade-de-aco/art-review/rio_006-parque-do-inga-v2-review.png`
- `output/cidade-de-aco/art-review/rio_008-cinema-9-de-abril-v2-review.png`

Com isso, o lote `01` agora tem cobertura completa de candidatas no workspace.

## 7. Estado atual de integracao
O jogo ja tem:

- catalogo jogavel publicado;
- prompts e manifest de arte consolidados;
- lote 01 em geracao e revisao real;
- candidatas visuais salvas no workspace para os `6` landmarks do lote.

O jogo ainda nao tem:

- aprovacao final de todas as artes dos lotes seguintes;
- revalidacao visual final do jogo com as artes reais dentro da interface.

Integracao minima ja realizada para o lote `01`:

- `6` imagens copiadas para `public/games/cidade-de-aco-cartas-vr/cards/`;
- `src/lib/cidadeDeAcoCards.ts` passou a expor `artPath` para as cartas com arte aprovada nesta fase;
- `src/components/games/cidade-de-aco/CidadeDeAcoCardView.tsx` passou a renderizar imagem real com fallback textual.

Refino extra de interface realizado apos auditoria visual:

- a area de arte do card foi ampliada;
- o overlay textual dentro da imagem foi reduzido para nao competir com a ilustracao;
- a auditoria confirmou que o problema residual estava mais na UI do card do que na qualidade dos assets.

## 8. Validacoes executadas
Comandos reexecutados nesta rodada:

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

Auditoria visual mobile com Playwright:

- `output/playwright/cidade18-aco-hand-art-check-v2.png`
- `output/playwright/cidade18-rio-hand-art-check-v2.png`

Leitura pratica dessas capturas:

- `Aco & Memoria` mostrou `Memorial 9 de Novembro` e `Obelisco da Praca Brasil` integrados com leitura visual aceitavel;
- `Rio & Rua` mostrou `Memorial Zumbi` integrado com leitura visual melhor apos a limpeza do overlay;
- depois do ajuste da UI, as artes passaram a respirar melhor dentro do card mobile.

## 9. Proximo loop recomendado
Prioridade imediata:

1. revisar `aco_006`, `rio_006` e `rio_008` com o mesmo nivel de ancoragem real usado nesta rodada;
2. decidir se `rio_006` precisa mais uma rodada ou se ja entra como aprovado com ressalvas;
3. repetir o mesmo fluxo nos lotes `02` a `05`;
4. rodar Playwright novamente para validar legibilidade mobile com arte real;
5. substituir progressivamente as cartas ainda textuais por artes finais.

## 10. Conclusao
O Tijolo 18 deixou de ser apenas plano de arte e passou a operar como loop de correcao visual orientado por referencia real. O maior ganho desta rodada foi metodologico: a equipe agora tem prompts endurecidos, tres candidatas fortes salvas no workspace e um criterio claro de qualidade para continuar aproximando as cartas dos landmarks reais sem descaracterizar os monumentos.

## 11. Atualizacao de 2026-06-30
Nesta rodada a direcao mudou mais um passo: as `6` cartas de landmark do lote `01` deixaram de usar ilustracoes geradas como arte principal e passaram a usar fotos reais dos locais, com apenas um tratamento visual leve aplicado na UI do card.

Arquivos reais integrados no frontend:

- `public/games/cidade-de-aco-cartas-vr/cards/aco_005-praca-brasil-historica.jpg`
- `public/games/cidade-de-aco-cartas-vr/cards/aco_006-chamine-antiga.jpg`
- `public/games/cidade-de-aco-cartas-vr/cards/aco_007-memorial-9-novembro.jpg`
- `public/games/cidade-de-aco-cartas-vr/cards/rio_006-parque-do-inga.jpeg`
- `public/games/cidade-de-aco-cartas-vr/cards/rio_007-memorial-zumbi.jpg`
- `public/games/cidade-de-aco-cartas-vr/cards/rio_008-cinema-9-de-abril.jpg`

Ajustes tecnicos aplicados:

- `src/lib/cidadeDeAcoCards.ts` passou a suportar `artPosition` e `artFit`;
- `CidadeDeAcoCardView` passou a respeitar enquadramento por carta e `object-contain` para casos verticais como a chaminé;
- o tratamento visual agora e um filtro uniforme e leve na UI, sem redesenhar forma, volumetria ou composicao dos landmarks.

Referencias reais usadas nesta substituicao:

- `aco_005` Praca Brasil: foto historica local do obelisco em enquadramento frontal amplo;
- `aco_006` Chamine Antiga: foto real local ja confirmada nas pesquisas da rodada anterior;
- `aco_007` Memorial 9 de Novembro: foto real do memorial com espelho d'agua e edificio ao fundo;
- `rio_006` Parque do Inga: foto oficial externa da Prefeitura de Volta Redonda, extraida de [noticia oficial de 2025](https://www.voltaredonda.rj.gov.br/comunicacao/noticias/34-smma/9486-secretaria-de-meio-ambiente-de-volta-redonda-atua-na-revitaliza%C3%A7%C3%A3o-do-parque-do-ing%C3%A1/);
- `rio_007` Memorial Zumbi: foto real com arco metalico, cobertura tensionada e gradil frontal;
- `rio_008` Cine 9 de Abril: foto real da fachada modernista usada como referencia exata do landmark.

Validacoes reexecutadas apos a substituicao:

```bash
npm run state
npm run lint
npm run build
npm run game:validate -- cidade-de-aco-cartas-vr
```

Resultado:

- `npm run state`: OK
- `npm run lint`: OK
- `npm run build`: OK
- `npm run game:validate -- cidade-de-aco-cartas-vr`: OK

Estado pratico apos esta rodada:

- o lote `01` agora esta integrado com landmarks fotografados, nao apenas reconstruidos;
- a carta da chaminé preserva a forma real sem crop destrutivo;
- o parque continua sendo o caso mais sensivel de leitura, mas agora usa foto oficial externa do local, o que melhora fidelidade factual.
