# Relatório do Tijolo 20: Cidade de Aço

Data da verificacao: `2026-06-30`

## 1. Resumo executivo

O Tijolo 20 fechou a integracao visual do Lote `02` Industrial em estado utilizavel dentro do jogo, sem forcar aprovacao plena onde a proveniencia ainda e parcial. O baralho `Aco & Memoria` agora entra em auditoria mobile com `8/8` cartas do lote mostrando arte no frontend, combinando `3` imagens historicas/reais mantidas com notas e `5` composicoes seguras novas, ancoradas em referencias locais e objetos/ambientes reais da cidade industrial.

Tambem foi feita a curadoria final de `rio_006` Parque do Inga. A decisao desta rodada foi **manter a foto oficial atual** em vez de substituir por uma imagem gerada mais chamativa, porque a politica adotada nas ultimas rodadas prioriza foto real dos lugares sempre que a alternativa gerada nao trouxer um ganho inequívoco sem perder aderencia factual.

## 2. Estado atual do jogo

Estado pratico apos esta rodada:

- o Lote `01` continua integrado com `6` fotos reais;
- o Lote `02` agora esta integrado com `8` artes no frontend;
- o modo `#audit` agora cobre:
  - mao do Lote `02`
  - territorio com cartas industriais
  - miniaturas do Lote `02`
  - comparacao isolada do `Parque do Inga`
- o jogo continuou validando em:
  - `npm run state`
  - `npm run game:validate -- cidade-de-aco-cartas-vr`
  - `npm run lint`
  - `npm run build`

Arquivos principais consolidados nesta rodada:

- `src/lib/cidadeDeAcoCards.ts`
- `src/components/games/CidadeDeAcoCardGame.tsx`
- `public/games/cidade-de-aco-cartas-vr/cards/`

## 3. Proveniencia das artes ja integradas

### `aco_004` Cronista da Cidade Operaria

- arquivo integrado: `public/games/cidade-de-aco-cartas-vr/cards/aco_004-cronista-cidade-operaria.jpg`
- origem local usada: `C:\Users\Micro\Downloads\O-Lingote-3-edicao-25-de-abril-1953-volta-redonda.jpg`
- tipo de fonte: pagina historica de jornal operario / acervo digital local
- apoio publico confirmado:
  - Museu do Trabalhismo, colecao `O Lingote`
  - referencia institucional sobre `O Lingote` em materiais da Cultura de Volta Redonda
- leitura de uso: segura como memoria grafica e documento historico editado; nao e retrato fotografico cru de pessoa em alta definicao
- risco: proveniencia do arquivo local esta bem ancorada no acervo correto, mas o link exato da pagina usada nao foi rastreado linha a linha nesta rodada
- precisa substituicao futura: nao obrigatoria
- status final: `approved_with_notes`

### `aco_010` Cidade de Aco

- arquivo integrado: `public/games/cidade-de-aco-cartas-vr/cards/aco_010-cidade-de-aco.jpg`
- origem local usada: `C:\Users\Micro\Downloads\34-CSN.jpg`
- tipo de fonte: foto industrial historica local, skyline fabril
- apoio publico confirmado:
  - pagina oficial da CSN sobre `Unidades Fabris`
  - registros institucionais e historicos da cidade sobre a centralidade da UPV/CSN
- leitura de uso: a imagem entrega bem a massa industrial e a identidade da carta
- risco: a origem editorial exata do arquivo `34-CSN.jpg` continua incompleta; nesta rodada foi possivel confirmar coerencia estrutural, nao cadeia completa de publicacao
- precisa substituicao futura: recomendavel apenas se surgir a mesma vista com proveniencia mais forte
- status final: `approved_with_notes`

### `aco_012` Peso do Concreto

- arquivo integrado: `public/games/cidade-de-aco-cartas-vr/cards/aco_012-peso-do-concreto.jpg`
- origem local usada: `C:\Users\Micro\Downloads\43-Decada-60-Vila-Santa-Cecilia-Centro-Comercial.jpg`
- tipo de fonte: foto historica urbana / vista aerea do centro comercial e da massa modernista da Vila Santa Cecilia
- apoio publico confirmado:
  - Turismo oficial sobre o centro comercial de Vila Santa Cecilia
  - pagina de historia/cultura local com exposicao de imagens das decadas de `40` a `60`
