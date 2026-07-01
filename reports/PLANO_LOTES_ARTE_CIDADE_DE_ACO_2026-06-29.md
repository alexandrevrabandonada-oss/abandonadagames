# Plano de Lotes de Arte: Cidade de Aco

Data: `2026-06-29`

## Objetivo
Organizar a geracao e revisao das 24 artes de carta em lotes menores, priorizando landmarks reais e cartas que mais vendem a identidade de Volta Redonda.

## Regra de uso
- Gerar primeiro os landmarks reais e validar fidelidade local.
- Depois gerar personagens e acoes coletivas com base nesses landmarks.
- Deixar as crises por ultimo, porque dependem da paleta e do tom final das demais cartas.

## Lote 1: landmarks obrigatorios
Essas cartas definem a assinatura visual do jogo. Devem ser as primeiras a serem geradas e revisadas.

- `aco_005` Obelisco da Praca Brasil
- `aco_006` Chamine Antiga
- `aco_007` Memorial 9 de Novembro
- `rio_006` Parque do Inga
- `rio_007` Memorial Zumbi
- `rio_008` Cinema 9 de Abril

Meta do lote:
- comprovar que o pipeline consegue reproduzir landmarks reais de Volta Redonda;
- fechar textura, luz e nivel de realismo do jogo;
- usar esse lote como benchmark para os proximos.

## Lote 2: identidade industrial
Esse lote vende a ideia de Cidade do Aco e o peso historico da cidade operaria.

- `aco_001` Arigo
- `aco_002` Operaria da Laminacao
- `aco_003` Mestre do Alto-Forno
- `aco_004` Cronista da Cidade Operaria
- `aco_009` Turno Virado
- `aco_010` Cidade de Aco
- `aco_011` Sirene da Usina
- `aco_012` Peso do Concreto

Meta do lote:
- fechar rosto, figurino, EPI, luz industrial e atmosfera de concreto;
- evitar caricatura ou ficcao cientifica.

## Lote 3: rio, bairro e cotidiano
Esse lote amplia a cidade para fora da usina e reforca a parte social e ambiental do deck `Rio & Rua`.

- `rio_001` Curva do Paraiba
- `rio_002` Guardia do Rio
- `rio_003` Catador do PEV
- `rio_004` Menino do Retiro
- `rio_009` Roda de Escuta
- `rio_010` Mutirao de Bairro
- `rio_011` Defesa do Paraiba

Meta do lote:
- firmar vida urbana, bairro, rio e coleta como identidade visual clara;
- evitar cena generica de ONG ou paisagem fluvial sem cara de Volta Redonda.

## Lote 4: memoria e acao coletiva
Essas cartas dependem do tom visual dos lotes anteriores para amarrar ficcao jogavel com base historica.

- `aco_008` Greve de 1988
- `rio_005` Mestra da Capoeira

Meta do lote:
- garantir energia de movimento e coletividade;
- preservar dignidade historica e cultural sem estetizar demais o conflito.

## Lote 5: crises
As crises devem sair por ultimo para absorver a linguagem consolidada dos outros lotes.

- `rio_012` Chuva de Po

Meta do lote:
- fechar o vocabulario visual de perigo do jogo;
- usar vermelho e contraste forte so onde fizer sentido;
- manter crise urbana real, nao fantasia sobrenatural.

## Checklist de revisao por carta
Antes de aprovar uma arte:

1. O landmark ou contexto parece Volta Redonda e nao uma cidade genrica?
2. O primeiro plano continua legivel no crop vertical da carta?
3. A paleta respeita a divisao entre aco, rio, verde, memoria e crise?
4. O fundo ajuda a carta ou virou ruido?
5. O material parece concreto, metal, po, tijolo, agua ou tecido de verdade?
6. A carta conversa com a pesquisa visual e com o prompt final aprovado?

## Arquivos prontos para o pipeline
- `games/catalog/cidade-de-aco-cartas-vr/art-prompts.json`
- `games/catalog/cidade-de-aco-cartas-vr/art-prompts.pt-BR.json`
- `reports/PESQUISA_REFERENCIAS_VISUAIS_CIDADE_DE_ACO_2026-06-29.md`

## Recomendacao
Se o time for gerar imagens agora, comece por `Lote 1` e `Lote 2`. Sao os lotes com maior impacto na identidade do jogo e os que mais ajudam a calibrar o resto do baralho.
