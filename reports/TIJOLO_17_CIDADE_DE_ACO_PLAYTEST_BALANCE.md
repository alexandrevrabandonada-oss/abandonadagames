# Relatório do Tijolo 17: Cidade de Aço

## 1. Resumo executivo
O Tijolo 17 transformou `Cidade de Aço: Crônicas de VR` de um protótipo funcional em uma versão mais legível, mais justa e mais convincente em mobile. O foco foi balanceamento das 24 cartas, clareza de custo e Fôlego, leitura dos territórios, reforço visual da mecânica Cidade Viva e melhoria do bot sem reescrever a arquitetura do jogo.

O resultado final preserva o loop simples do Tijolo 16, mas com decisões mais claras por rodada, decks mais distintos, feedback de derrota/vitória mais forte e uma apresentação menos técnica. As validações obrigatórias passaram em `2026-06-29`: `npm run game:validate -- cidade-de-aco-cartas-vr`, `npm run lint` e `npm run build`.

## 2. Diagnóstico inicial
Antes dos ajustes, o jogo já estava jogável, mas apresentava alguns problemas de produto:

- O bot parecia simples demais porque priorizava pouco a disputa real de território.
- O jogador não recebia feedback suficiente quando uma carta não podia ser jogada por falta de Fôlego.
- O tabuleiro ainda tinha leitura de protótipo técnico, com pouca indicação de quem estava vencendo cada ponto.
- A mecânica Cidade Viva existia, mas não aparecia com peso visual e narrativo suficiente.
- A mão de cartas precisava deixar mais explícito custo, estado de seleção e restrição de uso.
- Os decks `Aço & Memória` e `Rio & Rua` ainda podiam convergir em sensação de jogo se o bot ou a rodada não reagissem bem.

Também foram revisadas as capturas antigas em `output/playwright/cidade-home-mobile.png`, `cidade-intro-mobile.png`, `cidade-play-mobile.png` e `cidade-result-mobile.png` para comparar o ganho de legibilidade e presença visual.

## 3. Mudanças de balanceamento
Foram feitos ajustes pontuais em custo e força para reduzir extremos e dar identidade melhor aos dois decks:

- `aco_005` Obelisco da Praça Brasil: custo `2 -> 3`
- `aco_008` Greve de 1988: custo `2 -> 3`, força `2 -> 1`
- `aco_011` Sirene da Usina: força `3 -> 2`
- `aco_012` Peso do Concreto: força `4 -> 3`
- `rio_003` Catador do PEV: força `2 -> 3`
- `rio_006` Parque do Ingá: custo `3 -> 2`
- `rio_010` Mutirão de Bairro: força `2 -> 1`
- `rio_011` Defesa do Paraíba: custo `2 -> 1`

Efeito prático dos ajustes:

- `Aço & Memória` continua sendo o deck mais pesado e territorial, mas perdeu parte do atropelo inicial.
- `Rio & Rua` ganhou mais consistência para recuperação e disputa tática sem virar deck fraco.
- Cartas caras passaram a ter impacto mais justificável.
- O começo de partida ficou menos automático para qualquer lado.

## 4. Mudanças visuais
O visual foi aproximado da direção “Concreto Zen / card game premium” pedida no prompt:

- HUD superior redesenhado com blocos fortes para `você`, `rodada` e `bot`.
- Medidor de `Fôlego da Cidade` reconstruído com leitura imediata e contraste melhor.
- Territórios viraram cards horizontais maiores, com saldo `jogador x bot`, faixa de liderança e selo mais visível de Cidade Viva.
- Cartas da mão ganharam badges mais claros de custo e força, chips de estado e contraste melhor entre jogável e não jogável.
- Tela final passou a ter narrativa curta, resumo final da partida e card de resultado mais convincente.
- Mensagens de abertura, resolução e resultado ficaram mais presentes para dar clima e retenção.

## 5. Mudanças de UX
Os principais ajustes mobile-first foram:

- Carta sem Fôlego suficiente agora continua clicável para explicar o bloqueio, em vez de apenas parecer morta.
- A mão mostra texto direto de estado: `custa X` ou `sem folego: precisa de X`.
- O jogo informa claramente `Folego insuficiente. Esta carta custa X nesta rodada.`
- Cada território agora mostra quem está na frente: `voce na frente por X`, `bot na frente por X` ou `territorio empatado`.
- Ao selecionar uma carta, o território mostra o hint de ação: `jogar por X de folego` ou `faltam X de folego`.
- O botão `Encerrar turno` ficou maior e mais fácil de alcançar no mobile.
- O resumo da mão passou a mostrar `baralho restante` e `cartas jogadas`, reduzindo confusão de ritmo.