- leitura de uso: a base historica conversa diretamente com urbanismo operario e peso arquitetonico
- risco: o arquivo integrado veio de coleta local; a origem editorial exata da fotografia historica ainda nao foi fechada com assinatura de acervo
- precisa substituicao futura: baixa urgencia
- status final: `approved_with_notes`

## 4. Fechamento do Lote 02

### 4.1 Novas cartas integradas

Arquivos novos salvos em `public/games/cidade-de-aco-cartas-vr/cards/`:

- `aco_001-arigo.jpg`
- `aco_002-operaria-da-laminacao.jpg`
- `aco_003-mestre-do-alto-forno.jpg`
- `aco_009-turno-virado.jpg`
- `aco_011-sirene-da-usina.jpg`

As `5` artes novas foram produzidas como `Composicao real`, usando ancoragem factual em:

- construcao da vila operaria e migracao trabalhadora;
- alto-forno e maquinario da UPV/CSN;
- atmosfera fabril noturna;
- rotina de portaria, relogio de ponto e troca de turno;
- sirene industrial como objeto de alerta fabril, nao policial.

### 4.2 Status carta a carta

#### `aco_001` Arigo

- base: composicao segura
- ancora visual: trabalhador migrante, mala de lona, poeira vermelha, vila operaria em construcao
- leitura: vende memoria de chegada e migracao sem usar pessoa real identificavel
- ressalva: ainda e composicao, nao foto historica localizada
- status final: `approved_with_notes`

#### `aco_002` Operaria da Laminacao

- base: composicao segura
- ancora visual: EPI completo, laminação, chapas incandescentes, passarelas e rolos
- leitura: boa silhueta e leitura industrial; evitou sexualizacao e estetica corporativa
- ressalva: a face segue generica e contida, como planejado
- status final: `approved_with_notes`

#### `aco_003` Mestre do Alto-Forno

- base: composicao segura
- ancora visual: alto-forno monumental, trabalhador pequeno em escala, clarao laranja controlado
- leitura: talvez a carta nova mais forte do lote entre as compostas
- ressalva: ainda puxa para composicao epica, embora permaneça dentro do realismo fabril aceito
- status final: `approved_with_notes`

#### `aco_004` Cronista da Cidade Operaria

- base: arquivo historico real
- leitura: continua funcionando como memoria impressa, nao como personagem pleno
- status final: `approved_with_notes`

#### `aco_009` Turno Virado

- base: composicao segura
- ancora visual: relogio de ponto, madrugada azul, lampadas industriais e piso molhado
- leitura: vende rotina fabril e cansaco sem melodrama grotesco
- ressalva: a bolsa de lona aproxima visualmente da carta `aco_001`, mas o contexto de portaria e o relogio diferenciam bem a funcao narrativa
- status final: `approved_with_notes`

#### `aco_010` Cidade de Aco

- base: foto historica/real mantida
- leitura: segue uma das imagens mais fortes do deck
- status final: `approved_with_notes`

#### `aco_011` Sirene da Usina

- base: composicao segura
- ancora visual: sirene horn, torre metalica, fumaca controlada e fundo industrial noturno
- leitura: agora o objeto principal finalmente aparece legivel como sirene fabril
- ressalva: e uma composicao de boa leitura, mas ainda sem objeto documental especifico rastreado dentro da UPV
- status final: `approved_with_notes`

#### `aco_012` Peso do Concreto

- base: foto historica/real mantida
- leitura: continua coerente com brutalismo e massa planejada da cidade operaria
- status final: `approved_with_notes`

### 4.3 Leitura final do lote

O Lote `02` agora esta:

- completo no frontend;
- coerente em paleta e atmosfera;
- mais forte em `aco_001`, `aco_003`, `aco_009` e `aco_011` do que estava no estado `not_generated`;
- ainda sem aprovacao plena de museu/acervo para todas as imagens, logo o lote fecha como **integrado e jogavel**, mas nao como bloco totalmente “sem notas”.

## 5. Curadoria final de `rio_006` Parque do Inga

### Decisao

Manter a imagem atual:

- arquivo mantido: `public/games/cidade-de-aco-cartas-vr/cards/rio_006-parque-do-inga.jpeg`
- status final: `approved_with_notes`

