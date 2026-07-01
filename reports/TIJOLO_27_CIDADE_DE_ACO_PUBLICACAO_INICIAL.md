# Relatorio do Tijolo 27: Cidade de Aco

Data da verificacao: `2026-07-01`

## 1. Resumo executivo

O Tijolo `27` preparou `Cidade de Aco: Cronicas de VR` para uma publicacao inicial controlada.

Fechamento desta rodada:

- a apresentacao publica do jogo foi enxugada e reforcada para parecer convite jogavel, nao manifesto antes da partida;
- `Cidade de Aco` subiu para destaque do portal durante a janela de lancamento;
- o jogo ganhou `cover.jpg` e `social-card.jpg` usando cartas e fotos reais ja aprovadas;
- o catalogo e a rota do jogo passaram a usar capa, CTA e metadados sociais proprios;
- o fluxo final foi revisado em producao local com console limpo, replay funcionando, ranking acessivel e share/copy validado em ambiente de teste;
- o playtest externo com `2` ou `3` pessoas foi preparado, mas nao executado nesta rodada.

Leitura objetiva:

- o jogo esta pronto para ser enviado a um grupo pequeno com link e textos de divulgacao;
- ainda nao recomendo abrir em publico amplo sem antes rodar o playtest externo curto.

## 2. Alteracoes na apresentacao publica

Arquivos principais ajustados:

- `games/catalog/cidade-de-aco-cartas-vr/game.json`
- `src/lib/gameRegistry.ts`
- `src/lib/gamePresentation.ts`
- `src/app/page.tsx`
- `src/app/jogar/[slug]/page.tsx`
- `src/components/games/CidadeDeAcoCardGame.tsx`

Mudancas aplicadas:

- `tagline` nova:
  - `Segure Volta Redonda viva entre aco, rio, memoria e disputa.`
- `summary` nova:
  - foco em territorio, Folego e decisao rapida;
- `subtitle` publico:
  - `Aco & Memoria vs Rio & Rua`;
- CTA especifico do portal:
  - `Segurar a cidade`;
- `sharePrompt` do jogo:
  - `Sera que voce segura Volta Redonda melhor?`;
- `tags` curtas para catalogo:
  - `aco & memoria`
  - `rio & rua`
  - `5 rodadas`
  - `mobile`
- imagem de capa do catalogo:
  - `public/games/cidade-de-aco-cartas-vr/cover.jpg`
- imagem social:
  - `public/games/cidade-de-aco-cartas-vr/social-card.jpg`
- metadata da rota:
  - `openGraph` e `twitter` agora usam a imagem social do jogo;
- destaque do portal:
  - `Cidade de Aco` passou a aparecer em primeiro no portal para a janela de lancamento controlado.

## 3. Kit de divulgacao criado

### Chamada interna no portal

`Segure Volta Redonda viva entre aco, rio, memoria e disputa.`

### Post de Instagram

`Cidade de Aco: Cronicas de VR ja esta no portal. Escolha entre Aco & Memoria e Rio & Rua, ocupe territorios e tente segurar Volta Redonda viva em 5 rodadas. Joga e me diz: voce segura a cidade melhor?`

### Story

`Aco ou rio?`

`5 rodadas para segurar VR viva. Jogue agora.`

### WhatsApp

`Saiu Cidade de Aco: Cronicas de VR. E um card game rapido sobre territorio, memoria, rio e pressao urbana em Volta Redonda. Joguei com o deck Rio & Rua, mas quero ver se voce segura a cidade melhor: https://www.abandonadagames.online/jogar/cidade-de-aco-cartas-vr`

### Legenda para video curto

`Escolhe um deck, ocupa territorio, segura a Cidade Viva e tenta fechar Volta Redonda na frente. Cidade de Aco ja esta no portal.`

### Texto curto de compartilhamento do jogo

Direcao implementada no fluxo:

`Teste VR jogou Cidade de Aco: Cronicas de VR com o deck Rio & Rua e terminou com X de Cidade Viva em 5 rodadas. Sera que voce segura Volta Redonda melhor?`

## 4. Capa e imagem social