## 6. Mudanças no bot
O bot deixou de escolher apenas a primeira jogada possível e passou a usar uma heurística simples de prioridade:

- tenta jogar onde está perdendo;
- valoriza virar território quando consegue;
- evita desperdiçar carta forte onde já está muito à frente;
- passa a considerar melhor crise, ação coletiva e limpeza de crise;
- reage melhor quando o território já foi melhorado para o jogador.

Na prática, isso deixou o bot mais convincente e ainda vencível, sem adicionar complexidade desnecessária.

## 7. Arquivos alterados
Arquivos de jogo alterados neste tijolo:

- `games/catalog/cidade-de-aco-cartas-vr/cards.json`
- `src/components/games/CidadeDeAcoCardGame.tsx`
- `src/components/games/cidade-de-aco/CidadeDeAcoCardView.tsx`
- `src/components/games/cidade-de-aco/CidadeDeAcoTerritoryView.tsx`

Artefatos e evidências gerados:

- `output/playwright/cidade17-home-mobile.png`
- `output/playwright/cidade17-intro-mobile.png`
- `output/playwright/cidade17-play-mobile.png`
- `output/playwright/cidade17-result-mobile.png`
- `output/playwright/cidade17-play-mobile-recheck.png`
- `output/playwright/cidade17-result-mobile-round5.png`

## 8. Validações executadas
Validações obrigatórias executadas com sucesso em `2026-06-29`:

```bash
npm run game:validate -- cidade-de-aco-cartas-vr
npm run lint
npm run build
```

Também foi feita validação visual mobile com Playwright em `localhost`, porque o Browser plugin não estava disponível nesta thread.

## 9. Resultados dos testes
Checklist obrigatório do prompt:

1. Jogador escolhe `Aço & Memória`: aprovado.
2. Jogador escolhe `Rio & Rua`: aprovado.
3. Partida chega até a rodada 5: aprovado.
4. Jogador vence: aprovado.
5. Jogador perde: aprovado.
6. Botão reiniciar funciona: aprovado.
7. Carta sem Fôlego suficiente não é jogada: aprovado.
8. Bot consegue jogar: aprovado.
9. Cidade Viva ativa: aprovado.
10. Tela mobile continua legível: aprovado.

Evidência consolidada dos playtests:

- Bateria principal de Playwright gerou `cidade17-home-mobile.png`, `cidade17-intro-mobile.png`, `cidade17-play-mobile.png` e `cidade17-result-mobile.png`.
- Nessa bateria houve seleção dos dois decks, cenário de derrota, cenário de vitória, reinício funcional e ativação de Cidade Viva.
- Revalidação final em servidor limpo `http://localhost:3005/jogar/cidade-de-aco-cartas-vr` confirmou:
  - título correto da página;
  - tela não vazia;
  - ausência de overlay de framework;
  - ausência de erros de console relevantes;
  - feedback explícito de Fôlego insuficiente;
  - partida encerrando na `Rodada 5`.

Observação técnica:

- Durante a rechecagem, o servidor antigo em `localhost:3004` apresentou `500` em um chunk `/_next/static/...js` após rebuild. O problema foi contornado ao subir um `next start` limpo em `localhost:3005`, que serviu a versão final corretamente para a validação visual.

## 10. Pendências para o Tijolo 18
- Verificar por que alguns cenários de rodada mostram influência do bot sem sempre expor a pressão rival com a força visual esperada nos chips do território.
- Considerar uma animação ainda mais clara para transição de `Cidade Viva`, aproveitando o momento de upgrade como pico de recompensa.
- Refinar ainda mais a heurística do bot para leitura de crise versus economia de carta forte no fim de partida.
- Medir se a duração média real cai na faixa de `3 a 5 minutos` com jogadores humanos, não apenas em automação.
- Avaliar uma passada extra de microcopy nas cartas para encurtar alguns efeitos sem perder clareza.

Conclusão: o jogo continua simples, mas agora está mais bonito, mais claro, mais equilibrado, mais mobile e mais próximo de um produto jogável de campanha do que de um protótipo técnico.