### Motivo

Nesta rodada foram comparadas tres direcoes:

1. foto oficial externa atual;
2. fotos oficiais internas/trilha com pessoas identificaveis;
3. revisoes geradas anteriores com viveiro + trilha (`v2` e `v3`).

Decisao consolidada:

- a foto oficial atual continua a mais segura do ponto de vista factual;
- as versoes geradas `v2` e `v3` leem melhor como miniatura, mas hoje conflitam com a direcao mais dura de usar foto exata dos lugares sempre que possivel;
- as fotos internas oficiais disponiveis nesta rodada traziam pessoas reais identificaveis ou leitura institucional demais.

Leitura final:

- fidelidade factual: alta
- leitura em miniatura: media
- necessidade de substituicao imediata: nao
- recomendacao futura: se aparecer foto oficial do parque com trilha/viveiro sem pessoas identificaveis, vale nova troca

## 6. Auditoria mobile

Artefatos salvos em `output/playwright/`:

- `cidade20-lote02-hand-audit.png`
- `cidade20-lote02-board-audit.png`
- `cidade20-lote02-mini-cards.png`
- `cidade20-parque-inga-audit.png`
- `cidade20-result-mobile.png`

Leitura das capturas:

- a mao do Lote `02` agora exibe `8` cartas com imagem;
- as novas composicoes entram na interface sem quebrar o filtro visual adotado no card;
- a miniaturizacao continua melhor para algumas cartas do que para outras, mas o lote deixou de parecer incompleto;
- o gargalo estrutural do territorio continua sendo mais de layout do que de asset, o mesmo ponto ja observado no Tijolo `19`;
- `rio_006` continua o landmark menos impactante em mini, mas sem cair em infidelidade visual.

## 7. Validacoes executadas

Comandos reexecutados:

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

## 8. Fontes publicas consultadas nesta rodada

- `Dia do Arigo`, Prefeitura de Volta Redonda:
  `https://www.voltaredonda.rj.gov.br/noticias/4958-volta-redonda-institui-%E2%80%98dia-do-arig%C3%B3%E2%80%99-no-calend%C3%A1rio-municipal/`
- `Monumentos e Obras de Arte`, Cultura VR:
  `https://cultura.voltaredonda.rj.gov.br/monumentoseobrasdearte/`
- `O Lingote`, Museu do Trabalhismo:
  `https://museudotrabalhismo.com.br/`
- `Parque do Inga`, Prefeitura de Volta Redonda:
  `https://www.voltaredonda.rj.gov.br/comunicacao/noticias/34-smma/9911-volta-redonda-evento-marca-rein%C3%ADcio-das-atividades-ambientais-no-parque-do-ing%C3%A1/`
- `Parque Natural Municipal Fazenda Santa Cecilia do Inga`, portal oficial:
  `https://www2.voltaredonda.rj.gov.br/smma/10-interno/17-parque-natural-municipal-fazenda-santa-cecilia-do-inga`
- `Vila Santa Cecilia / centro comercial`, Turismo oficial:
  `https://www2.voltaredonda.rj.gov.br/turismo/mod/centro_comercial/`
- `Nossa Historia`, Cultura VR:
  `https://cultura.voltaredonda.rj.gov.br/nossahistoria/`
- `Unidades Fabris CSN`, site oficial da CSN:
  `https://www.csn.com.br/quem-somos/grupo-csn/unidades-fabris-csn/`

## 9. Conclusao

O Tijolo 20 nao transformou o Lote `02` em um acervo historico “perfeito”, mas tirou o deck do estado parcial e o colocou em estado forte de uso real dentro do jogo. O principal ganho foi pragmatico: o baralho `Aco & Memoria` agora tem fechamento visual coerente, reconhecivel e funcional no mobile, sem aprovar imagem genérica ruim nem trocar landmark real por imagem mais bonita e menos fiel.

O estado atual de `Cidade de Aco` apos esta rodada e:

- Lote `01`: funcional com foto real
- Lote `02`: fechado e integrado com notas
- auditoria mobile: atualizada
- validacao tecnica: limpa
- proximo loop recomendado: fortalecer proveniencia exata de `aco_010` e `aco_012` e buscar, apenas se aparecer fonte melhor, uma foto oficial mais legivel para `rio_006`
