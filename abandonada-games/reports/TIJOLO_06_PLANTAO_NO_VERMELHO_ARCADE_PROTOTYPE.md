# Tijolo 06 - Plantao no Vermelho Arcade Prototype

## Diagnostico inicial

- A plataforma ja tinha dois jogos em canvas: `Fila Invisivel` e `Corrida do Onibus Zero`.
- A rota dinamica `/jogar/[slug]` selecionava `QueueChaosGame` e `OnibusZeroGame`.
- O catalogo em `games/catalog` alimentava home, rotas estaticas e validador.
- A API mock de score e ranking estava pronta para novo slug.
- Os padroes de melhor score local, card PNG e Web Share/fallback ja estavam validados nos jogos anteriores.

## Arquivos criados

- `games/catalog/plantaono-vermelho/game.json`
- `src/components/games/PlantaoNoVermelhoGame.tsx`
- `reports/TIJOLO_06_PLANTAO_NO_VERMELHO_ARCADE_PROTOTYPE.md`

## Arquivos modificados

- `src/app/jogar/[slug]/page.tsx`
- `src/app/page.tsx`

## Gameplay implementado

- Novo jogo funcional em `/jogar/plantaono-vermelho`.
- Arcade survival em canvas, mobile-first.
- Personagem controlavel por arraste/toque, botoes grandes e teclado.
- Objetos ruins caem como boletos/contas.
- Objetos bons e power-ups caem como apoios.
- Dia do mes avanca ate o Dia 30.
- A pressao aumenta com o tempo e com o caos.
- Fim de partida por Dia 30, folego zerado, contas em 100% ou caos em 100%.

## HUD

- Dia do mes.
- Folego.
- Caos.
- Contas.
- Combo.
- Score.
- Status fixo: `Salario: atrasado`.

## Objetos bons e ruins

- Bons: marmita, carona, apoio dos colegas, vaquinha, bico honesto, descanso, organizacao coletiva, pix simbolico, feira barata e remedio garantido.
- Ruins: aluguel, luz, mercado caro, farmacia, transporte, juros, cobranca, cartao estourado, plantao exaustivo, geladeira vazia, salario nao caiu e boleto surpresa.

## Power-ups

- `Mutirao`: limpa parte dos boletos visiveis.
- `Marmita garantida`: recupera folego.
- `Carona`: reduz contas.
- `Apoio dos colegas`: reduz caos e sustenta combo.
- `Organizacao`: congela parte do efeito dos juros por alguns segundos.

## Eventos surpresa

- Eventos curtos aparecem no topo/rodape do gameplay como microfrases.
- Alguns eventos aumentam contas/caos.
- Eventos positivos podem gerar power-up.

## Sistema de caos

- Objetos ruins aumentam caos.
- Juros e dias passando pressionam o caos.
- Apoios e organizacao reduzem caos.
- Em caos alto, a tela treme quando ha impacto.

## Sistema de folego

- Folego cai com o passar dos dias.
- Objetos ruins reduzem folego.
- Marmita, descanso e apoios recuperam folego.
- Folego zerado encerra a rodada.

## Sistema de contas

- Contas sobem com dias passando e impactos negativos.
- Apoios reduzem contas.
- Boletos desviados viram score pequeno.
- Contas em 100% encerram a partida.

## Rank

- D: `O mes venceu.`
- C: `Sobreviveu no sufoco.`
- B: `Segurou a onda.`
- A: `Virou o mes de pe.`
- S: `Mutirao salvou geral.`

## Card compartilhavel

- Card PNG local gerado via canvas no frontend.
- Contem titulo, subtitulo, rank, dias sobrevividos, apoios coletados, caos final, score, frase `O boleto veio, mas a gente resistiu.` e chamada `Jogue tambem`.
- Preview aparece na tela final.

## Ranking e localStorage

- Score final e enviado para `POST /api/score/submit`.
- Melhor score local salvo em `abandonada:plantaono-vermelho:best-score`.
- Nome local salvo em `abandonada:plantaono-vermelho:player-name`.
- Rota `/ranking/plantaono-vermelho` funciona pelo ranking mock existente.

## Testes executados

- `npm run lint`
- `npm run build`
- `npm run game:validate -- plantaono-vermelho`
- `npm run game:validate -- fila-invisivel`
- `npm run game:validate -- onibus-zero`
- `GET http://localhost:3050/jogar/plantaono-vermelho` retornou `200`.
- `GET http://localhost:3050/ranking/plantaono-vermelho` retornou `200`.
- `GET http://localhost:3050/jogar/fila-invisivel` retornou `200`.
- `GET http://localhost:3050/jogar/onibus-zero` retornou `200`.

## Erros encontrados

- Nenhum erro de lint ou build apos a primeira implementacao.
- A validacao de rotas foi feita com `npm.cmd` para evitar bloqueio de politica de execucao do `npm.ps1` no PowerShell.

## Erros corrigidos

- A rota dinamica foi atualizada para selecionar `PlantaoNoVermelhoGame` por slug `plantaono-vermelho` ou template `salary-survival`.
- A home foi atualizada para reconhecer o genero `arcade survival`.

## Pendencias

- Playtest real em celular para calibrar densidade de objetos e area de colisao.
- Refinar arte do personagem e dos boletos em um passe visual dedicado.
- Extrair utilitarios compartilhados para card PNG, rank e localStorage.
- Criar testes automatizados de smoke visual quando houver infraestrutura.

## Proximo prompt recomendado

`Voce e o agente ArcadeTrioPolisher do projeto Abandonada Games Web/PWA. Faça um passe visual e de balanceamento nos tres jogos, compare ritmo e retenção, padronize componentes de tela final/card compartilhavel e mantenha lint/build passando.`
