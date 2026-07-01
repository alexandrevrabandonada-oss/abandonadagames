# Fechamento dos Lotes de Arte: Cidade de Aco

Data: `2026-06-29`

## Status geral
Todos os lotes de arte de `Cidade de Aco: Cronicas de VR` foram fechados no nivel de planejamento e preparo de pipeline.

Status adotado:

- `closed_planning_ready_for_generation`

Isso significa:

- prompts finais em ingles e portugues existem;
- todas as 24 cartas possuem atribuicao de lote;
- todos os lotes possuem arquivo proprio;
- o manifest consolidado cobre o baralho inteiro;
- a ordem de geracao e revisao esta documentada;
- o catalogo ficou pronto para consumo por pipeline de geracao de imagem.

## Evidencia objetiva

- `art-prompts.json`: `24` cartas
- `art-prompts.pt-BR.json`: `24` cartas
- `art-production-manifest.json`: `24` cartas
- `art-lots/`: `5` arquivos de lote
- cobertura dos lotes: `24` ids
- ids unicos nos lotes: `24`
- ids faltantes em relacao ao manifest: `nenhum`
- ids extras em relacao ao manifest: `nenhum`

## Arquivos finais

- `games/catalog/cidade-de-aco-cartas-vr/art-prompts.json`
- `games/catalog/cidade-de-aco-cartas-vr/art-prompts.pt-BR.json`
- `games/catalog/cidade-de-aco-cartas-vr/art-production-manifest.json`
- `games/catalog/cidade-de-aco-cartas-vr/art-lots/lote-01-landmarks.json`
- `games/catalog/cidade-de-aco-cartas-vr/art-lots/lote-02-identidade-industrial.json`
- `games/catalog/cidade-de-aco-cartas-vr/art-lots/lote-03-rio-bairro-cotidiano.json`
- `games/catalog/cidade-de-aco-cartas-vr/art-lots/lote-04-memoria-acao-coletiva.json`
- `games/catalog/cidade-de-aco-cartas-vr/art-lots/lote-05-crises.json`
- `reports/PESQUISA_REFERENCIAS_VISUAIS_CIDADE_DE_ACO_2026-06-29.md`
- `reports/PLANO_LOTES_ARTE_CIDADE_DE_ACO_2026-06-29.md`

## Ordem recomendada de execucao

1. `lote-01-landmarks`
2. `lote-02-identidade-industrial`
3. `lote-03-rio-bairro-cotidiano`
4. `lote-04-memoria-acao-coletiva`
5. `lote-05-crises`

## Observacao
O fechamento realizado aqui e de pipeline e direcao de arte. A proxima etapa, se desejada, e a geracao efetiva das imagens e a revisao visual carta a carta contra os landmarks e criterios de crop mobile.