Arquivos gerados:

- `public/games/cidade-de-aco-cartas-vr/cover.jpg`
- `public/games/cidade-de-aco-cartas-vr/social-card.jpg`

Direcao usada:

- composicao com fotos reais ja integradas no baralho;
- contraste entre `Aco & Memoria` e `Rio & Rua`;
- tipografia grande e legivel;
- atmosfera de card game urbano, sem visual corporativo;
- CTA curto e direto.

Selecao visual principal:

- `aco_006` Chamine Antiga
- `aco_008` Greve de 1988
- `rio_001` Curva do Paraiba
- `rio_008` Cinema 9 de Abril

## 5. Roteiro de video ou GIF curto

Roteiro preparado para captura de `10` a `20` segundos:

1. abrir o portal com `Cidade de Aco` em destaque;
2. entrar no jogo;
3. mostrar a escolha de deck;
4. selecionar uma carta;
5. jogar no territorio;
6. mostrar o resultado final;
7. fechar com `jogue agora`.

Ritmo recomendado:

- `2s` portal/capa;
- `3s` escolha de deck;
- `4s` jogada e microfeedback;
- `4s` resultado compartilhavel;
- `2s` chamada final.

## 6. Playtest externo

Status real:

- nao executado nesta rodada;
- nao foram inventados resultados.

Roteiro preparado para `2` ou `3` pessoas em celular real:

1. entendeu o objetivo sem explicacao externa?
2. conseguiu escolher deck por curiosidade propria?
3. entendeu Folego?
4. conseguiu jogar a primeira carta?
5. terminou a partida?
6. quis jogar de novo?
7. quis compartilhar?
8. onde travou?

Planilha minima sugerida:

| Participante | Aparelho | Entendeu objetivo | Entendeu Folego | Terminou partida | Quis replay | Quis compartilhar | Onde travou |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P1 |  |  |  |  |  |  |  |
| P2 |  |  |  |  |  |  |  |
| P3 |  |  |  |  |  |  |  |

## 7. Checklist final

### Checklist tecnico

- mobile pequeno: OK
- mobile medio: OK
- desktop: OK
- carregamento das imagens: OK
- share/copy funcionando em ambiente de teste: OK
- replay funcionando: OK
- ranking acessivel: OK
- build de producao local: OK
- console em producao local: OK, `0` erros na checagem final

### Observacoes

- o share nativo foi validado com simulacao de sucesso no navegador de teste para permitir captura estavel do fluxo final;
- o fluxo real do jogo continua com Web Share API e fallback para copia de texto.

## 8. Prints finais

Arquivos gerados:

- `output/playwright/cidade27-catalog-card.png`
- `output/playwright/cidade27-game-start.png`
- `output/playwright/cidade27-social-result.png`
- `output/playwright/cidade27-mobile-final-check.png`

Leitura dos prints:

- `cidade27-catalog-card.png`
  - mostra a carta do catalogo com capa, CTA e tags novas;
- `cidade27-game-start.png`
  - mostra o primeiro gesto acionavel: a escolha de deck;
- `cidade27-social-result.png`
  - mostra resultado compartilhavel, CTA final e toast de confirmacao;
- `cidade27-mobile-final-check.png`
  - mostra ranking acessivel em mobile na build de producao local.

## 9. Validacoes

Comandos executados:

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

Validacao adicional:

- auditoria Playwright em `http://localhost:3010`: OK
- console final sem erros: OK

## 10. Recomendacao objetiva

Recomendacao final:

`publicar controlado`

Justificativa:

- a apresentacao publica esta pronta;
- o jogo ja tem capa, imagem social, copy curta e fluxo tecnico limpo;
- o portal e a rota especifica do jogo estao coerentes para divulgacao;
- falta apenas o playtest externo curto com `2` ou `3` pessoas para liberar com mais confianca uma abertura maior.

Proximo passo recomendado:

1. enviar para grupo pequeno com link e um dos textos do kit;
2. rodar o roteiro externo em celular real;
3. registrar travas reais;
4. decidir se abre publicamente ou se faz um ultimo ajuste fino de onboarding/copy.
