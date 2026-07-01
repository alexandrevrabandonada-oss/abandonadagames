# Cidade de Aco: Cronicas de VR

Protótipo mobile-first de card game territorial em 5 rodadas.

## Rodar

```bash
npm run dev
```

Abra:

- `/`
- `/jogar/cidade-de-aco-cartas-vr`
- `/ranking/cidade-de-aco-cartas-vr`

## Validar

```bash
npm run lint
npm run build
npm run game:validate -- cidade-de-aco-cartas-vr
```

## MVP entregue

- escolha de deck
- 3 territorios centrais
- mao inicial de 4 cartas
- compra por rodada
- Folego da Cidade por rodada
- bot simples
- influencia popular
- Cidade Viva nos territorios
- tela final com reinicio

## Arte

Artefatos de pipeline visual do baralho:

- `art-prompts.json`
- `art-prompts.pt-BR.json`
- `art-production-manifest.json`
- `art-lots/lote-01-landmarks.json`
- `art-lots/lote-02-identidade-industrial.json`
- `art-lots/lote-03-rio-bairro-cotidiano.json`
- `art-lots/lote-04-memoria-acao-coletiva.json`
- `art-lots/lote-05-crises.json`

Uso recomendado:

1. gerar `lote-01-landmarks`;
2. aprovar fidelidade local;
3. gerar `lote-02-identidade-industrial`;
4. seguir para os demais lotes usando o mesmo style guide.
